const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Identification
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  externalTransactionId: String, // ID from payment provider
  
  // Merchant Information
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchantEmail: String,
  merchantBusinessName: String,
  
  // Payment Information
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'SSP',
    enum: ['SSP', 'USD']
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mtn_momo', 'digicash']
  },
  
  // Customer Information
  customer: {
    name: String,
    email: String,
    phoneNumber: {
      type: String,
      required: true
    }
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'successful', 'failed', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Payment Link Information (if applicable)
  paymentLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentLink'
  },
  
  // Redirect URLs inherited from PaymentLink
  redirectUrls: {
    success: String,
    failure: String,
    cancel: String
  },
  
  // Provider Response Data
  providerResponse: {
    requestId: String,
    responseCode: String,
    responseMessage: String,
    providerTransactionId: String,
    providerReference: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  
  // Fees and Charges
  fees: {
    platformFee: {
      type: Number,
      default: 0
    },
    providerFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    },
    merchantReceives: Number // amount - totalFees
  },
  
  // Timing Information
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: Date,
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  
  // Webhook Information
  webhookSent: {
    type: Boolean,
    default: false
  },
  webhookAttempts: {
    type: Number,
    default: 0
  },
  webhookResponse: String,
  
  // Reconciliation
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciledAt: Date,
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['payment_link', 'api', 'dashboard'],
      default: 'payment_link'
    },
    deviceInfo: String
  },
  
  // Notes and Comments
  notes: String,
  internalNotes: String, // Only visible to admins
  
  // Dispute Information
  dispute: {
    status: {
      type: String,
      enum: ['none', 'raised', 'investigating', 'resolved'],
      default: 'none'
    },
    raisedAt: Date,
    reason: String,
    resolution: String,
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ merchant: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });
transactionSchema.index({ 'customer.phoneNumber': 1 });
transactionSchema.index({ externalTransactionId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ completedAt: -1 });

// Compound indexes
transactionSchema.index({ merchant: 1, status: 1, createdAt: -1 });
transactionSchema.index({ merchant: 1, paymentMethod: 1, createdAt: -1 });

// Pre-save middleware to calculate merchant receives amount
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('fees')) {
    this.fees.totalFees = (this.fees.platformFee || 0) + (this.fees.providerFee || 0);
    this.fees.merchantReceives = this.amount - this.fees.totalFees;
  }
  
  // Set expiry time if not set (24 hours from creation)
  if (!this.expiresAt && this.status === 'pending') {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to check if transaction is expired
transactionSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt && this.status === 'pending';
};

// Method to mark transaction as expired
transactionSchema.methods.markAsExpired = function() {
  if (this.isExpired()) {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to calculate platform fee (2.5% + SSP 5)
transactionSchema.statics.calculatePlatformFee = function(amount) {
  const percentageFee = amount * 0.025; // 2.5%
  const fixedFee = 5; // SSP 5
  return Math.round((percentageFee + fixedFee) * 100) / 100; // Round to 2 decimal places
};

// Method to get transaction summary for merchant
transactionSchema.methods.getMerchantSummary = function() {
  return {
    transactionId: this.transactionId,
    amount: this.amount,
    currency: this.currency,
    description: this.description,
    status: this.status,
    paymentMethod: this.paymentMethod,
    customer: this.customer,
    fees: this.fees,
    createdAt: this.createdAt,
    completedAt: this.completedAt
  };
};

// Static method to get merchant statistics
transactionSchema.statics.getMerchantStats = async function(merchantId, dateRange = {}) {
  const matchStage = {
    merchant: new mongoose.Types.ObjectId(merchantId),
    ...dateRange
  };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        successfulTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] }
        },
        totalAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'successful'] }, '$amount', 0] }
        },
        totalFees: {
          $sum: { $cond: [{ $eq: ['$status', 'successful'] }, '$fees.totalFees', 0] }
        },
        averageAmount: {
          $avg: { $cond: [{ $eq: ['$status', 'successful'] }, '$amount', null] }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalTransactions: 0,
    successfulTransactions: 0,
    totalAmount: 0,
    totalFees: 0,
    averageAmount: 0
  };
  
  result.successRate = result.totalTransactions > 0 
    ? (result.successfulTransactions / result.totalTransactions) * 100 
    : 0;
  
  return result;
};

module.exports = mongoose.model('Transaction', transactionSchema);