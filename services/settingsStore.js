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
    
    // Return default settings if database fails
    const defaultSettings = {
      platform: {
        name: 'PaySSD',
        description: 'South Sudan Payment Gateway',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@payssd.com',
        supportPhone: '+211 123 456 789',
        maintenanceMode: false,
      },
      fees: {
        transactionFeePercentage: 2.5,
        minimumFee: 1.0,
        maximumFee: 100.0,
        payoutFee: 5.0,
      },
      limits: {
        dailyTransactionLimit: 10000,
        monthlyTransactionLimit: 100000,
        minimumTransactionAmount: 1,
        maximumTransactionAmount: 50000,
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireTwoFactor: false,
        ipWhitelisting: false,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        webhookRetries: 3,
        webhookTimeout: 30,
        adminEmailAlerts: true,
      },
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