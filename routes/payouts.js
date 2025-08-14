const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Payout = require('../models/Payout');
const User = require('../models/User');
const { auth, merchantAuth } = require('../middleware/auth');
const { requireEmailVerification } = require('../middleware/emailVerification');
const router = express.Router();

// Get merchant's payouts with filtering and pagination
router.get('/', [
  auth,
  requireEmailVerification,
  merchantAuth,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid status'),
  query('currency')
    .optional()
    .isIn(['SSP', 'USD'])
    .withMessage('Invalid currency'),
  query('method')
    .optional()
    .isIn(['bank_transfer', 'mobile_money', 'cash_pickup'])
    .withMessage('Invalid payout method'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
      page = 1,
      limit = 20,
      status,
      currency,
      method,
      startDate,
      endDate
    } = req.query;

    // Build filter query
    const filter = { merchant: req.user.id };

    if (status) filter.status = status;
    if (currency) filter.currency = currency;
    if (method) filter.method = method;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payouts with pagination
    const [payouts, totalCount] = await Promise.all([
      Payout.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-verification -metadata')
        .lean(),
      Payout.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      payouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single payout details
router.get('/:payoutId', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
  try {
    const { payoutId } = req.params;

    const payout = await Payout.findOne({
      _id: payoutId,
      merchant: req.user.id
    }).lean();

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.json({
      success: true,
      payout
    });

  } catch (error) {
    console.error('Get payout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request a new payout
router.post('/request', [
  auth,
  merchantAuth,
  body('amount')
    .isFloat({ min: 100 })
    .withMessage('Amount must be at least 100'),
  body('currency')
    .isIn(['SSP', 'USD'])
    .withMessage('Currency must be either SSP or USD'),
  body('method')
    .isIn(['bank_transfer', 'mobile_money', 'cash_pickup'])
    .withMessage('Method must be bank_transfer, mobile_money, or cash_pickup'),
  body('destination.bankName')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('Bank name is required for bank transfers'),
  body('destination.accountNumber')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('Account number is required for bank transfers'),
  body('destination.accountName')
    .if(body('method').equals('bank_transfer'))
    .notEmpty()
    .withMessage('Account name is required for bank transfers'),
  body('destination.phoneNumber')
    .if(body('method').equals('mobile_money'))
    .matches(/^\+211[0-9]{8}$/)
    .withMessage('Valid South Sudan phone number is required for mobile money'),
  body('destination.provider')
    .if(body('method').equals('mobile_money'))
    .isIn(['mtn', 'digicash'])
    .withMessage('Mobile money provider must be mtn or digicash'),
  body('destination.pickupLocation')
    .if(body('method').equals('cash_pickup'))
    .notEmpty()
    .withMessage('Pickup location is required for cash pickup'),
  body('destination.recipientName')
    .if(body('method').equals('cash_pickup'))
    .notEmpty()
    .withMessage('Recipient name is required for cash pickup'),
  body('destination.recipientPhone')
    .if(body('method').equals('cash_pickup'))
    .matches(/^\+211[0-9]{8}$/)
    .withMessage('Valid recipient phone number is required for cash pickup'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
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
      amount,
      currency,
      method,
      destination,
      notes
    } = req.body;

    // Get merchant details
    const merchant = await User.findById(req.user.id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Check if merchant has sufficient balance
    const availableBalance = merchant.balance[currency] || 0;
    if (availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ${currency} ${availableBalance.toLocaleString()}, Requested: ${currency} ${amount.toLocaleString()}`
      });
    }

    // Check for pending payouts
    const pendingPayouts = await Payout.countDocuments({
      merchant: req.user.id,
      status: { $in: ['pending', 'processing'] }
    });

    if (pendingPayouts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have too many pending payouts. Please wait for them to be processed.'
      });
    }

    // Calculate processing fee
    const processingFee = Payout.calculateProcessingFee(method, amount, currency);
    const netAmount = amount - processingFee;

    if (netAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is too small after processing fees'
      });
    }

    // Validate merchant balance against the payout
    const isValidBalance = await Payout.validateMerchantBalance(req.user.id, amount, currency);
    if (!isValidBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this payout request'
      });
    }

    // Create payout request
    const payout = new Payout({
      merchant: req.user.id,
      amount,
      currency,
      method,
      destination,
      fees: {
        processing: processingFee
      },
      netAmount,
      notes,
      status: 'pending'
    });

    await payout.save();

    // Deduct amount from merchant balance (hold it)
    merchant.balance[currency] -= amount;
    await merchant.save();

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      payout: {
        _id: payout._id,
        payoutId: payout.payoutId,
        amount: payout.amount,
        currency: payout.currency,
        method: payout.method,
        netAmount: payout.netAmount,
        fees: payout.fees,
        status: payout.status,
        createdAt: payout.createdAt
      }
    });

  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a pending payout
router.put('/:payoutId/cancel', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
  try {
    const { payoutId } = req.params;

    const payout = await Payout.findOne({
      _id: payoutId,
      merchant: req.user.id
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payouts can be cancelled'
      });
    }

    // Cancel the payout
    await payout.cancel('Cancelled by merchant');

    // Refund the amount to merchant balance
    const merchant = await User.findById(req.user.id);
    merchant.balance[payout.currency] += payout.amount;
    await merchant.save();

    res.json({
      success: true,
      message: 'Payout cancelled successfully',
      payout
    });

  } catch (error) {
    console.error('Cancel payout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payout statistics
router.get('/stats/overview', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get overall payout statistics
    const overallStats = await Payout.getMerchantPayoutStats(userId);

    // Get this month's payouts
    const monthlyStats = await Payout.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: startOfMonth },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.processing' }
        }
      }
    ]);

    // Get this year's payouts
    const yearlyStats = await Payout.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: startOfYear },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.processing' }
        }
      }
    ]);

    // Get method breakdown
    const methodStats = await Payout.aggregate([
      {
        $match: {
          merchant: req.user.id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get currency breakdown
    const currencyStats = await Payout.aggregate([
      {
        $match: {
          merchant: req.user.id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$currency',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get pending payouts
    const pendingPayouts = await Payout.getPendingPayouts(userId);

    // Get recent payouts
    const recentPayouts = await Payout.find({
      merchant: userId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('payoutId amount currency method status createdAt completedAt')
    .lean();

    const stats = {
      overview: {
        totalPayouts: overallStats.totalPayouts || 0,
        completedPayouts: overallStats.completedPayouts || 0,
        totalAmount: overallStats.totalAmount || 0,
        totalFees: overallStats.totalFees || 0,
        averagePayout: overallStats.averagePayout || 0,
        successRate: overallStats.successRate || 0
      },
      thisMonth: {
        payouts: monthlyStats[0]?.count || 0,
        amount: monthlyStats[0]?.amount || 0,
        fees: monthlyStats[0]?.fees || 0
      },
      thisYear: {
        payouts: yearlyStats[0]?.count || 0,
        amount: yearlyStats[0]?.amount || 0,
        fees: yearlyStats[0]?.fees || 0
      },
      methods: methodStats.map(stat => ({
        method: stat._id,
        count: stat.count,
        amount: stat.amount,
        percentage: overallStats.completedPayouts > 0 
          ? (stat.count / overallStats.completedPayouts * 100).toFixed(1)
          : 0
      })),
      currencies: currencyStats.map(stat => ({
        currency: stat._id,
        count: stat.count,
        amount: stat.amount,
        percentage: overallStats.completedPayouts > 0 
          ? (stat.count / overallStats.completedPayouts * 100).toFixed(1)
          : 0
      })),
      pending: {
        count: pendingPayouts.length,
        amount: pendingPayouts.reduce((sum, p) => sum + p.amount, 0)
      },
      recent: recentPayouts
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get payout stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available payout methods and their fees
router.get('/methods', [auth, requireEmailVerification, merchantAuth], async (req, res) => {
  try {
    const methods = [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer to your bank account',
        processingTime: '1-3 business days',
        minAmount: {
          SSP: 1000,
          USD: 10
        },
        fees: {
          SSP: {
            fixed: 50,
            percentage: 1.5
          },
          USD: {
            fixed: 2,
            percentage: 1.5
          }
        },
        requiredFields: [
          'bankName',
          'accountNumber',
          'accountName'
        ]
      },
      {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'Transfer to your mobile money account',
        processingTime: '5-30 minutes',
        minAmount: {
          SSP: 500,
          USD: 5
        },
        fees: {
          SSP: {
            fixed: 25,
            percentage: 1.0
          },
          USD: {
            fixed: 1,
            percentage: 1.0
          }
        },
        requiredFields: [
          'phoneNumber',
          'provider'
        ],
        providers: [
          { id: 'mtn', name: 'MTN Mobile Money' },
          { id: 'digicash', name: 'Digicash' }
        ]
      },
      {
        id: 'cash_pickup',
        name: 'Cash Pickup',
        description: 'Pick up cash at designated locations',
        processingTime: '2-4 hours',
        minAmount: {
          SSP: 2000,
          USD: 20
        },
        fees: {
          SSP: {
            fixed: 100,
            percentage: 2.0
          },
          USD: {
            fixed: 5,
            percentage: 2.0
          }
        },
        requiredFields: [
          'pickupLocation',
          'recipientName',
          'recipientPhone'
        ],
        locations: [
          'Juba - Konyo Konyo Market',
          'Juba - Juba One Market',
          'Wau - Wau Central Market',
          'Malakal - Malakal Market'
        ]
      }
    ];

    res.json({
      success: true,
      methods
    });

  } catch (error) {
    console.error('Get payout methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate payout fees
router.post('/calculate-fees', [
  auth,
  merchantAuth,
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .isIn(['SSP', 'USD'])
    .withMessage('Currency must be either SSP or USD'),
  body('method')
    .isIn(['bank_transfer', 'mobile_money', 'cash_pickup'])
    .withMessage('Method must be bank_transfer, mobile_money, or cash_pickup')
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

    const { amount, currency, method } = req.body;

    // Calculate processing fee
    const processingFee = Payout.calculateProcessingFee(method, amount, currency);
    const netAmount = amount - processingFee;

    res.json({
      success: true,
      calculation: {
        requestedAmount: amount,
        currency,
        method,
        processingFee,
        netAmount,
        feePercentage: ((processingFee / amount) * 100).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Calculate fees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;