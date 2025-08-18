// Simple in-memory settings store. In a real app, persist to a database.
const settings = {
  platform: {
    name: 'PaySSD',
    description: 'South Sudan Payment Gateway',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@payssd.com',
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

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMerge(target[key], srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

function getSettings() {
  return settings;
}

function updateSettings(newSettings) {
  if (!newSettings || typeof newSettings !== 'object') return settings;
  deepMerge(settings, newSettings);
  return settings;
}

module.exports = { getSettings, updateSettings };