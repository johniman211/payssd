const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const payoutSchema = new mongoose.Schema({
  // Payout Identification
  payoutId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'payout_' + uuidv4().replace(/-/g, '').substring(0, 12)
  },
  
  // Merchant Information
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payout Details
  amount: {
    type: Number,
    required: true,
    min: 10 // Minimum payout amount
  },
  currency: {
    type: String,
    default: 'SSP',
    enum: ['SSP', 'USD']
  },
  
  // Payout Method
  payoutMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'mobile_money', 'cash_pickup']
  },
  
  // Destination Details
  destination: {
    // For bank transfers
    bankName: String,
    accountNumber: String,
    accountName: String,
    swiftCode: String,
    
    // For mobile money
    mobileProvider: {
      type: String,
      enum: ['mtn', 'digicash']
    },
    mobileNumber: String,
    
    // For cash pickup
    pickupLocation: String,
    pickupCode: String,
    
    // Common fields
    recipientName: String,
    recipientPhone: String,
    recipientEmail: String
  },
  
  // Status and Processing
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Fees and Charges
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    bankFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    },
    netAmount: Number // amount - totalFees
  },
  
  // Processing Information
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  
  // External Reference (from bank or payment provider)
  externalReference: String,
  providerTransactionId: String,
  
  // Timing
  requestedAt: {
    type: Date,
    default: Date.now
  },
  scheduledFor: Date,
  completedAt: Date,
  
  // Verification and Security
  verificationCode: String,
  requiresVerification: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  
  // Notes and Comments
  merchantNotes: String,
  adminNotes: String,
  rejectionReason: String,
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['dashboard', 'api'],
      default: 'dashboard'
    }
  },
  
  // Reconciliation
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciledAt: Date,
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Related Transactions
  relatedTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  
  // Batch Information (for bulk payouts)
  batchId: String,
  batchSequence: Number
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ payoutId: 1 });
payoutSchema.index({ merchant: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ payoutMethod: 1 });
payoutSchema.index({ processedBy: 1 });
payoutSchema.index({ batchId: 1 });

// Compound indexes
payoutSchema.index({ merchant: 1, status: 1, createdAt: -1 });
payoutSchema.index({ status: 1, scheduledFor: 1 });

// Pre-save middleware to calculate net amount
payoutSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('fees')) {
    this.fees.totalFees = (this.fees.processingFee || 0) + (this.fees.bankFee || 0);
    this.fees.netAmount = this.amount - this.fees.totalFees;
  }
  
  // Generate verification code for large amounts
  if (this.amount >= 1000 && !this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.requiresVerification = true;
  }
  
  next();
});

// Method to calculate processing fees
payoutSchema.statics.calculateProcessingFee = function(amount, method) {
  let fee = 0;
  
  switch (method) {
    case 'bank_transfer':
      fee = Math.max(amount * 0.015, 25); // 1.5% or minimum SSP 25
      break;
    case 'mobile_money':
      fee = Math.max(amount * 0.02, 15); // 2% or minimum SSP 15
      break;
    case 'cash_pickup':
      fee = Math.max(amount * 0.025, 20); // 2.5% or minimum SSP 20
      break;
  }
  
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

// Method to check if merchant has sufficient balance
payoutSchema.methods.validateMerchantBalance = async function() {
  const User = mongoose.model('User');
  const merchant = await User.findById(this.merchant);
  
  if (!merchant) {
    throw new Error('Merchant not found');
  }
  
  const totalRequired = this.amount + (this.fees.totalFees || 0);
  
  if (merchant.balance.available < totalRequired) {
    throw new Error('Insufficient balance for payout');
  }
  
  return true;
};

// Method to process payout
payoutSchema.methods.process = async function(processedBy) {
  // Validate merchant balance
  await this.validateMerchantBalance();
  
  // Update merchant balance
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.merchant, {
    $inc: {
      'balance.available': -(this.amount + this.fees.totalFees),
      'balance.pending': this.amount + this.fees.totalFees
    }
  });
  
  // Update payout status
  this.status = 'processing';
  this.processedBy = processedBy;
  this.processedAt = new Date();
  
  return this.save();
};

// Method to complete payout
payoutSchema.methods.complete = async function(externalReference) {
  // Update merchant balance
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.merchant, {
    $inc: {
      'balance.pending': -(this.amount + this.fees.totalFees)
    }
  });
  
  // Update payout status
  this.status = 'completed';
  this.completedAt = new Date();
  this.externalReference = externalReference;
  
  return this.save();
};

// Method to fail payout
payoutSchema.methods.fail = async function(reason) {
  // Refund merchant balance
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.merchant, {
    $inc: {
      'balance.available': this.amount + this.fees.totalFees,
      'balance.pending': -(this.amount + this.fees.totalFees)
    }
  });
  
  // Update payout status
  this.status = 'failed';
  this.rejectionReason = reason;
  
  return this.save();
};

// Method to cancel payout
payoutSchema.methods.cancel = async function(reason) {
  if (this.status !== 'pending') {
    throw new Error('Can only cancel pending payouts');
  }
  
  this.status = 'cancelled';
  this.rejectionReason = reason;
  
  return this.save();
};

// Static method to get merchant payout statistics
payoutSchema.statics.getMerchantPayoutStats = async function(merchantId, dateRange = {}) {
  const matchStage = {
    merchant: new mongoose.Types.ObjectId(merchantId),
    ...dateRange
  };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayouts: { $sum: 1 },
        completedPayouts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        totalFees: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fees.totalFees', 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalPayouts: 0,
    completedPayouts: 0,
    totalAmount: 0,
    totalFees: 0,
    pendingAmount: 0
  };
  
  result.successRate = result.totalPayouts > 0 
    ? (result.completedPayouts / result.totalPayouts) * 100 
    : 0;
  
  return result;
};

// Static method to get pending payouts for admin
payoutSchema.statics.getPendingPayouts = function(limit = 50) {
  return this.find({ status: 'pending' })
    .populate('merchant', 'email profile.firstName profile.lastName profile.businessName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Payout', payoutSchema);