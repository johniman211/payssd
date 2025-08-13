const express = require('express');
const { query, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { auth, merchantAuth, apiKeyAuth } = require('../middleware/auth');
const router = express.Router();

// Middleware to allow either JWT merchant auth or API key auth
const merchantApiAuth = async (req, res, next) => {
  // Try API key first
  const key = req.header('X-API-Key');
  if (key) {
    return apiKeyAuth(req, res, next);
  }
  // Fallback to JWT merchant auth
  return auth(req, res, (err) => {
    if (err) return next(err);
    return merchantAuth(req, res, next);
  });
};

// Get merchant transactions with filtering and pagination
router.get('/', [merchantApiAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'successful', 'failed', 'expired']).withMessage('Invalid status'),
  query('paymentMethod').optional().isIn(['mtn_momo', 'digicash']).withMessage('Invalid payment method'),
  query('currency').optional().isIn(['SSP', 'USD']).withMessage('Invalid currency'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('Minimum amount must be a positive number'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Maximum amount must be a positive number'),
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters')
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
      paymentMethod,
      currency,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search
    } = req.query;

    // Build filter query
    const filter = { merchant: req.user.id };

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (currency) filter.currency = currency;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    // Search filter (transaction ID, customer name, description)
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-providerResponse -metadata')
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      transactions,
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
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single transaction details
router.get('/:transactionId', [merchantApiAuth], async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      transactionId,
      merchant: req.user.id
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction analytics
router.get('/analytics/overview', [merchantApiAuth], async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Date ranges
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get overall statistics
    const overallStats = await Transaction.getMerchantStats(userId);

    // Get today's transactions
    const todayStats = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.total' }
        }
      }
    ]);

    // Get yesterday's transactions for comparison
    const yesterdayStats = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: yesterday, $lt: today }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get weekly stats
    const weeklyStats = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: startOfWeek },
          status: 'successful'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.total' }
        }
      }
    ]);

    // Get monthly stats
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          createdAt: { $gte: startOfMonth },
          status: 'successful'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.total' }
        }
      }
    ]);

    // Get payment method breakdown
    const paymentMethodStats = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          status: 'successful'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get currency breakdown
    const currencyStats = await Transaction.aggregate([
      {
        $match: {
          merchant: req.user.id,
          status: 'successful'
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

    // Process today's stats
    const todaySuccessful = todayStats.find(s => s._id === 'successful') || { count: 0, amount: 0, fees: 0 };
    const todayFailed = todayStats.find(s => s._id === 'failed') || { count: 0, amount: 0 };
    const todayPending = todayStats.find(s => s._id === 'pending') || { count: 0, amount: 0 };

    // Process yesterday's stats for comparison
    const yesterdaySuccessful = yesterdayStats.find(s => s._id === 'successful') || { count: 0, amount: 0 };

    // Calculate growth percentages
    const transactionGrowth = yesterdaySuccessful.count > 0 
      ? ((todaySuccessful.count - yesterdaySuccessful.count) / yesterdaySuccessful.count * 100).toFixed(1)
      : todaySuccessful.count > 0 ? 100 : 0;

    const revenueGrowth = yesterdaySuccessful.amount > 0 
      ? ((todaySuccessful.amount - yesterdaySuccessful.amount) / yesterdaySuccessful.amount * 100).toFixed(1)
      : todaySuccessful.amount > 0 ? 100 : 0;

    const analytics = {
      overview: {
        totalTransactions: overallStats.totalTransactions || 0,
        successfulTransactions: overallStats.successfulTransactions || 0,
        totalRevenue: overallStats.totalAmount || 0,
        totalFees: overallStats.totalFees || 0,
        averageTransaction: overallStats.averageTransaction || 0,
        successRate: overallStats.successRate || 0
      },
      today: {
        successful: todaySuccessful.count,
        failed: todayFailed.count,
        pending: todayPending.count,
        revenue: todaySuccessful.amount,
        fees: todaySuccessful.fees,
        transactionGrowth: parseFloat(transactionGrowth),
        revenueGrowth: parseFloat(revenueGrowth)
      },
      thisWeek: {
        transactions: weeklyStats[0]?.count || 0,
        revenue: weeklyStats[0]?.amount || 0,
        fees: weeklyStats[0]?.fees || 0
      },
      thisMonth: {
        transactions: monthlyStats[0]?.count || 0,
        revenue: monthlyStats[0]?.amount || 0,
        fees: monthlyStats[0]?.fees || 0
      },
      paymentMethods: paymentMethodStats.map(stat => ({
        method: stat._id,
        count: stat.count,
        amount: stat.amount,
        percentage: overallStats.successfulTransactions > 0 
          ? (stat.count / overallStats.successfulTransactions * 100).toFixed(1)
          : 0
      })),
      currencies: currencyStats.map(stat => ({
        currency: stat._id,
        count: stat.count,
        amount: stat.amount,
        percentage: overallStats.successfulTransactions > 0 
          ? (stat.count / overallStats.successfulTransactions * 100).toFixed(1)
          : 0
      }))
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction trends (daily data for charts)
router.get('/analytics/trends', [merchantApiAuth,
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Period must be one of: 7d, 30d, 90d, 1y'),
  query('currency').optional().isIn(['SSP', 'USD']).withMessage('Invalid currency')
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

    const { period = '30d', currency } = req.query;
    const userId = req.user.id;
    const now = new Date();

    // Calculate date range based on period
    let startDate;
    let groupFormat;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
    }

    // Build match criteria
    const matchCriteria = {
      merchant: req.user.id,
      createdAt: { $gte: startDate },
      status: 'successful'
    };

    if (currency) {
      matchCriteria.currency = currency;
    }

    // Get daily/monthly trends
    const trends = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            currency: '$currency'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.total' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          currencies: {
            $push: {
              currency: '$_id.currency',
              count: '$count',
              amount: '$amount',
              fees: '$fees'
            }
          },
          totalCount: { $sum: '$count' },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fees' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get payment method trends
    const paymentMethodTrends = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            paymentMethod: '$paymentMethod'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          methods: {
            $push: {
              method: '$_id.paymentMethod',
              count: '$count',
              amount: '$amount'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      trends: {
        period,
        startDate,
        endDate: now,
        daily: trends,
        paymentMethods: paymentMethodTrends
      }
    });

  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export transactions to CSV
router.get('/export/csv', [merchantApiAuth,
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('status').optional().isIn(['pending', 'successful', 'failed', 'expired']).withMessage('Invalid status')
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

    const { startDate, endDate, status } = req.query;

    // Build filter
    const filter = { merchant: req.user.id };
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .select('transactionId amount currency status paymentMethod customer description fees createdAt completedAt')
      .lean();

    // Generate CSV content
    const csvHeaders = [
      'Transaction ID',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Description',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Platform Fee',
      'Provider Fee',
      'Total Fee',
      'Merchant Receives',
      'Completed At'
    ];

    const csvRows = transactions.map(transaction => [
      transaction.transactionId,
      new Date(transaction.createdAt).toISOString(),
      transaction.customer.name,
      transaction.customer.phoneNumber,
      transaction.description,
      transaction.amount,
      transaction.currency,
      transaction.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Digicash',
      transaction.status,
      transaction.fees?.platform || 0,
      transaction.fees?.provider || 0,
      transaction.fees?.total || 0,
      transaction.fees?.merchantReceives || transaction.amount,
      transaction.completedAt ? new Date(transaction.completedAt).toISOString() : ''
    ]);

    // Create CSV content
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Set response headers for file download
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent));

    res.send(csvContent);

  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;