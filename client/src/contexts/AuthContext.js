import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TokenStorage, ApiSecurity, SessionSecurity, ErrorSecurity } from '../utils/security';

const AuthContext = createContext();

// Set up axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    // Get token for current role
    const currentRole = TokenStorage.getCurrentRole();
    const token = TokenStorage.getToken(currentRole);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Detect FormData to avoid setting incorrect Content-Type
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    const secureHeaders = ApiSecurity.getSecureHeaders(isFormData ? null : 'application/json');

    // Merge secure headers
    config.headers = { ...config.headers, ...secureHeaders };

    // For FormData requests, allow the browser/axios to set proper multipart boundary automatically
    if (isFormData && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    // Validate response security
    ApiSecurity.validateResponse(response);
    return response;
  },
  (error) => {
    // Log error securely
    ErrorSecurity.logError(error, 'API Request');
    
    if (error.response?.status === 401) {
      SessionSecurity.clearSession();
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Validate session security
        if (!SessionSecurity.validateSession()) {
          SessionSecurity.clearSession();
          setUser(null);
          return;
        }
        
        const token = TokenStorage.getToken();
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          await axios.get('/api/users/profile');
        }
      } catch (error) {
        // Token is invalid, clear storage
        SessionSecurity.clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Set up session timeout
    const cleanupTimeout = SessionSecurity.setupSessionTimeout();
    
    return cleanupTimeout;
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      
      const { token, user: userData } = response.data;
      
      // Store token and user data securely with role
      TokenStorage.setToken(token, userData.role);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      toast.success('Welcome back!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', payload);

      const { token, user: userData } = response.data;

      // Store token and user data securely with role
      TokenStorage.setToken(token, userData.role);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      toast.success('Registration successful!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    SessionSecurity.clearSession();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return null;
    }
  };

  // Email verification function
  const verifyEmail = async (token) => {
    try {
      const response = await axios.post('/api/auth/verify-email', { token });
      
      if (response.data.success) {
        // Fetch the latest user profile to ensure state is synchronized
        try {
          const profileResponse = await axios.get('/api/users/profile');
          const updatedUser = profileResponse.data.user;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (profileError) {
          // Fallback to local update if profile fetch fails
          const updatedUser = { ...user, isEmailVerified: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        toast.success('Email verified successfully!');
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Resend verification email function
  const resendVerificationEmail = async () => {
    try {
      const response = await axios.post('/api/auth/resend-verification');
      
      if (response.data.success) {
        toast.success('Verification email sent! Please check your inbox.');
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Helper: check if current user is admin (used by Navbar and others)
  const isAdmin = () => {
    return (user?.role === 'admin') || (TokenStorage.getCurrentRole() === 'admin');
  };

  // Helper: check if current user's email is verified
  const isEmailVerified = () => {
    return user?.isEmailVerified === true;
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    updateUser,
    verifyEmail,
    resendVerificationEmail,
    isAdmin,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;