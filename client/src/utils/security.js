/**
 * Security utilities for PaySSD client
 * Provides security-related functions and configurations
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", process.env.REACT_APP_API_URL || 'http://localhost:5000'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Secure token storage utilities with role-based separation
export const TokenStorage = {
  // Store token securely with role-specific key
  setToken: (token, role = null) => {
    if (!token) return;
    
    // Determine role from token if not provided
    let userRole = role;
    if (!userRole) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userRole = payload.user?.role || 'merchant';
      } catch (error) {
        console.warn('Could not determine role from token, defaulting to merchant');
        userRole = 'merchant';
      }
    }
    
    // Add timestamp for token expiry tracking
    const tokenData = {
      token,
      role: userRole,
      timestamp: Date.now(),
      expiresIn: 24 * 60 * 60 * 1000 // 24 hours
    };
    
    const storageKey = `authToken_${userRole}`;
    localStorage.setItem(storageKey, JSON.stringify(tokenData));
    
    // Clear other role tokens to prevent conflicts
    const otherRole = userRole === 'admin' ? 'merchant' : 'admin';
    localStorage.removeItem(`authToken_${otherRole}`);
    
    // Set current role
    localStorage.setItem('currentRole', userRole);
  },
  
  // Get token with expiry check for specific role
  getToken: (role = null) => {
    try {
      // Use provided role or get current role
      const targetRole = role || localStorage.getItem('currentRole') || 'merchant';
      const storageKey = `authToken_${targetRole}`;
      
      const tokenData = localStorage.getItem(storageKey);
      if (!tokenData) return null;
      
      const parsed = JSON.parse(tokenData);
      const now = Date.now();
      
      // Check if token data is valid
      if (!parsed.token || !parsed.timestamp || !parsed.expiresIn) {
        console.warn('Invalid token data structure, removing token');
        TokenStorage.removeToken(targetRole);
        return null;
      }
      
      // Check if token is expired (with 5 minute buffer to prevent premature expiry)
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      if (now - parsed.timestamp > (parsed.expiresIn - bufferTime)) {
        console.log('Token expired, removing from storage');
        TokenStorage.removeToken(targetRole);
        return null;
      }
      
      return parsed.token;
    } catch (error) {
      console.error('Error parsing token:', error);
      TokenStorage.removeToken(role);
      return null;
    }
  },
  
  // Remove token for specific role
  removeToken: (role = null) => {
    if (role) {
      localStorage.removeItem(`authToken_${role}`);
      if (localStorage.getItem('currentRole') === role) {
        localStorage.removeItem('currentRole');
      }
    } else {
      // Remove all tokens
      localStorage.removeItem('authToken_admin');
      localStorage.removeItem('authToken_merchant');
      localStorage.removeItem('currentRole');
      localStorage.removeItem('authToken'); // Legacy cleanup
      localStorage.removeItem('token'); // Legacy cleanup
    }
  },
  
  // Check if token exists and is valid for specific role
  isTokenValid: (role = null) => {
    return TokenStorage.getToken(role) !== null;
  },
  
  // Get current user role
  getCurrentRole: () => {
    return localStorage.getItem('currentRole') || null;
  },
  
  // Switch to different role (clears current session)
  switchRole: (newRole) => {
    const currentRole = TokenStorage.getCurrentRole();
    if (currentRole && currentRole !== newRole) {
      TokenStorage.removeToken(currentRole);
    }
    localStorage.setItem('currentRole', newRole);
  }
};

// Input sanitization utilities
export const InputSanitizer = {
  // Sanitize HTML to prevent XSS
  sanitizeHtml: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  // Sanitize for URL parameters
  sanitizeUrl: (input) => {
    if (typeof input !== 'string') return input;
    return encodeURIComponent(input);
  },
  
  // Remove potentially dangerous characters
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove script tags and other dangerous elements
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
};

// API request security utilities
export const ApiSecurity = {
  // Add security headers to requests
  getSecureHeaders: (contentType = 'application/json') => {
    const token = TokenStorage.getToken();
    const headers = {
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    // Only set Content-Type if explicitly provided
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  },
  
  // Validate API response
  validateResponse: (response) => {
    // Check for common security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    const warnings = [];
    securityHeaders.forEach(header => {
      if (!response.headers[header]) {
        warnings.push(`Missing security header: ${header}`);
      }
    });
    
    if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('Security warnings:', warnings);
    }
    
    return response;
  },
  
  // Check if URL is safe for redirects
  isSafeUrl: (url) => {
    if (!url) return false;
    
    // Only allow relative URLs or same origin
    const allowedOrigins = [
      window.location.origin,
      process.env.REACT_APP_API_URL
    ].filter(Boolean);
    
    try {
      const urlObj = new URL(url, window.location.origin);
      return allowedOrigins.includes(urlObj.origin) || url.startsWith('/');
    } catch {
      return url.startsWith('/');
    }
  }
};

// Form validation security
export const FormSecurity = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  // Validate password strength
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  },
  
  // Calculate password strength score
  calculatePasswordStrength: (password) => {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    if (password.length >= 16) score += 1;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  },
  
  // Validate file uploads
  validateFileUpload: (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
    } = options;
    
    const errors = [];
    
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Session security utilities
export const SessionSecurity = {
  // Check for session hijacking indicators
  validateSession: () => {
    const userAgent = navigator.userAgent;
    const storedUserAgent = localStorage.getItem('userAgent');
    
    if (storedUserAgent && storedUserAgent !== userAgent) {
      console.warn('User agent mismatch detected');
      return false;
    }
    
    if (!storedUserAgent) {
      localStorage.setItem('userAgent', userAgent);
    }
    
    return true;
  },
  
  // Clear all session data
  clearSession: () => {
    TokenStorage.removeToken();
    localStorage.removeItem('user');
    localStorage.removeItem('userAgent');
    sessionStorage.clear();
  },
  
  // Set up session timeout
  setupSessionTimeout: (timeoutMs = 2 * 60 * 60 * 1000) => { // 2 hours default (increased from 30 minutes)
    let timeoutId;
    let warningTimeoutId;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      
      // Show warning 5 minutes before expiry
      const warningTime = timeoutMs - (5 * 60 * 1000);
      if (warningTime > 0) {
        warningTimeoutId = setTimeout(() => {
          const extendSession = window.confirm('Your session will expire in 5 minutes. Would you like to extend it?');
          if (extendSession) {
            resetTimeout(); // Reset the timeout if user wants to extend
          }
        }, warningTime);
      }
      
      timeoutId = setTimeout(() => {
        try {
          alert('Your session has expired. Please log in again.');
          SessionSecurity.clearSession();
          window.location.href = '/login';
        } catch (error) {
          console.error('Error during session timeout:', error);
          // Fallback: just clear session without redirect if there's an error
          SessionSecurity.clearSession();
        }
      }, timeoutMs);
    };
    
    // Reset timeout on user activity (throttled to avoid excessive calls)
    let lastActivity = 0;
    const throttleMs = 30000; // 30 seconds throttle
    
    const throttledResetTimeout = () => {
      const now = Date.now();
      if (now - lastActivity > throttleMs) {
        lastActivity = now;
        resetTimeout();
      }
    };
    
    // Reset timeout on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, throttledResetTimeout, true);
    });
    
    resetTimeout();
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.removeEventListener(event, throttledResetTimeout, true);
      });
    };
  }
};

// Error handling security
export const ErrorSecurity = {
  // Sanitize error messages for display
  sanitizeErrorMessage: (error) => {
    if (typeof error === 'string') {
      return InputSanitizer.sanitizeHtml(error);
    }
    
    if (error?.response?.data?.message) {
      return InputSanitizer.sanitizeHtml(error.response.data.message);
    }
    
    if (error?.message) {
      return InputSanitizer.sanitizeHtml(error.message);
    }
    
    return 'An unexpected error occurred';
  },
  
  // Log errors securely (without sensitive data)
  logError: (error, context = '') => {
    const sanitizedError = {
      message: error?.message || 'Unknown error',
      status: error?.response?.status,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Remove sensitive data
    delete sanitizedError.stack;
    delete sanitizedError.config;
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', sanitizedError);
    }
    
    // In production, you might want to send this to an error tracking service
    return sanitizedError;
  }
};

export default {
  CSP_CONFIG,
  TokenStorage,
  InputSanitizer,
  ApiSecurity,
  FormSecurity,
  SessionSecurity,
  ErrorSecurity
};