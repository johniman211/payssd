const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth, merchantAuth } = require('../middleware/auth');
const { requireEmailVerification } = require('../middleware/emailVerification');
const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { Users } = require('../services/supabaseRepo')
    let user = null
    try {
      user = await Users.getById(req.user.id)
    } catch (_) {
      user = null
    }
    if (!user) {
      const fallback = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile || {},
        kyc: req.user.kyc || {},
        isEmailVerified: req.user.isEmailVerified || false
      }
      return res.json({ success: true, user: fallback })
    }
    res.json({ success: true, user })

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

    const { Users } = require('../services/supabaseRepo')
    const existing = await Users.getById(req.user.id)
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }
    const profileCurrent = existing.profile || {}
    profileCurrent.address = profileCurrent.address || {}

    // Update profile fields
    if (firstName !== undefined) profileCurrent.firstName = firstName;
    if (lastName !== undefined) profileCurrent.lastName = lastName;
    const finalPhone = phoneNumber !== undefined ? phoneNumber : (phone !== undefined ? phone : undefined);
    if (finalPhone !== undefined) profileCurrent.phoneNumber = finalPhone;
    if (businessName !== undefined) profileCurrent.businessName = businessName;
    if (businessType !== undefined) profileCurrent.businessType = businessType;
    
    // Map either nested address or flat fields
    if (address && typeof address === 'object') {
      if (address.street !== undefined) profileCurrent.address.street = address.street;
      if (address.city !== undefined) profileCurrent.address.city = address.city;
      if (address.state !== undefined) profileCurrent.address.state = address.state;
    }
    if (city !== undefined) profileCurrent.address.city = city;
    if (typeof address === 'string') profileCurrent.address.street = address;

    await Users.updateProfile(req.user.id, profileCurrent)

    // Dual-write notification preferences to Supabase
    try {
      const { supabase } = require('../services/supabaseClient');
      if (supabase) {
        const notif = user.settings?.notifications || {};
        await supabase.from('notification_preferences').upsert({
          user_id: user._id.toString(),
          email_enabled: !!notif.emailNotifications,
          sms_enabled: !!notif.smsNotifications,
          payment_received_email: !!notif.paymentReceived,
          payment_failed_email: !!notif.paymentFailed,
          weekly_reports_email: !!notif.weeklyReports,
          monthly_reports_email: !!notif.monthlyReports,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    } catch (e) {
      console.log('Supabase preferences upsert skipped:', e.message);
    }

    // Return updated user without sensitive data
    const updatedUser = await Users.getById(req.user.id)

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
    const { Users } = require('../services/supabaseRepo')
    const user = await Users.getSettings(req.user.id)
    
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
    const { Users } = require('../services/supabaseRepo')
    const existing = await Users.getSettings(req.user.id)
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }
    const settingsStore = existing.settings || {}
    settingsStore.notifications = settingsStore.notifications || {}
    settingsStore.preferences = settingsStore.preferences || {}
    settingsStore.security = settingsStore.security || {}
    const apiKeysStore = existing.apiKeys || {}

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
          settingsStore.notifications.emailNotifications = settingsData.emailNotifications;
        }
        if (settingsData.smsNotifications !== undefined) {
          settingsStore.notifications.smsNotifications = settingsData.smsNotifications;
        }
        if (settingsData.paymentReceived !== undefined) {
          settingsStore.notifications.paymentReceived = settingsData.paymentReceived;
        }
        if (settingsData.paymentFailed !== undefined) {
          settingsStore.notifications.paymentFailed = settingsData.paymentFailed;
        }
        if (settingsData.weeklyReports !== undefined) {
          settingsStore.notifications.weeklyReports = settingsData.weeklyReports;
        }
        if (settingsData.monthlyReports !== undefined) {
          settingsStore.notifications.monthlyReports = settingsData.monthlyReports;
        }
        if (settingsData.securityAlerts !== undefined) {
          settingsStore.notifications.securityAlerts = settingsData.securityAlerts;
        }
        if (settingsData.marketingEmails !== undefined) {
          settingsStore.notifications.marketingEmails = settingsData.marketingEmails;
        }
        // Backward compatibility
        if (settingsData.email !== undefined) {
          settingsStore.notifications.emailNotifications = settingsData.email;
        }
        if (settingsData.sms !== undefined) {
          settingsStore.notifications.smsNotifications = settingsData.sms;
        }
      } else if (section === 'preferences' && settingsData) {
        if (settingsData.language !== undefined) {
          settingsStore.preferences.language = settingsData.language;
        }
        if (settingsData.timezone !== undefined) {
          settingsStore.preferences.timezone = settingsData.timezone;
        }
        if (settingsData.currency !== undefined) {
          settingsStore.preferences.currency = settingsData.currency;
        }
        if (settingsData.theme !== undefined) {
          settingsStore.preferences.theme = settingsData.theme;
        }
        if (settingsData.dateFormat !== undefined) {
          settingsStore.preferences.dateFormat = settingsData.dateFormat;
        }
        if (settingsData.numberFormat !== undefined) {
          settingsStore.preferences.numberFormat = settingsData.numberFormat;
        }
      } else if (section === 'security' && settingsData) {
        if (settingsData.twoFactorAuth !== undefined) {
          settingsStore.security.twoFactorAuth = settingsData.twoFactorAuth;
        }
        if (settingsData.loginNotifications !== undefined) {
          settingsStore.security.loginNotifications = settingsData.loginNotifications;
        }
        if (settingsData.sessionTimeout !== undefined) {
          settingsStore.security.sessionTimeout = settingsData.sessionTimeout;
        }
        if (settingsData.allowMultipleSessions !== undefined) {
          settingsStore.security.allowMultipleSessions = settingsData.allowMultipleSessions;
        }
      } else if (section === 'api' && settingsData) {
        if (settingsData.webhookUrl !== undefined) {
          apiKeysStore.webhookUrl = settingsData.webhookUrl;
        }
        if (settingsData.webhookSecret !== undefined) {
          apiKeysStore.webhookSecret = settingsData.webhookSecret;
        }
        if (settingsData.apiKeyName !== undefined) {
          apiKeysStore.apiKeyName = settingsData.apiKeyName;
        }
      }
    } else {
      // Handle direct field updates (legacy format)
      if (notifications) {
        if (notifications.email !== undefined) settingsStore.notifications.emailNotifications = notifications.email;
        if (notifications.sms !== undefined) settingsStore.notifications.smsNotifications = notifications.sms;
      }
      if (language !== undefined) settingsStore.preferences.language = language;
      if (timezone !== undefined) settingsStore.preferences.timezone = timezone;
      if (webhookUrl !== undefined) {
        apiKeysStore.webhookUrl = webhookUrl;
      }
    }

    const { Users: UsersRepo } = require('../services/supabaseRepo')
    await UsersRepo.updateSettings(req.user.id, settingsStore, apiKeysStore)

    res.json({ success: true, message: 'Settings updated successfully', settings: settingsStore })

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
router.get('/api-keys', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
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
router.post('/api-keys/regenerate', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
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
router.get('/balance', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
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
router.get('/stats', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
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

    if ((user.balance?.available || 0) > 0 || (user.balance?.pending || 0) > 0) {
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
