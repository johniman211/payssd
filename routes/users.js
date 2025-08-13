const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, merchantAuth } = require('../middleware/auth');
const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -apiKeys.secretKey')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  // Support both phoneNumber and phone from client
  body('phoneNumber')
    .optional()
    .matches(/^\+211[0-9]{8}$/)
    .withMessage('Phone number must be a valid South Sudan number (+211XXXXXXXX)'),
  body('phone')
    .optional()
    .matches(/^\+211[0-9]{8}$/)
    .withMessage('Phone number must be a valid South Sudan number (+211XXXXXXXX)'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('businessType')
    .optional()
    .isIn(['retail', 'restaurant', 'services', 'ecommerce', 'education', 'healthcare', 'transport', 'agriculture', 'other'])
    .withMessage('Invalid business type'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .optional()
    .isIn(['Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Kuacjok', 'Bentiu', 'Bor', 'Torit', 'Rumbek'])
    .withMessage('Invalid city'),
  body('address.state')
    .optional()
    .isIn(['Central Equatoria', 'Western Equatoria', 'Eastern Equatoria', 'Upper Nile', 'Unity', 'Warrap', 'Northern Bahr el Ghazal', 'Western Bahr el Ghazal', 'Lakes', 'Jonglei'])
    .withMessage('Invalid state'),
  // Also accept flat city/address fields from client and validate minimally
  body('city').optional().isString().trim().isLength({ min: 2 }).withMessage('City is required'),
  body('address').optional().isString().trim().isLength({ min: 5 }).withMessage('Address is required')
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

    const {
      firstName,
      lastName,
      phoneNumber,
      phone,
      businessName,
      businessType,
      address,
      city
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure nested address exists
    user.profile.address = user.profile.address || {};

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    const finalPhone = phoneNumber !== undefined ? phoneNumber : (phone !== undefined ? phone : undefined);
    if (finalPhone !== undefined) user.profile.phoneNumber = finalPhone;
    if (businessName !== undefined) user.profile.businessName = businessName;
    if (businessType !== undefined) user.profile.businessType = businessType;
    
    // Map either nested address or flat fields
    if (address && typeof address === 'object') {
      if (address.street !== undefined) user.profile.address.street = address.street;
      if (address.city !== undefined) user.profile.address.city = address.city;
      if (address.state !== undefined) user.profile.address.state = address.state;
    }
    if (city !== undefined) user.profile.address.city = city;
    if (typeof address === 'string') user.profile.address.street = address;

    user.updatedAt = new Date();
    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(req.user.id)
      .select('-password -apiKeys.secretKey')
      .lean();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('settings apiKeys')
      .lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const defaults = {
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        paymentReceived: true,
        paymentFailed: true,
        weeklyReports: true,
        monthlyReports: true,
        securityAlerts: true,
        marketingEmails: false
      },
      preferences: {
        language: 'en',
        timezone: 'Africa/Juba',
        currency: 'SSP',
        theme: 'system',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-SS'
      },
      security: {
        twoFactorAuth: false,
        loginNotifications: true,
        sessionTimeout: 30,
        allowMultipleSessions: false
      },
      api: {
        webhookUrl: '',
        webhookSecret: '',
        apiKeyName: ''
      }
    };

    const s = user.settings || {};
    const notif = s.notifications || {};
    const pref = s.preferences || {};
    const sec = s.security || {};
    const api = user.apiKeys || {};

    const responseSettings = {
      notifications: {
        emailNotifications: notif.emailNotifications ?? notif.email ?? defaults.notifications.emailNotifications,
        smsNotifications: notif.smsNotifications ?? notif.sms ?? defaults.notifications.smsNotifications,
        paymentReceived: notif.paymentReceived ?? defaults.notifications.paymentReceived,
        paymentFailed: notif.paymentFailed ?? defaults.notifications.paymentFailed,
        weeklyReports: notif.weeklyReports ?? defaults.notifications.weeklyReports,
        monthlyReports: notif.monthlyReports ?? defaults.notifications.monthlyReports,
        securityAlerts: notif.securityAlerts ?? defaults.notifications.securityAlerts,
        marketingEmails: notif.marketingEmails ?? defaults.notifications.marketingEmails
      },
      preferences: {
        language: pref.language ?? s.language ?? defaults.preferences.language,
        timezone: pref.timezone ?? s.timezone ?? defaults.preferences.timezone,
        currency: pref.currency ?? defaults.preferences.currency,
        theme: pref.theme ?? defaults.preferences.theme,
        dateFormat: pref.dateFormat ?? defaults.preferences.dateFormat,
        numberFormat: pref.numberFormat ?? defaults.preferences.numberFormat
      },
      security: {
        twoFactorAuth: sec.twoFactorAuth ?? defaults.security.twoFactorAuth,
        loginNotifications: sec.loginNotifications ?? defaults.security.loginNotifications,
        sessionTimeout: sec.sessionTimeout ?? defaults.security.sessionTimeout,
        allowMultipleSessions: sec.allowMultipleSessions ?? defaults.security.allowMultipleSessions
      },
      api: {
        webhookUrl: api.webhookUrl || '',
        webhookSecret: api.webhookSecret || '',
        apiKeyName: api.apiKeyName || ''
      }
    };

    res.json({
      success: true,
      settings: responseSettings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure nested structure exists for safe assignments
    user.settings = user.settings || {};
    user.settings.notifications = user.settings.notifications || {};
    user.settings.preferences = user.settings.preferences || {};
    user.settings.security = user.settings.security || {};
    user.apiKeys = user.apiKeys || {};

    const { 
      section, 
      settings: settingsData,
      notifications,
      language,
      timezone,
      webhookUrl 
    } = req.body;

    // Handle different payload formats from client
    if (section && settingsData) {
      // Client sends section-specific updates
      if (section === 'notifications' && settingsData) {
        // Map client notification settings to User model structure
        if (settingsData.emailNotifications !== undefined) {
          user.settings.notifications.emailNotifications = settingsData.emailNotifications;
        }
        if (settingsData.smsNotifications !== undefined) {
          user.settings.notifications.smsNotifications = settingsData.smsNotifications;
        }
        if (settingsData.paymentReceived !== undefined) {
          user.settings.notifications.paymentReceived = settingsData.paymentReceived;
        }
        if (settingsData.paymentFailed !== undefined) {
          user.settings.notifications.paymentFailed = settingsData.paymentFailed;
        }
        if (settingsData.weeklyReports !== undefined) {
          user.settings.notifications.weeklyReports = settingsData.weeklyReports;
        }
        if (settingsData.monthlyReports !== undefined) {
          user.settings.notifications.monthlyReports = settingsData.monthlyReports;
        }
        if (settingsData.securityAlerts !== undefined) {
          user.settings.notifications.securityAlerts = settingsData.securityAlerts;
        }
        if (settingsData.marketingEmails !== undefined) {
          user.settings.notifications.marketingEmails = settingsData.marketingEmails;
        }
        // Backward compatibility
        if (settingsData.email !== undefined) {
          user.settings.notifications.emailNotifications = settingsData.email;
        }
        if (settingsData.sms !== undefined) {
          user.settings.notifications.smsNotifications = settingsData.sms;
        }
      } else if (section === 'preferences' && settingsData) {
        if (settingsData.language !== undefined) {
          user.settings.preferences.language = settingsData.language;
        }
        if (settingsData.timezone !== undefined) {
          user.settings.preferences.timezone = settingsData.timezone;
        }
        if (settingsData.currency !== undefined) {
          user.settings.preferences.currency = settingsData.currency;
        }
        if (settingsData.theme !== undefined) {
          user.settings.preferences.theme = settingsData.theme;
        }
        if (settingsData.dateFormat !== undefined) {
          user.settings.preferences.dateFormat = settingsData.dateFormat;
        }
        if (settingsData.numberFormat !== undefined) {
          user.settings.preferences.numberFormat = settingsData.numberFormat;
        }
      } else if (section === 'security' && settingsData) {
        if (settingsData.twoFactorAuth !== undefined) {
          user.settings.security.twoFactorAuth = settingsData.twoFactorAuth;
        }
        if (settingsData.loginNotifications !== undefined) {
          user.settings.security.loginNotifications = settingsData.loginNotifications;
        }
        if (settingsData.sessionTimeout !== undefined) {
          user.settings.security.sessionTimeout = settingsData.sessionTimeout;
        }
        if (settingsData.allowMultipleSessions !== undefined) {
          user.settings.security.allowMultipleSessions = settingsData.allowMultipleSessions;
        }
      } else if (section === 'api' && settingsData) {
        if (settingsData.webhookUrl !== undefined) {
          user.apiKeys.webhookUrl = settingsData.webhookUrl;
        }
        if (settingsData.webhookSecret !== undefined) {
          user.apiKeys.webhookSecret = settingsData.webhookSecret;
        }
        if (settingsData.apiKeyName !== undefined) {
          user.apiKeys.apiKeyName = settingsData.apiKeyName;
        }
      }
    } else {
      // Handle direct field updates (legacy format)
      if (notifications) {
        if (notifications.email !== undefined) user.settings.notifications.emailNotifications = notifications.email;
        if (notifications.sms !== undefined) user.settings.notifications.smsNotifications = notifications.sms;
      }
      
      if (language !== undefined) user.settings.preferences.language = language;
      if (timezone !== undefined) user.settings.preferences.timezone = timezone;
      if (webhookUrl !== undefined) {
        user.apiKeys.webhookUrl = webhookUrl;
      }
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
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

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get API keys (merchant only)
router.get('/api-keys', [auth, merchantAuth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('apiKeys')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only public key and masked secret key
    const apiKeys = {
      publicKey: user.apiKeys.publicKey,
      secretKey: user.apiKeys.secretKey ? 
        user.apiKeys.secretKey.substring(0, 8) + '...' + user.apiKeys.secretKey.slice(-4) : null,
      hasSecretKey: !!user.apiKeys.secretKey
    };

    res.json({
      success: true,
      apiKeys
    });

  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate API keys (merchant only)
router.post('/api-keys/regenerate', [auth, merchantAuth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new API keys
    user.generateApiKeys();
    user.updatedAt = new Date();
    await user.save();

    // Return only public key and masked secret key
    const apiKeys = {
      publicKey: user.apiKeys.publicKey,
      secretKey: user.apiKeys.secretKey.substring(0, 8) + '...' + user.apiKeys.secretKey.slice(-4),
      hasSecretKey: true
    };

    res.json({
      success: true,
      message: 'API keys regenerated successfully',
      apiKeys
    });

  } catch (error) {
    console.error('Regenerate API keys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get account balance (merchant only)
router.get('/balance', [auth, merchantAuth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('balance')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      balance: user.balance
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get account statistics (merchant only)
router.get('/stats', [auth, merchantAuth], async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const PaymentLink = require('../models/PaymentLink');
    const Payout = require('../models/Payout');

    const userId = req.user.id;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get transaction statistics
    const transactionStats = await Transaction.getMerchantStats(userId);
    
    // Get this week's transactions
    const weeklyTransactions = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: startOfWeek },
          status: 'successful'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get this month's transactions
    const monthlyTransactions = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: startOfMonth },
          status: 'successful'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get payment links count
    const paymentLinksCount = await PaymentLink.countDocuments({
      merchant: userId,
      isActive: true
    });

    // Get pending payouts
    const pendingPayouts = await Payout.aggregate([
      {
        $match: {
          merchant: req.user.id,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      merchant: userId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('transactionId amount currency status customer.name createdAt')
    .lean();

    const stats = {
      overview: {
        totalTransactions: transactionStats.totalTransactions || 0,
        successfulTransactions: transactionStats.successfulTransactions || 0,
        totalAmount: transactionStats.totalAmount || 0,
        totalFees: transactionStats.totalFees || 0,
        averageTransaction: transactionStats.averageTransaction || 0,
        successRate: transactionStats.successRate || 0
      },
      thisWeek: {
        transactions: weeklyTransactions[0]?.count || 0,
        amount: weeklyTransactions[0]?.amount || 0
      },
      thisMonth: {
        transactions: monthlyTransactions[0]?.count || 0,
        amount: monthlyTransactions[0]?.amount || 0
      },
      paymentLinks: {
        active: paymentLinksCount
      },
      pendingPayouts: {
        count: pendingPayouts[0]?.count || 0,
        amount: pendingPayouts[0]?.amount || 0
      },
      recentTransactions
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/account', [
  auth,
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
  body('confirmation')
    .equals('DELETE')
    .withMessage('Please type DELETE to confirm account deletion')
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

    const { password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check if user has pending transactions or balance
    const Transaction = require('../models/Transaction');
    const pendingTransactions = await Transaction.countDocuments({
      merchant: req.user.id,
      status: 'pending'
    });

    if (pendingTransactions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with pending transactions. Please wait for all transactions to complete.'
      });
    }

    if (user.balance.SSP > 0 || user.balance.USD > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with remaining balance. Please request a payout first.'
      });
    }

    // Deactivate instead of deleting to maintain transaction history
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Account has been deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;