const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Use a fixed ID to ensure only one settings document exists
  _id: {
    type: String,
    default: 'system_settings'
  },
  
  platform: {
    name: {
      type: String,
      default: 'PaySSD'
    },
    description: {
      type: String,
      default: 'South Sudan Payment Gateway'
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
    }
  },
  
  fees: {
    transactionFeePercentage: {
      type: Number,
      default: 2.5,
      min: 0,
      max: 100
    },
    minimumFee: {
      type: Number,
      default: 1.0,
      min: 0
    },
    maximumFee: {
      type: Number,
      default: 100.0,
      min: 0
    },
    payoutFee: {
      type: Number,
      default: 5.0,
      min: 0
    }
  },
  
  limits: {
    dailyTransactionLimit: {
      type: Number,
      default: 10000,
      min: 0
    },
    monthlyTransactionLimit: {
      type: Number,
      default: 100000,
      min: 0
    },
    minimumTransactionAmount: {
      type: Number,
      default: 1,
      min: 0
    },
    maximumTransactionAmount: {
      type: Number,
      default: 50000,
      min: 0
    }
  },
  
  security: {
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 1440 // 24 hours
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    passwordMinLength: {
      type: Number,
      default: 8,
      min: 6,
      max: 50
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    },
    ipWhitelisting: {
      type: Boolean,
      default: false
    }
  },
  
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
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
    },
    adminEmailAlerts: {
      type: Boolean,
      default: true
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