const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const paymentLinkSchema = new mongoose.Schema({
  // Link Identification
  linkId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 16)
  },
  reference: {
    type: String,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 12)
  },
  
  // Merchant Information
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  amount: {
    type: Number,
    required: function() {
      return !this.allowCustomAmount;
    },
    min: 1
  },
  allowCustomAmount: {
    type: Boolean,
    default: false
  },
  minAmount: {
    type: Number,
    min: 0
  },
  maxAmount: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'SSP',
    enum: ['SSP', 'USD']
  },
  
  // Link Configuration
  isActive: {
    type: Boolean,
    default: true
  },
  isMultiUse: {
    type: Boolean,
    default: true
  },
  maxUses: {
    type: Number,
    default: null // null means unlimited
  },
  currentUses: {
    type: Number,
    default: 0
  },
  
  // Expiry Settings
  expiresAt: Date,
  neverExpires: {
    type: Boolean,
    default: false
  },
  
  // Payment Methods
  allowedPaymentMethods: [{
    type: String,
    enum: ['mtn_momo', 'digicash']
  }],
  
  // Customization
  customization: {
    logoUrl: String,
    primaryColor: {
      type: String,
      default: '#2563eb'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    textColor: {
      type: String,
      default: '#1f2937'
    },
    showMerchantInfo: {
      type: Boolean,
      default: true
    }
  },
  
  // Customer Information Requirements
  collectCustomerInfo: {
    name: {
      required: {
        type: Boolean,
        default: true
      },
      optional: {
        type: Boolean,
        default: false
      }
    },
    email: {
      required: {
        type: Boolean,
        default: false
      },
      optional: {
        type: Boolean,
        default: true
      }
    },
    phone: {
      required: {
        type: Boolean,
        default: true
      },
      optional: {
        type: Boolean,
        default: false
      }
    },
    address: {
      required: {
        type: Boolean,
        default: false
      },
      optional: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Success/Failure URLs
  redirectUrls: {
    success: String,
    failure: String,
    cancel: String
  },
  
  // Webhook Configuration
  webhookUrl: String,
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    totalAmountCollected: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date,
    lastPaymentAt: Date
  },
  
  // SEO and Sharing
  seo: {
    metaTitle: String,
    metaDescription: String,
    ogImage: String
  },
  
  // Security
  requiresPassword: {
    type: Boolean,
    default: false
  },
  password: String, // Hashed if set
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['dashboard', 'api'],
      default: 'dashboard'
    },
    tags: [String],
    notes: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'expired', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
paymentLinkSchema.index({ linkId: 1 });
paymentLinkSchema.index({ merchant: 1, createdAt: -1 });
paymentLinkSchema.index({ merchant: 1, status: 1 });
paymentLinkSchema.index({ isActive: 1 });
paymentLinkSchema.index({ expiresAt: 1 });

// Virtual for full URL
paymentLinkSchema.virtual('fullUrl').get(function() {
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl}/pay/${this.linkId}`;
});

// Virtual for short URL
paymentLinkSchema.virtual('shortUrl').get(function() {
  return `payssd.ss/p/${this.linkId}`;
});

// Virtual for conversion rate
paymentLinkSchema.virtual('conversionRate').get(function() {
  if (this.analytics.views === 0) return 0;
  return (this.analytics.conversions / this.analytics.views) * 100;
});

// Pre-save middleware
paymentLinkSchema.pre('save', function(next) {
  // Check if link should be expired
  if (this.expiresAt && new Date() > this.expiresAt && this.status === 'active') {
    this.status = 'expired';
    this.isActive = false;
  }
  
  // Check if max uses reached
  if (this.maxUses && this.currentUses >= this.maxUses && this.status === 'active') {
    this.status = 'completed';
    this.isActive = false;
  }
  
  // Set default allowed payment methods if not specified
  if (!this.allowedPaymentMethods || this.allowedPaymentMethods.length === 0) {
    this.allowedPaymentMethods = ['mtn_momo', 'digicash'];
  }
  
  next();
});

// Method to check if link is accessible
paymentLinkSchema.methods.isAccessible = function() {
  if (!this.isActive) return false;
  if (this.status !== 'active') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.maxUses && this.currentUses >= this.maxUses) return false;
  return true;
};

// Method to increment view count
paymentLinkSchema.methods.incrementView = function(isUnique = false) {
  this.analytics.views += 1;
  if (isUnique) {
    this.analytics.uniqueViews += 1;
  }
  this.analytics.lastViewedAt = new Date();
  return this.save();
};

// Method to record successful payment
paymentLinkSchema.methods.recordPayment = function(amount) {
  this.analytics.conversions += 1;
  this.analytics.totalAmountCollected += amount;
  this.analytics.lastPaymentAt = new Date();
  this.currentUses += 1;
  
  // Check if single-use link should be deactivated
  if (!this.isMultiUse) {
    this.status = 'completed';
    this.isActive = false;
  }
  
  return this.save();
};

// Method to generate QR code data
paymentLinkSchema.methods.getQRCodeData = function() {
  return {
    url: this.fullUrl,
    amount: this.amount,
    currency: this.currency,
    description: this.description,
    merchant: this.merchant
  };
};

// Static method to get merchant link statistics
paymentLinkSchema.statics.getMerchantLinkStats = async function(merchantId) {
  const stats = await this.aggregate([
    { $match: { merchant: new mongoose.Types.ObjectId(merchantId) } },
    {
      $group: {
        _id: null,
        totalLinks: { $sum: 1 },
        activeLinks: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalViews: { $sum: '$analytics.views' },
        totalConversions: { $sum: '$analytics.conversions' },
        totalAmountCollected: { $sum: '$analytics.totalAmountCollected' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalLinks: 0,
    activeLinks: 0,
    totalViews: 0,
    totalConversions: 0,
    totalAmountCollected: 0
  };
  
  result.averageConversionRate = result.totalViews > 0 
    ? (result.totalConversions / result.totalViews) * 100 
    : 0;
  
  return result;
};

// Static method to cleanup expired links
paymentLinkSchema.statics.cleanupExpiredLinks = async function() {
  const now = new Date();
  return this.updateMany(
    {
      expiresAt: { $lt: now },
      status: 'active'
    },
    {
      $set: {
        status: 'expired',
        isActive: false
      }
    }
  );
};

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);