const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header received:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Token after Bearer removal:', token);
    console.log('Token length:', token ? token.length : 'null');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      kyc: user.kyc,
      isEmailVerified: user.isEmailVerified
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Admin authorization middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Merchant authorization middleware
const merchantAuth = (req, res, next) => {
  if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Merchant privileges required.'
    });
  }
  next();
};

// KYC verification middleware
const kycVerified = (req, res, next) => {
  if (req.user.kyc.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required. Please complete your verification process.',
      kycStatus: req.user.kyc.status
    });
  }
  next();
};

// Email verification middleware
const emailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.'
    });
  }
  next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (user && user.isActive && !user.isLocked) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        kyc: user.kyc,
        isEmailVerified: user.isEmailVerified
      };
    }
    
    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

// API key authentication middleware (for API access)
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Check if it's a public or secret key
    const isPublicKey = apiKey.startsWith('pk_');
    const isSecretKey = apiKey.startsWith('sk_');
    
    if (!isPublicKey && !isSecretKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key format'
      });
    }

    // Find user by API key
    const user = await User.findOne({
      $or: [
        { 'apiKeys.publicKey': apiKey },
        { 'apiKeys.secretKey': apiKey }
      ]
    }).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // Check if user is active and KYC approved
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated'
      });
    }

    if (user.kyc.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required'
      });
    }

    // Add user and API key type to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      kyc: user.kyc
    };
    
    req.apiKeyType = isPublicKey ? 'public' : 'secret';
    
    next();
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in API authentication'
    });
  }
};

// Rate limiting by user ID
const userRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return next();
    
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    next();
  };
};

module.exports = {
  auth,
  adminAuth,
  merchantAuth,
  kycVerified,
  emailVerified,
  optionalAuth,
  apiKeyAuth,
  userRateLimit
};