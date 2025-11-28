import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TokenStorage, ApiSecurity, SessionSecurity, ErrorSecurity } from '../utils/security';
import { supabase } from '../lib/supabase';

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
      // Only redirect if we're not already on login page and not during initial auth check
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login' || currentPath === '/register';
      const isPublicPage = currentPath === '/' || currentPath.startsWith('/payment') || currentPath.startsWith('/verify-email');
      
      SessionSecurity.clearSession();
      
      if (!isLoginPage && !isPublicPage) {
        toast.error('Session expired. Please log in again.');
        // Use setTimeout to prevent immediate redirect during component mounting
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
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
          console.log('Session validation failed, clearing session');
          SessionSecurity.clearSession();
          setUser(null);
          setLoading(false);
          return;
        }
        
        const token = TokenStorage.getToken();
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            // Verify token is still valid with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            await axios.get('/api/users/profile', {
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
          } catch (profileError) {
            console.log('Profile verification failed:', profileError.message);
            // If profile check fails, still keep user logged in but log the error
            // Only clear session if it's a 401 (handled by interceptor)
            if (profileError.response?.status !== 401) {
              console.warn('Profile check failed but keeping user logged in');
            }
          }
        } else {
          console.log('No token or saved user found');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Only clear session for specific errors, not network issues
        if (error.response?.status === 401 || error.name === 'AbortError') {
          SessionSecurity.clearSession();
          setUser(null);
        }
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
      if (supabase && user?.email) {
        const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
        if (error) throw error;
        toast.success('Verification email sent! Please check your inbox.');
        return { success: true, message: 'Verification email sent via Supabase' };
      }
      const response = await axios.post('/api/auth/resend-verification');
      if (response.data.success) {
        toast.success('Verification email sent! Please check your inbox.');
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.message || error.response?.data?.message || 'Failed to resend verification email';
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
    try {
      const confirmed = user?.email_confirmed_at || user?.isEmailVerified;
      return !!confirmed;
    } catch (_) {
      return true; // Do not block UI if status unknown
    }
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
