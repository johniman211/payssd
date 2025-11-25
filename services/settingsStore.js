const Settings = require('../models/Settings');

// Cache for settings to avoid frequent database calls
let settingsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check if cache is still valid
function isCacheValid() {
  return settingsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

// Clear the cache
function clearCache() {
  settingsCache = null;
  cacheTimestamp = null;
}

async function getSettings() {
  try {
    // Return cached settings if valid
    if (isCacheValid()) {
      return settingsCache;
    }
    
    // Fetch from database
    const settings = await Settings.getSettings();
    
    // Update cache
    settingsCache = settings.toObject();
    cacheTimestamp = Date.now();
    
    return settingsCache;
  } catch (error) {
    console.error('Error fetching settings:', error);
    
    // Return default settings aligned with schema if database fails
    const defaultSettings = {
      _id: 'system_settings',
      general: {
        platformName: 'PaySSD',
        platformDescription: 'Secure payment gateway for South Sudan',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@payssd.com',
        supportPhone: '+211 123 456 789',
        maintenanceMode: false,
        registrationEnabled: true,
        kycRequired: true,
        autoApproveKyc: false
      },
      payments: {
        mtnMomoEnabled: true,
        digicashEnabled: true,
        minPaymentAmount: 100,
        maxPaymentAmount: 1000000,
        transactionFeePercentage: 2.5,
        fixedTransactionFee: 0,
        paymentTimeout: 300,
        autoRefundEnabled: true,
        refundTimeout: 24
      },
      payouts: {
        minPayoutAmount: 1000,
        maxPayoutAmount: 5000000,
        payoutFeePercentage: 1.0,
        fixedPayoutFee: 50,
        autoApprovePayouts: false,
        payoutProcessingDays: 3,
        requireBankVerification: true
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        requireTwoFactor: false,
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        apiRateLimit: 100,
        ipWhitelistEnabled: false
      },
      notifications: {
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: true,
        webhookNotificationsEnabled: true,
        adminEmailAlerts: true,
        transactionAlerts: true,
        securityAlerts: true,
        systemMaintenanceAlerts: true,
        dailyReports: true,
        weeklyReports: true,
        monthlyReports: true,
        webhookRetries: 3,
        webhookTimeout: 30
      },
      integrations: {
        mtnMomoApiKey: '',
        mtnMomoSecretKey: '',
        mtnMomoSandboxMode: true,
        digicashApiKey: '',
        digicashSecretKey: '',
        digicashSandboxMode: true,
        emailServiceProvider: 'sendgrid',
        emailApiKey: '',
        smsServiceProvider: 'twilio',
        smsApiKey: '',
        smsApiSecret: ''
      }
    };
    
    return defaultSettings;
  }
}

async function updateSettings(newSettings, updatedBy = null) {
  try {
    if (!newSettings || typeof newSettings !== 'object') {
      throw new Error('Invalid settings data');
    }
    
    // Update in database
    const updatedSettings = await Settings.updateSettings(newSettings, updatedBy);
    
    // Clear cache to force refresh on next get
    clearCache();
    
    return updatedSettings.toObject();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

module.exports = { getSettings, updateSettings };
