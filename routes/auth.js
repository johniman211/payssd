const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many authentication attempts, please try again later.' }
});

// Mock Email Service for development
class MockEmailService {
  async sendMail(mailOptions) {
    console.log('[MOCK EMAIL] Email would be sent:');
    console.log(`[MOCK EMAIL] To: ${mailOptions.to}`);
    console.log(`[MOCK EMAIL] Subject: ${mailOptions.subject}`);
    console.log(`[MOCK EMAIL] From: ${mailOptions.from}`);
    
    return {
      messageId: 'mock_' + Date.now(),
      response: 'Mock email sent successfully'
    };
  }
}

// Email transporter setup
const createEmailTransporter = () => {
  // Resolve credentials from either EMAIL_* or SMTP_* env vars
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  const hasCredentials = !!(host && user && pass);
  if (!hasCredentials) {
    return new MockEmailService();
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587/25
    auth: { user, pass }
  });
};

const transporter = createEmailTransporter();

// @route   POST /api/auth/register
// @desc    Register a new merchant
// @access  Public
router.post('/register', [
  // Validation middleware
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('phoneNumber')
    .matches(/^\+211[0-9]{9}$/)
    .withMessage('Please provide a valid South Sudan phone number (+211XXXXXXXXX)'),
  body('city')
    .isIn(['Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Bentiu', 'Bor', 'Torit', 'Rumbek', 'Kuajok'])
    .withMessage('Please select a valid city in South Sudan'),
  body('confirmSouthSudan')
    .equals('true')
    .withMessage('You must confirm that you are based in South Sudan')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      businessName,
      businessType,
      city,
      confirmSouthSudan
    } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ 
      $or: [
        { email },
        { 'profile.phoneNumber': phoneNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName,
        phoneNumber,
        businessName,
        businessType: businessType || 'individual',
        address: {
          city,
          country: 'South Sudan'
        }
      },
      emailVerificationToken,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await user.save();

    // Generate API keys for the merchant
    await user.generateApiKeys();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to PaySSD - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to PaySSD!</h2>
            <p>Hello ${firstName},</p>
            <p>Thank you for joining PaySSD, South Sudan's premier payment gateway platform.</p>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>Next steps:</p>
            <ol>
              <li>Complete your KYC verification</li>
              <li>Create your first payment link</li>
              <li>Start accepting payments from customers across South Sudan</li>
            </ol>
            <p>If you have any questions, contact our support team at ${process.env.SUPPORT_EMAIL}</p>
            <p>Best regards,<br>The PaySSD Team</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        kyc: user.kyc,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    user.ipAddress = req.ip;
    user.userAgent = req.get('User-Agent');
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        kyc: user.kyc,
        isEmailVerified: user.isEmailVerified,
        balance: user.balance,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'PaySSD - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Email Verification</h2>
            <p>Hello ${user.profile.firstName},</p>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>If you didn't request this verification email, please ignore this message.</p>
            <p>Best regards,<br>The PaySSD Team</p>
          </div>
        `
      });
      
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
      
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resend verification'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'PaySSD - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>Hello ${user.profile.firstName},</p>
            <p>You requested a password reset for your PaySSD account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The PaySSD Team</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;