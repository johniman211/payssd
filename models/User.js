const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['merchant', 'admin'],
    default: 'merchant'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    businessName: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      enum: ['individual', 'small_business', 'company', 'ngo'],
      default: 'individual'
    },
    address: {
      street: String,
      city: {
        type: String,
        enum: ['Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Bentiu', 'Bor', 'Torit', 'Rumbek', 'Kuajok'],
        required: true
      },
      state: String,
      country: {
        type: String,
        default: 'South Sudan',
        required: true
      }
    }
  },
  
  // KYC Information
  kyc: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_submitted'],
      default: 'not_submitted'
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    documents: {
      idType: {
        type: String,
        enum: ['national_id', 'passport', 'driving_license']
      },
      idNumber: String,
      idDocument: String, // file path
      businessLicense: String, // file path (optional)
      proofOfAddress: String // file path (optional)
    },
    verificationLevel: {
      type: String,
      enum: ['basic', 'enhanced'],
      default: 'basic'
    }
  },
  
  // Account Balance
  balance: {
    available: {
      type: Number,
      default: 0,
      min: 0
    },
    pending: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'SSP' // South Sudanese Pound
    }
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'pro', 'private'],
      default: 'starter'
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'active'
    },
    startedAt: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['manual', 'flutterwave'],
      default: 'manual'
    },
    externalRef: String,
    notes: String
  },
  
  // API Keys for merchants
  apiKeys: {
    publicKey: String,
    secretKey: String,
    webhookUrl: String,
    webhookSecret: String,
    apiKeyName: String
  },
  
  // Settings
  settings: {
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: true
      },
      paymentReceived: {
        type: Boolean,
        default: true
      },
      paymentFailed: {
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
      securityAlerts: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      }
    },
    preferences: {
      language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'Africa/Juba'
      },
      currency: {
        type: String,
        default: 'SSP'
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY'
      },
      numberFormat: {
        type: String,
        default: 'en-SS'
      }
    },
    security: {
      twoFactorAuth: {
        type: Boolean,
        default: false
      },
      loginNotifications: {
        type: Boolean,
        default: true
      },
      sessionTimeout: {
        type: Number,
        default: 30
      },
      allowMultipleSessions: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.phoneNumber': 1 });
userSchema.index({ 'kyc.status': 1 });
userSchema.index({ role: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate API keys
userSchema.methods.generateApiKeys = function() {
  const crypto = require('crypto');
  this.apiKeys = {
    publicKey: 'pk_' + crypto.randomBytes(16).toString('hex'),
    secretKey: 'sk_' + crypto.randomBytes(32).toString('hex'),
    webhookSecret: 'whsec_' + crypto.randomBytes(32).toString('hex')
  };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
