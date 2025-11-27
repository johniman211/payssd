const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Payouts, Users } = require('../services/supabaseRepo');
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
    .isIn(['USD'])
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

    const { data: payouts, totalCount } = await Payouts.list(req.user.id, {
      status,
      currency,
      method,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    })

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

    const payout = await Payouts.getByPayoutId(req.user.id, payoutId)

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
    .isFloat({ min: 10 })
    .withMessage('Amount must be at least 10'),
  body('currency')
    .isIn(['USD'])
    .withMessage('Currency must be USD'),
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
  body('destination.mobileNumber')
    .if(body('method').equals('mobile_money'))
    .matches(/^\+211[0-9]{8}$/)
    .withMessage('Valid South Sudan phone number is required for mobile money'),
  body('destination.mobileProvider')
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

    const { amount, currency, method, destination, notes } = req.body;

    // Get merchant details
    const merchant = await Users.getById(req.user.id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Check if merchant has sufficient balance
    const availableBalance = merchant?.balance?.available || 0;
    if (availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ${currency} ${availableBalance.toLocaleString()}, Requested: ${currency} ${amount.toLocaleString()}`
      });
    }

    // Check for pending payouts
    const pendingPayouts = await Payouts.countPending(req.user.id)

    if (pendingPayouts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have too many pending payouts. Please wait for them to be processed.'
      });
    }

    // Calculate processing fee
    const processingFee = Payouts.calculateProcessingFee(amount, method);
    const netAmount = amount - processingFee;

    if (netAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is too small after processing fees'
      });
    }

    // Validate merchant balance against the payout
    if (availableBalance < amount + processingFee) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this payout request including fees'
      });
    }

    // Create payout request
    const payout = await Payouts.create({ user_id: req.user.id, amount, currency, method, destination, notes })

    // Hold funds will occur on admin approval via process()

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      payout: {
        _id: payout.id,
        payoutId: payout.payout_id,
        amount: payout.amount,
        currency: payout.currency,
        payoutMethod: payout.method,
        fees: payout.fees,
        status: payout.status,
        createdAt: payout.created_at
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

    const payout = await Payouts.getByPayoutId(req.user.id, payoutId)

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

    await Payouts.cancel(req.user.id, payoutId)

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
    const overallStats = await Payouts.statsOverview(userId);

    // Get this month's payouts
    const { data: monthlyRows } = await require('../services/supabaseClient').supabase
      .from('payouts')
      .select('amount,fees')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString())
    const monthlyStats = [{
      count: (monthlyRows || []).length,
      amount: (monthlyRows || []).reduce((s,p)=>s+(p.amount||0),0),
      fees: (monthlyRows || []).reduce((s,p)=>s+((p.fees?.processingFee)||0),0)
    }]

    // Get this year's payouts
    const { data: yearlyRows } = await require('../services/supabaseClient').supabase
      .from('payouts')
      .select('amount,fees')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startOfYear.toISOString())
    const yearlyStats = [{
      count: (yearlyRows || []).length,
      amount: (yearlyRows || []).reduce((s,p)=>s+(p.amount||0),0),
      fees: (yearlyRows || []).reduce((s,p)=>s+((p.fees?.processingFee)||0),0)
    }]

    // Get method breakdown
    const { data: methodRows } = await require('../services/supabaseClient').supabase
      .from('payouts')
      .select('method,amount,status')
      .eq('user_id', userId)
      .eq('status', 'completed')
    const methodStats = Object.values((methodRows||[]).reduce((acc,row)=>{
      const k=row.method; if(!acc[k]) acc[k]={ _id:k, count:0, amount:0 }
      acc[k].count += 1; acc[k].amount += (row.amount||0); return acc
    },{}))

    // Get currency breakdown
    const { data: currencyRows } = await require('../services/supabaseClient').supabase
      .from('payouts')
      .select('currency,amount,status')
      .eq('user_id', userId)
      .eq('status', 'completed')
    const currencyStats = Object.values((currencyRows||[]).reduce((acc,row)=>{
      const k=row.currency; if(!acc[k]) acc[k]={ _id:k, count:0, amount:0 }
      acc[k].count += 1; acc[k].amount += (row.amount||0); return acc
    },{}))

    // Get pending payouts
    const { data: pendingRows } = await require('../services/supabaseClient').supabase
      .from('payouts')
      .select('amount')
      .eq('user_id', userId)
      .in('status', ['pending','processing'])

    // Get recent payouts
    const recentPayouts = overallStats.recent.map(r=>({
      payoutId: r.payout_id,
      amount: r.amount,
      currency: r.currency,
      payoutMethod: r.method,
      status: r.status,
      createdAt: r.created_at,
      completedAt: r.completed_at
    }))

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
        count: (pendingRows||[]).length,
        amount: (pendingRows||[]).reduce((sum, p) => sum + (p.amount||0), 0)
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
          'mobileNumber',
          'mobileProvider'
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
    .isIn(['USD'])
    .withMessage('Currency must be USD'),
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
    const processingFee = Payout.calculateProcessingFee(amount, method);
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
