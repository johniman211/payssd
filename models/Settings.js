const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Use a fixed ID to ensure only one settings document exists
  _id: {
    type: String,
    default: 'system_settings'
  },
  
  // General Settings (Platform Information & Controls)
  general: {
    platformName: {
      type: String,
      default: 'PaySSD'
    },
    platformDescription: {
      type: String,
      default: 'Secure payment gateway for South Sudan'
    },
    supportEmail: {
      type: String,
      default: 'support@payssd.com'
    },
    supportPhone: {
      type: String,
      default: '+211 123 456 789'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    },
    kycRequired: {
      type: Boolean,
      default: true
    },
    autoApproveKyc: {
      type: Boolean,
      default: false
    }
  },
  
  // Payment Settings
  payments: {
    mtnMomoEnabled: {
      type: Boolean,
      default: true
    },
    digicashEnabled: {
      type: Boolean,
      default: true
    },
    minPaymentAmount: {
      type: Number,
      default: 100,
      min: 0
    },
    maxPaymentAmount: {
      type: Number,
      default: 1000000,
      min: 0
    },
    transactionFeePercentage: {
      type: Number,
      default: 2.5,
      min: 0,
      max: 100
    },
    fixedTransactionFee: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentTimeout: {
      type: Number,
      default: 300,
      min: 60,
      max: 3600
    },
    autoRefundEnabled: {
      type: Boolean,
      default: true
    },
    refundTimeout: {
      type: Number,
      default: 24,
      min: 1,
      max: 168
    }
  },
  
  // Payout Settings
  payouts: {
    minPayoutAmount: {
      type: Number,
      default: 1000,
      min: 0
    },
    maxPayoutAmount: {
      type: Number,
      default: 5000000,
      min: 0
    },
    payoutFeePercentage: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 100
    },
    fixedPayoutFee: {
      type: Number,
      default: 50,
      min: 0
    },
    autoApprovePayouts: {
      type: Boolean,
      default: false
    },
    payoutProcessingDays: {
      type: Number,
      default: 3,
      min: 1,
      max: 30
    },
    requireBankVerification: {
      type: Boolean,
      default: true
    }
  },
  
  // Security Settings
  security: {
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 480
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    lockoutDuration: {
      type: Number,
      default: 15,
      min: 1,
      max: 1440
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    },
    passwordMinLength: {
      type: Number,
      default: 8,
      min: 6,
      max: 50
    },
    passwordRequireSpecial: {
      type: Boolean,
      default: true
    },
    passwordRequireNumbers: {
      type: Boolean,
      default: true
    },
    passwordRequireUppercase: {
      type: Boolean,
      default: true
    },
    apiRateLimit: {
      type: Number,
      default: 100,
      min: 10,
      max: 10000
    },
    ipWhitelistEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Notification Settings
  notifications: {
    emailNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    smsNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    webhookNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    adminEmailAlerts: {
      type: Boolean,
      default: true
    },
    transactionAlerts: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    },
    systemMaintenanceAlerts: {
      type: Boolean,
      default: true
    },
    dailyReports: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    monthlyReports: {
      type: Boolean,
      default: true
    },
    webhookRetries: {
      type: Number,
      default: 3,
      min: 0,
      max: 10
    },
    webhookTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 300
    }
  },
  
  // Integration Settings
  integrations: {
    mtnMomoApiKey: {
      type: String,
      default: ''
    },
    mtnMomoSecretKey: {
      type: String,
      default: ''
    },
    mtnMomoSandboxMode: {
      type: Boolean,
      default: true
    },
    digicashApiKey: {
      type: String,
      default: ''
    },
    digicashSecretKey: {
      type: String,
      default: ''
    },
    digicashSandboxMode: {
      type: Boolean,
      default: true
    },
    emailServiceProvider: {
      type: String,
      default: 'sendgrid',
      enum: ['sendgrid', 'mailgun', 'ses', 'smtp']
    },
    emailApiKey: {
      type: String,
      default: ''
    },
    smsServiceProvider: {
      type: String,
      default: 'twilio',
      enum: ['twilio', 'nexmo', 'africastalking']
    },
    smsApiKey: {
      type: String,
      default: ''
    },
    smsApiSecret: {
      type: String,
      default: ''
    }
  },
  
  // Track when settings were last updated
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Track who last updated the settings
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  // Disable the automatic _id generation since we're using a custom one
  _id: false
});

// Static method to get or create settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findById('system_settings');
  
  if (!settings) {
    // Create default settings if none exist
    settings = new this({ _id: 'system_settings' });
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(newSettings, updatedBy = null) {
  const settings = await this.getSettings();
  
  // Deep merge the new settings
  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    
    for (const key of Object.keys(source)) {
      const srcVal = source[key];
      if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        deepMerge(target[key], srcVal);
      } else {
        target[key] = srcVal;
      }
    }
    return target;
  }
  
  deepMerge(settings, newSettings);
  settings.lastUpdated = new Date();
  if (updatedBy) {
    settings.lastUpdatedBy = updatedBy;
  }
  
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);