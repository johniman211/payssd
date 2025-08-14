const User = require('../models/User');

// Email verification middleware
const requireEmailVerification = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get fresh user data to ensure we have the latest verification status
    const user = await User.findById(req.user.id).select('isEmailVerified email');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        data: {
          email: user.email,
          requiresEmailVerification: true
        }
      });
    }

    // Update req.user with latest verification status
    req.user.isEmailVerified = user.isEmailVerified;
    
    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification check'
    });
  }
};

module.exports = {
  requireEmailVerification
};