const express = require('express');
const { query, body, param, validationResult } = require('express-validator');
const { Users, Transactions, Payouts } = require('../services/supabaseRepo');
const { supabase } = require('../services/supabaseClient');
const { auth, adminAuth } = require('../middleware/auth');
const { sendKYCApprovedEmail, sendKYCRejectedEmail, sendAdminNewUserEmail, sendAdminUserDeletedEmail } = require('../services/notificationService');
const { getSettings, updateSettings } = require('../services/settingsStore');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User statistics
    const { count: totalUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role','merchant');
    const { count: activeUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role','merchant').eq('is_active', true);
    const { count: newThisMonth } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role','merchant').gte('created_at', startOfMonth.toISOString());
    const { count: lastMonthUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role','merchant').gte('created_at', lastMonth.toISOString()).lt('created_at', startOfMonth.toISOString());

    // Transaction statistics
    const { count: totalTransactions } = await supabase.from('transactions').select('id', { count:'exact', head:true });
    const { count: successfulTransactions } = await supabase.from('transactions').select('id', { count:'exact', head:true }).eq('status','successful');
    const { count: failedTransactions } = await supabase.from('transactions').select('id', { count:'exact', head:true }).eq('status','failed');
    const { count: pendingTransactions } = await supabase.from('transactions').select('id', { count:'exact', head:true }).eq('status','pending');

    // Revenue calculations
    const { data: totalRows } = await supabase.from('transactions').select('amount').eq('status','successful');
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const { data: todayRows } = await supabase.from('transactions').select('amount').eq('status','successful').gte('created_at', todayStart.toISOString());
    const { data: monthRows } = await supabase.from('transactions').select('amount').eq('status','successful').gte('created_at', startOfMonth.toISOString());
    const { data: lastMonthRows } = await supabase.from('transactions').select('amount').eq('status','successful').gte('created_at', lastMonth.toISOString()).lt('created_at', startOfMonth.toISOString());

    const sum = (arr) => (arr||[]).reduce((s,r)=>s+(r.amount||0),0);
    const totalAmount = sum(totalRows);
    const todayAmount = sum(todayRows);
    const thisMonth = sum(monthRows);
    const lastMonthAmount = sum(lastMonthRows);

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 ? ((newThisMonth - lastMonthUsers) / lastMonthUsers * 100) : 0;
    const revenueGrowth = lastMonthAmount > 0 ? ((thisMonth - lastMonthAmount) / lastMonthAmount * 100) : 0;
    const transactionGrowth = 0; // You can implement this based on your needs

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        pendingKyc: (await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('kyc->>status','pending')).count || 0,
        newThisMonth,
        growth: userGrowth
      },
      transactions: {
        total: totalTransactions,
        successful: successfulTransactions,
        failed: failedTransactions,
        pending: pendingTransactions,
        totalAmount,
        todayAmount,
        growth: transactionGrowth
      },
      revenue: {
        total: totalAmount,
        thisMonth,
        lastMonth: lastMonthAmount,
        growth: revenueGrowth
      },
      kyc: {
        pending: (await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('kyc->>status','pending')).count || 0,
        approved: (await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('kyc->>status','approved')).count || 0,
        rejected: (await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('kyc->>status','rejected')).count || 0,
        total: (await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').not('kyc->>status','is','null')).count || 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/recent-activity', [auth, adminAuth], async (req, res) => {
  try {
    const activities = [];
    
    // Recent user registrations
    const { data: recentUsers } = await supabase
      .from('users')
      .select('email,profile,created_at')
      .eq('role','merchant')
      .order('created_at',{ ascending:false })
      .limit(5);
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        message: `New user registered: ${user.profile.firstName} ${user.profile.lastName}`,
        timestamp: user.createdAt,
        user: user.email
      });
    });

    // Recent transactions
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('amount,status,created_at,user_id')
      .order('created_at',{ ascending:false })
      .limit(5);
    const userEmails = {};
    for (const t of recentTransactions||[]) {
      if (t.user_id && !userEmails[t.user_id]) {
        const { data: u } = await supabase.from('users').select('email').eq('id', t.user_id).limit(1).maybeSingle();
        userEmails[t.user_id] = u?.email || '';
      }
    }
    
    recentTransactions.forEach(transaction => {
      activities.push({
        type: 'transaction',
        message: `Transaction ${transaction.status}: USD ${transaction.amount}`,
        timestamp: transaction.createdAt,
        user: transaction.merchant?.email
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending KYC submissions
router.get('/pending-kyc', [auth, adminAuth], async (req, res) => {
  try {
    const pendingKyc = await User.find({ 
      role: 'merchant', 
      'kyc.status': 'pending' 
    })
    .select('email profile.firstName profile.lastName kyc.submittedAt kyc.documents')
    .sort({ 'kyc.submittedAt': -1 })
    .limit(10);
    
    res.json(pendingKyc);
  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent transactions for dashboard
router.get('/recent-transactions', [auth, adminAuth], async (req, res) => {
  try {
    const recentTransactions = await Transaction.find()
      .populate('merchant', 'email profile.firstName profile.lastName profile.businessName')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount status paymentMethod createdAt merchant reference');
    
    res.json(recentTransactions);
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform overview statistics
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User statistics
    const { count: totalUsers2 } = await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant');
    const { count: activeUsers2 } = await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('is_active', true);
    const { count: kycPendingUsers } = await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('kyc->>status','pending');
    const { count: kycApprovedUsers } = await supabase.from('users').select('id',{count:'exact',head:true}).eq('role','merchant').eq('kyc->>status','approved');

    // Transaction statistics
    const { count: totalTransactions2 } = await supabase.from('transactions').select('id',{count:'exact',head:true});
    const { count: todayTransactions } = await supabase.from('transactions').select('id',{count:'exact',head:true}).gte('created_at', startOfDay.toISOString());
    const { count: weeklyTransactions } = await supabase.from('transactions').select('id',{count:'exact',head:true}).gte('created_at', startOfWeek.toISOString());
    const { count: monthlyTransactions } = await supabase.from('transactions').select('id',{count:'exact',head:true}).gte('created_at', startOfMonth.toISOString());

    // Revenue statistics
    const { data: succRows } = await supabase.from('transactions').select('amount,fees').eq('status','successful');
    const totalRevenue = (succRows||[]).reduce((s,t)=>s+(t.amount||0),0);
    const totalFees = (succRows||[]).reduce((s,t)=>s+((t.fees?.total||t.fees?.totalFees||0)),0);
    const avgTransaction = (succRows||[]).length ? totalRevenue / (succRows||[]).length : 0;

    // Today's revenue
    const { data: todaySucc } = await supabase.from('transactions').select('amount,fees').eq('status','successful').gte('created_at', startOfDay.toISOString());
    const todayRevenueAmt = (todaySucc||[]).reduce((s,t)=>s+(t.amount||0),0);
    const todayFeesAmt = (todaySucc||[]).reduce((s,t)=>s+((t.fees?.total||t.fees?.totalFees||0)),0);
    const todayCount = (todaySucc||[]).length;

    // Payment method breakdown
    const { data: pmAll } = await supabase.from('transactions').select('payment_method,amount').eq('status','successful');
    const paymentMethodStats = Object.values((pmAll||[]).reduce((acc,row)=>{ const k=row.payment_method; if(!acc[k]) acc[k]={ _id:k, count:0, amount:0 }; acc[k].count+=1; acc[k].amount+=(row.amount||0); return acc; },{}));

    // Currency breakdown
    const { data: curAll } = await supabase.from('transactions').select('currency,amount').eq('status','successful');
    const currencyStats = Object.values((curAll||[]).reduce((acc,row)=>{ const k=row.currency; if(!acc[k]) acc[k]={ _id:k, count:0, amount:0 }; acc[k].count+=1; acc[k].amount+=(row.amount||0); return acc; },{}));

    // Payout statistics
    const { count: totalPayouts } = await supabase.from('payouts').select('id',{count:'exact',head:true});
    const { count: pendingPayouts } = await supabase.from('payouts').select('id',{count:'exact',head:true}).eq('status','pending');

    const { data: payoutRows } = await supabase.from('payouts').select('status,amount');
    const payoutAgg = (payoutRows||[]).reduce((acc,p)=>{ const k=p.status; if(!acc[k]) acc[k]={ count:0, amount:0 }; acc[k].count+=1; acc[k].amount+=(p.amount||0); return acc; },{});

    const stats = {
      users: {
        total: totalUsers2,
        active: activeUsers2,
        kycPending: kycPendingUsers,
        kycApproved: kycApprovedUsers,
        kycApprovalRate: totalUsers > 0 ? ((kycApprovedUsers / totalUsers) * 100).toFixed(1) : 0
      },
      transactions: {
        total: totalTransactions2,
        today: todayTransactions,
        thisWeek: weeklyTransactions,
        thisMonth: monthlyTransactions
      },
      revenue: {
        total: totalRevenue,
        totalFees: totalFees,
        average: avgTransaction,
        today: todayRevenueAmt,
        todayFees: todayFeesAmt,
        todayCount: todayCount
      },
      paymentMethods: paymentMethodStats.map(stat => ({
        method: stat._id,
        count: stat.count,
        amount: stat.amount
      })),
      currencies: currencyStats.map(stat => ({
        currency: stat._id,
        count: stat.count,
        amount: stat.amount
      })),
      payouts: {
        total: totalPayouts,
        pending: pendingPayouts,
        completed: payoutAmount.find(p => p._id === 'completed')?.count || 0,
        completedAmount: payoutAmount.find(p => p._id === 'completed')?.amount || 0,
        pendingAmount: payoutAmount.find(p => p._id === 'pending')?.amount || 0
      }
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with filtering and pagination
router.get('/users', [
  auth,
  adminAuth,
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
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  query('kycStatus')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid KYC status'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
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
      kycStatus,
      search
    } = req.query;

    // Build filter query
    const filter = { role: 'merchant' };

    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (kycStatus) filter['kyc.status'] = kycStatus;

    // Search filter
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { 'profile.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -apiKeys.secretKey')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    // Get transaction counts for each user
    const userIds = users.map(user => user._id);
    const transactionCounts = await Transaction.aggregate([
      { $match: { merchant: { $in: userIds } } },
      {
        $group: {
          _id: '$merchant',
          totalTransactions: { $sum: 1 },
          successfulTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Merge transaction data with users and flatten user data
    const usersWithStats = users.map(user => {
      const stats = transactionCounts.find(tc => tc._id.toString() === user._id.toString());
      return {
        ...user,
        // Flatten profile data for frontend compatibility
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phoneNumber || '',
        businessName: user.profile?.businessName || '',
        businessType: user.profile?.businessType || '',
        city: user.profile?.address?.city || '',
        country: user.profile?.address?.country || '',
        // Flatten KYC data
        kycStatus: user.kyc?.status || 'not_submitted',
        kycSubmittedAt: user.kyc?.submittedAt,
        kycReviewedAt: user.kyc?.reviewedAt,
        stats: {
          totalTransactions: stats?.totalTransactions || 0,
          successfulTransactions: stats?.successfulTransactions || 0,
          totalRevenue: stats?.totalRevenue || 0
        }
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Calculate user statistics for the frontend
    const stats = {
      total: totalCount,
      active: await User.countDocuments({ role: 'merchant', isActive: true }),
      inactive: await User.countDocuments({ role: 'merchant', isActive: false }),
      merchants: await User.countDocuments({ role: 'merchant' }),
      admins: await User.countDocuments({ role: 'admin' }),
      kycApproved: await User.countDocuments({ role: 'merchant', 'kyc.status': 'approved' }),
      kycPending: await User.countDocuments({ role: 'merchant', 'kyc.status': 'pending' })
    };

    res.json({
      success: true,
      users: usersWithStats,
      stats,
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
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user details
router.get('/users/:userId', [auth, adminAuth], async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -apiKeys.secretKey')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's transaction statistics
    const transactionStats = await Transaction.getMerchantStats(userId);

    // Get recent transactions
    const recentTransactions = await Transaction.find({ merchant: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('transactionId amount currency status paymentMethod customer createdAt')
      .lean();

    // Get payout statistics
    const payoutStats = await Payout.aggregate([
      { $match: { merchant: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        stats: {
          transactions: transactionStats,
          payouts: payoutStats,
          recentTransactions
        }
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (activate/deactivate)
router.put('/users/:userId/status', [
  auth,
  adminAuth,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
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

    const { userId } = req.params;
    const { isActive, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify admin user status'
      });
    }

    user.isActive = isActive;
    user.updatedAt = new Date();
    
    // Add admin note
    if (reason) {
      user.adminNotes = user.adminNotes || [];
      user.adminNotes.push({
        note: `Status changed to ${isActive ? 'active' : 'inactive'}: ${reason}`,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activate user (admin only)
router.put('/users/:userId/activate', [
  auth,
  adminAuth,
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
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

    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin user status' });
    }

    user.isActive = true;
    user.updatedAt = new Date();

    if (reason) {
      user.adminNotes = user.adminNotes || [];
      user.adminNotes.push({
        note: `Status changed to active: ${reason}`,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
      user: { _id: user._id, email: user.email, isActive: user.isActive }
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user (admin only)
router.put('/users/:userId/deactivate', [
  auth,
  adminAuth,
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
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

    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin user status' });
    }

    user.isActive = false;
    user.updatedAt = new Date();

    if (reason) {
      user.adminNotes = user.adminNotes || [];
      user.adminNotes.push({
        note: `Status changed to inactive: ${reason}`,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
      user: { _id: user._id, email: user.email, isActive: user.isActive }
    });

    // Send admin deletion notification (non-blocking)
    try {
      if (process.env.ADMIN_EMAIL) {
        sendAdminUserDeletedEmail(user, req.user, reason).catch(err => 
          console.error('Admin user deleted email failed:', err?.message || err)
        );
      }
    } catch (adminEmailErr) {
      console.error('Error scheduling admin user deleted email:', adminEmailErr);
    }

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', [
  auth,
  adminAuth,
  // Validate userId path param
  param('userId').isMongoId().withMessage('Invalid user id'),
  // Make confirmation optional to align with client implementation
  body('confirmation')
    .optional()
    .custom(val => val === undefined || val === 'DELETE')
    .withMessage('Confirmation must be DELETE when provided'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters')
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

    const { userId } = req.params;
    // Axios.delete sends body as config.data; ensure we read from either body or query/header if needed
    const reason = (req.body && req.body.reason) || req.query.reason || undefined;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Check if user has pending transactions
    const Transaction = require('../models/Transaction');
    const pendingTransactions = await Transaction.countDocuments({
      merchant: userId,
      status: { $in: ['pending', 'processing'] }
    });

    if (pendingTransactions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with pending transactions. Please wait for all transactions to complete.'
      });
    }

    // Check if user has remaining balance (guard against missing balance object)
    const hasBalance = user.balance && ((user.balance.available || 0) > 0 || (user.balance.pending || 0) > 0);
    if (hasBalance) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with remaining balance. Please process payouts first.'
      });
    }

    // Instead of hard delete, deactivate and anonymize the user to preserve transaction history
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;

    // Ensure profile exists and contains required fields to satisfy schema validation
    if (!user.profile) {
      user.profile = {
        firstName: 'Deleted',
        lastName: 'User',
        phoneNumber: 'deleted',
        businessName: 'Deleted Business',
        address: {
          city: 'Juba',
          country: 'South Sudan'
        }
      };
    } else {
      user.profile.firstName = 'Deleted';
      user.profile.lastName = 'User';
      user.profile.phoneNumber = 'deleted';
      user.profile.businessName = 'Deleted Business';
      // Ensure address exists with required fields
      if (!user.profile.address) {
        user.profile.address = { city: 'Juba', country: 'South Sudan' };
      } else {
        if (!user.profile.address.city) user.profile.address.city = 'Juba';
        if (!user.profile.address.country) user.profile.address.country = 'South Sudan';
      }
    }

    user.password = 'deleted_password_' + Date.now();
    user.apiKeys = undefined;
    user.updatedAt = new Date();
    
    // Add admin note
    user.adminNotes = user.adminNotes || [];
    user.adminNotes.push({
      note: `User deleted by admin: ${reason || 'No reason provided'}`,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'User has been successfully deleted and anonymized'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors || {}).map(e => ({ msg: e.message, path: e.path }))
      });
    }
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error',
        keyValue: error.keyValue
      });
    }
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? (error?.message || 'Server error') : 'Server error'
    });
  }
});

// Get all transactions (admin view)
router.get('/transactions', [
  auth,
  adminAuth,
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
    .isIn(['pending', 'successful', 'failed', 'expired'])
    .withMessage('Invalid status'),
  query('paymentMethod')
    .optional()
    .isIn(['mtn_momo', 'digicash'])
    .withMessage('Invalid payment method'),
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
      paymentMethod,
      startDate,
      endDate
    } = req.query;

    // Build filter query
    const filter = {};

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with merchant details
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate('merchant', 'email profile.firstName profile.lastName profile.businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-providerResponse -metadata')
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    // Calculate stats for all transactions (not just current page)
    const statsQuery = [];
    
    // Get counts by status
    const statusStats = await Transaction.aggregate([
      { $match: {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate overall stats
    const allStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successful: { $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const stats = allStats[0] || {
      total: 0,
      totalAmount: 0,
      successful: 0,
      pending: 0,
      failed: 0,
      avgAmount: 0
    };

    stats.successRate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;
    stats.todayTransactions = todayStats[0]?.count || 0;
    stats.todayAmount = todayStats[0]?.amount || 0;

    // Transform transactions to match frontend expectations
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.transactionId,
      transactionId: transaction.transactionId,
      merchantName: transaction.merchant?.profile?.businessName || 
                   `${transaction.merchant?.profile?.firstName || ''} ${transaction.merchant?.profile?.lastName || ''}`.trim() ||
                   'Unknown Merchant',
      merchantEmail: transaction.merchant?.email || '',
      customerPhone: transaction.customer?.phoneNumber || '',
      customerEmail: transaction.customer?.email || '',
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      description: transaction.description,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
      fees: transaction.fees
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      transactions: transformedTransactions,
      stats,
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
    console.error('Get admin transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payouts (admin view)
router.get('/payouts', [
  auth,
  adminAuth,
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
      startDate,
      endDate,
      format
    } = req.query;

    // Build filter query
    const filter = {};

    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payouts with merchant details and stats
    const { data: payouts } = await supabase
      .from('payouts')
      .select('payout_id,amount,status,created_at,completed_at,user_id,destination')
      .order('created_at',{ ascending:false })
      .range(skip, skip + parseInt(limit) - 1)
    const { count: totalCount } = await supabase.from('payouts').select('id',{count:'exact',head:true});
    const { data: statRows } = await supabase.from('payouts').select('status,amount');
    const statsAgg = (statRows||[]).reduce((acc,p)=>{ const k=p.status; if(!acc[k]) acc[k]={ count:0, amount:0 }; acc[k].count+=1; acc[k].amount+=(p.amount||0); return acc; },{});
    const stats = [{
      total: (statRows||[]).length,
      pending: statsAgg.pending?.count || 0,
      processing: statsAgg.processing?.count || 0,
      completed: statsAgg.completed?.count || 0,
      failed: statsAgg.failed?.count || 0,
      cancelled: statsAgg.cancelled?.count || 0,
      totalAmount: (statRows||[]).reduce((s,p)=>s+(p.amount||0),0),
      pendingAmount: statsAgg.pending?.amount || 0,
      processingAmount: statsAgg.processing?.amount || 0,
      completedAmount: statsAgg.completed?.amount || 0,
      failedAmount: statsAgg.failed?.amount || 0,
      cancelledAmount: statsAgg.cancelled?.amount || 0
    }];

    // Calculate 'approved' as processing status for UI compatibility
    const statsData = stats[0] || {};
    statsData.approved = statsData.processing || 0;
    statsData.rejected = (statsData.failed || 0) + (statsData.cancelled || 0);
    statsData.approvedAmount = statsData.processingAmount || 0;
    statsData.rejectedAmount = (statsData.failedAmount || 0) + (statsData.cancelledAmount || 0);

    if (format === 'csv') {
      const csvData = (payouts||[]).map(p => ({
        Reference: p.payout_id,
        Amount: p.amount,
        Status: p.status,
        'Bank Name': p.destination?.bankName,
        'Account Number': p.destination?.accountNumber,
        'Merchant Email': '',
        'Merchant Name': '',
        'Business Name': '',
        'Created At': p.created_at,
        'Processed At': p.completed_at
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payouts.csv');
      
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        payouts,
        stats: {
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          approved: statsData.approved || 0,
          completed: statsData.completed || 0,
          rejected: statsData.rejected || 0,
          totalAmount: statsData.totalAmount || 0,
          pendingAmount: statsData.pendingAmount || 0,
          processingAmount: statsData.processingAmount || 0,
          completedAmount: statsData.completedAmount || 0,
          failedAmount: statsData.failedAmount || 0,
          cancelledAmount: statsData.cancelledAmount || 0,
          approvedAmount: statsData.approvedAmount || 0,
          rejectedAmount: statsData.rejectedAmount || 0,
          processing: statsData.processing || 0,
          failed: statsData.failed || 0,
          cancelled: statsData.cancelled || 0
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      });
    }
  } catch (error) {
    console.error('Get admin payouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payout (approve/reject)
router.put('/payouts/:payoutId/process', [
  auth,
  adminAuth,
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  body('notes')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Notes must be between 5 and 500 characters'),
  body('externalReference')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('External reference must be between 5 and 100 characters')
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

    const { payoutId } = req.params;
    const { action, notes, externalReference } = req.body;

    const { data: payout } = await supabase.from('payouts').select('*,users!inner(email,balance)').eq('id', payoutId).limit(1).maybeSingle();
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout is not in pending status'
      });
    }

    if (action === 'approve') {
      const fee = Payouts.calculateProcessingFee(payout.amount, payout.method)
      const dec = (payout.amount || 0) + fee
      await supabase.from('payouts').update({ status:'processing', processed_at: new Date().toISOString(), admin_notes: notes || null }).eq('id', payoutId)
      const { data: u } = await supabase.from('users').select('balance').eq('id', payout.user_id).limit(1).maybeSingle()
      const newAvail = Math.max(0, (u?.balance?.available || 0) - dec)
      await supabase.from('users').update({ balance: { ...(u?.balance||{}), available: newAvail } }).eq('id', payout.user_id)
      if (externalReference) {
        await supabase.from('payouts').update({ status:'completed', completed_at: new Date().toISOString(), external_reference: externalReference }).eq('id', payoutId)
      }
      res.json({ success:true, message:'Payout approved and processed successfully', payout:{ ...payout, status: externalReference ? 'completed' : 'processing' } })
    } else {
      await supabase.from('payouts').update({ status:'failed', cancelled_at: new Date().toISOString(), cancel_reason: notes || 'Rejected by admin' }).eq('id', payoutId)
      res.json({ success:true, message:'Payout rejected successfully', payout:{ ...payout, status:'failed' } })
    }

  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform analytics trends
router.get('/analytics/trends', [
  auth,
  adminAuth,
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be one of: 7d, 30d, 90d, 1y')
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

    const { period = '30d' } = req.query;
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

    // Get transaction trends
    const transactionTrends = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          fees: { $sum: '$fees.platform' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
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

    // Get user registration trends
    const userTrends = await User.aggregate([
      {
        $match: {
          role: 'merchant',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          newUsers: { $sum: 1 },
          kycSubmitted: {
            $sum: { $cond: [{ $ne: ['$kyc.status', null] }, 1, 0] }
          },
          kycApproved: {
            $sum: { $cond: [{ $eq: ['$kyc.status', 'approved'] }, 1, 0] }
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
        transactions: transactionTrends,
        users: userTrends
      }
    });

  } catch (error) {
    console.error('Get admin trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get KYC submissions for admin review
router.get('/kyc-submissions', [auth, adminAuth], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Base filter for merchants with KYC data
    const baseFilter = {
      role: 'merchant',
      'kyc.status': { $ne: 'not_submitted' }
    };

    // Add status filter if specified
    const filter = status && status !== 'all' 
      ? { ...baseFilter, 'kyc.status': status }
      : baseFilter;

    // Get submissions and stats in parallel
    const [submissions, totalCount, stats] = await Promise.all([
      User.find(filter)
        .select('email profile kyc createdAt')
        .sort({ 'kyc.submittedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
      // Get stats for all KYC statuses
      User.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$kyc.status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      if (stat._id && formattedStats.hasOwnProperty(stat._id)) {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      }
    });

    // Transform submissions to match frontend expectations
    const transformedSubmissions = submissions.map(user => ({
      id: user._id,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      businessName: user.profile?.businessName || '',
      businessType: user.profile?.businessType || '',
      email: user.email,
      phone: user.profile?.phoneNumber || '',
      city: user.profile?.address?.city || '',
      status: user.kyc?.status || 'not_submitted',
      submittedAt: user.kyc?.submittedAt || user.createdAt,
      reviewedAt: user.kyc?.reviewedAt,
      rejectionReason: user.kyc?.rejectionReason,
      idDocument: user.kyc?.documents?.idDocument,
      businessLicense: user.kyc?.documents?.businessLicense
    }));

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      submissions: transformedSubmissions,
      stats: formattedStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get KYC submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve KYC submission
router.put('/kyc-submissions/:id/approve', [auth, adminAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kyc.status !== 'pending') {
      return res.status(400).json({ message: 'KYC submission is not pending' });
    }

    user.kyc.status = 'approved';
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user.id;
    if (notes) user.kyc.adminNotes = notes;

    await user.save();

    // Send KYC approval email (non-blocking)
    try {
      if (user.email) {
        sendKYCApprovedEmail(user).catch(err => {
          console.error('KYC approved email failed:', err?.message || err);
        });
      }
    } catch (e) {
      console.error('KYC approved email error wrapper:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'KYC submission approved successfully',
      user: {
        id: user._id,
        email: user.email,
        kyc: user.kyc
      }
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject KYC submission
router.put('/kyc-submissions/:id/reject', [auth, adminAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kyc.status !== 'pending') {
      return res.status(400).json({ message: 'KYC submission is not pending' });
    }

    user.kyc.status = 'rejected';
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user.id;
    user.kyc.rejectionReason = reason;
    if (notes) user.kyc.adminNotes = notes;

    await user.save();

    // Send KYC rejection email (non-blocking)
    try {
      if (user.email) {
        sendKYCRejectedEmail(user, reason).catch(err => {
          console.error('KYC rejected email failed:', err?.message || err);
        });
      }
    } catch (e) {
      console.error('KYC rejected email error wrapper:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'KYC submission rejected successfully',
      user: {
        id: user._id,
        email: user.email,
        kyc: user.kyc
      }
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system settings
router.get('/settings', [auth, adminAuth], async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system settings
router.put('/settings', [auth, adminAuth], async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Invalid settings data' });
    }

    const updatedSettings = await updateSettings(settings, req.user.id);
    console.log('Settings updated by admin:', req.user.email);
    console.log('New settings:', updatedSettings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Export transactions data
router.get('/transactions/export', [auth, adminAuth], async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('merchant', 'email profile.firstName profile.lastName profile.businessName')
      .sort({ createdAt: -1 })
      .select('reference amount status paymentMethod createdAt merchant fees');

    if (format === 'csv') {
      const csvData = transactions.map(t => ({
        Reference: t.reference,
        Amount: t.amount,
        Status: t.status,
        'Payment Method': t.paymentMethod,
        'Merchant Email': t.merchant?.email,
        'Merchant Name': `${t.merchant?.profile?.firstName} ${t.merchant?.profile?.lastName}`,
        'Business Name': t.merchant?.profile?.businessName,
        'Platform Fee': t.fees?.platform || 0,
        'Created At': t.createdAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      
      // Simple CSV conversion (in production, use a proper CSV library)
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        transactions
      });
    }
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export payouts data
router.get('/payouts/export', [auth, adminAuth], async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payouts = await Payout.find(filter)
      .populate('merchant', 'email profile.firstName profile.lastName profile.businessName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = payouts.map(p => ({
        Reference: p.payoutId,
        Amount: p.amount,
        Status: p.status,
        'Bank Name': p.destination?.bankName,
        'Account Number': p.destination?.accountNumber,
        'Merchant Email': p.merchant?.email,
        'Merchant Name': `${p.merchant?.profile?.firstName} ${p.merchant?.profile?.lastName}`,
        'Business Name': p.merchant?.profile?.businessName,
        'Created At': p.createdAt,
        'Processed At': p.processedAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payouts.csv');
      
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        payouts
      });
    }
  } catch (error) {
    console.error('Export payouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Individual payout actions (approve/reject/complete)
// Approve payout
router.put('/payouts/:payoutId/approve', [
  auth,
  adminAuth,
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { notes } = req.body;

    const payout = await Payout.findOne({ payoutId }).populate('merchant');
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payouts can be approved'
      });
    }

    await payout.process(req.user.id);
    payout.adminNotes = notes;
    await payout.save();

    res.json({
      success: true,
      message: 'Payout approved successfully',
      payout
    });

  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
});

// Reject payout
router.put('/payouts/:payoutId/reject', [
  auth,
  adminAuth,
  body('reason').notEmpty().trim().isLength({ min: 5, max: 500 }).withMessage('Reason is required and must be 5-500 characters')
], async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { reason } = req.body;

    const payout = await Payout.findOne({ payoutId }).populate('merchant');
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payouts can be rejected'
      });
    }

    await payout.fail(reason);

    res.json({
      success: true,
      message: 'Payout rejected successfully',
      payout
    });

  } catch (error) {
    console.error('Reject payout error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
});

// Complete payout
router.put('/payouts/:payoutId/complete', [
  auth,
  adminAuth
], async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { externalReference } = req.body;

    const payout = await Payout.findOne({ payoutId }).populate('merchant');
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'processing' && payout.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only processing/approved payouts can be completed'
      });
    }

    await payout.complete(externalReference || 'Manual completion');

    res.json({
      success: true,
      message: 'Payout completed successfully',
      payout
    });

  } catch (error) {
    console.error('Complete payout error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
});

module.exports = router;
