const express = require('express');
const { query, body, param, validationResult } = require('express-validator');
const { Users, Transactions, Payouts, supabase } = require('../services/supabaseRepo');
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
    
    (recentUsers || []).forEach(user => {
      activities.push({
        type: 'user_registration',
        message: `New user registered: ${user.profile.firstName} ${user.profile.lastName}`,
        timestamp: user.created_at,
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
    
    (recentTransactions || []).forEach(transaction => {
      activities.push({
        type: 'transaction',
        message: `Transaction ${transaction.status}: USD ${transaction.amount}`,
        timestamp: transaction.created_at,
        user: userEmails[transaction.user_id] || ''
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
    const { data, error } = await supabase
      .from('users')
      .select('email,profile,kyc,created_at')
      .eq('role', 'merchant')
      .eq('kyc->>status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw error

    const pendingKyc = (data || []).map(u => ({
      email: u.email,
      profile: {
        firstName: u?.profile?.firstName || '',
        lastName: u?.profile?.lastName || ''
      },
      kyc: {
        submittedAt: u?.kyc?.submittedAt || null,
        documents: u?.kyc?.documents || {}
      }
    }))

    res.json(pendingKyc)
  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent transactions for dashboard
router.get('/recent-transactions', [auth, adminAuth], async (req, res) => {
  try {
    const { data: txs, error } = await supabase
      .from('transactions')
      .select('amount,status,payment_method,created_at,user_id,reference')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw error

    const userIds = [...new Set((txs || []).map(t => t.user_id).filter(Boolean))]
    const usersById = {}
    if (userIds.length) {
      const { data: users, error: uErr } = await supabase
        .from('users')
        .select('id,email,profile')
        .in('id', userIds)
      if (!uErr && users) {
        for (const u of users) {
          usersById[u.id] = u
        }
      }
    }

    const recentTransactions = (txs || []).map(t => ({
      amount: t.amount,
      status: t.status,
      paymentMethod: t.payment_method,
      createdAt: t.created_at,
      reference: t.reference,
      merchant: usersById[t.user_id]
        ? {
            email: usersById[t.user_id].email,
            profile: {
              firstName: usersById[t.user_id]?.profile?.firstName || '',
              lastName: usersById[t.user_id]?.profile?.lastName || '',
              businessName: usersById[t.user_id]?.profile?.businessName || ''
            }
          }
        : null
    }))

    res.json(recentTransactions)
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
        completed: (payoutAgg.completed?.count || 0),
        completedAmount: (payoutAgg.completed?.amount || 0),
        pendingAmount: (payoutAgg.pending?.amount || 0)
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let q = supabase
      .from('users')
      .select('id,email,profile,kyc,is_active,role,created_at', { count: 'exact' })
      .eq('role', 'merchant');
    if (status === 'active') q = q.eq('is_active', true);
    if (status === 'inactive') q = q.eq('is_active', false);
    if (kycStatus) q = q.eq('kyc->>status', kycStatus);
    if (search) q = q.or(`email.ilike.%${search}%,profile->>firstName.ilike.%${search}%,profile->>lastName.ilike.%${search}%,profile->>businessName.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false }).range(skip, skip + parseInt(limit) - 1);
    const { data: rows, count: totalCount } = await q;

    const { data: allTx } = await supabase.from('transactions').select('user_id,status,amount');
    const txByUser = {};
    (allTx || []).forEach(t => {
      const k = t.user_id; if (!k) return; if (!txByUser[k]) txByUser[k] = { totalTransactions: 0, successfulTransactions: 0, totalRevenue: 0 };
      txByUser[k].totalTransactions += 1;
      if (t.status === 'successful') { txByUser[k].successfulTransactions += 1; txByUser[k].totalRevenue += (t.amount || 0); }
    });

    const usersWithStats = (rows || []).map(u => ({
      id: u.id,
      email: u.email,
      isActive: !!u.is_active,
      role: u.role,
      createdAt: u.created_at,
      firstName: u?.profile?.firstName || '',
      lastName: u?.profile?.lastName || '',
      phone: u?.profile?.phoneNumber || '',
      businessName: u?.profile?.businessName || '',
      businessType: u?.profile?.businessType || '',
      city: u?.profile?.address?.city || '',
      country: u?.profile?.address?.country || '',
      kycStatus: u?.kyc?.status || 'not_submitted',
      kycSubmittedAt: u?.kyc?.submittedAt,
      kycReviewedAt: u?.kyc?.reviewedAt,
      stats: txByUser[u.id] || { totalTransactions: 0, successfulTransactions: 0, totalRevenue: 0 }
    }));

    const totalPages = Math.ceil((totalCount || 0) / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const { count: activeCount } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('is_active', true);
    const { count: inactiveCount } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('is_active', false);
    const { count: merchants } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant');
    const { count: admins } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin');
    const { count: kycApproved } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('kyc->>status', 'approved');
    const { count: kycPending } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('kyc->>status', 'pending');

    const stats = { total: totalCount || 0, active: activeCount || 0, inactive: inactiveCount || 0, merchants: merchants || 0, admins: admins || 0, kycApproved: kycApproved || 0, kycPending: kycPending || 0 };

    res.json({ success: true, users: usersWithStats, stats, pagination: { currentPage: parseInt(page), totalPages, totalCount: totalCount || 0, hasNextPage, hasPrevPage, limit: parseInt(limit) } });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user details
router.get('/users/:userId', [auth, adminAuth], async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.getById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const txOverview = await Transactions.statsOverview(userId);
    const transactionsStats = {
      totalTransactions: txOverview.totalTransactions,
      successfulTransactions: txOverview.successfulTransactions,
      totalAmount: txOverview.totalAmount,
      totalFees: txOverview.totalFees,
      averageAmount: txOverview.averageTransaction,
      successRate: txOverview.successRate
    };

    const { data: recentTx } = await supabase
      .from('transactions')
      .select('transaction_id,amount,currency,status,payment_method,customer,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: payoutsAll } = await supabase
      .from('payouts')
      .select('status,amount')
      .eq('user_id', userId);
    const payoutStatsMap = {};
    (payoutsAll || []).forEach(p => {
      const k = p.status || 'unknown';
      if (!payoutStatsMap[k]) payoutStatsMap[k] = { _id: k, count: 0, amount: 0 };
      payoutStatsMap[k].count += 1;
      payoutStatsMap[k].amount += (p.amount || 0);
    });
    const payoutStats = Object.values(payoutStatsMap);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        kyc: user.kyc,
        isActive: !!user.is_active,
        stats: {
          transactions: transactionsStats,
          payouts: payoutStats,
          recentTransactions: (recentTx || []).map(t => ({
            transactionId: t.transaction_id,
            amount: t.amount,
            currency: t.currency,
            status: t.status,
            paymentMethod: t.payment_method,
            customer: t.customer,
            createdAt: t.created_at
          }))
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
    const { data: existing } = await supabase
      .from('users')
      .select('id,email,role')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();
    if (!existing) { return res.status(404).json({ success: false, message: 'User not found' }); }
    if (existing.role === 'admin') { return res.status(400).json({ success: false, message: 'Cannot modify admin user status' }); }
    await supabase.from('users').update({ is_active: !!isActive }).eq('id', userId);
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user: { _id: existing.id, email: existing.email, isActive: !!isActive } });

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
    const { data: existing } = await supabase.from('users').select('id,email,role').eq('id', userId).limit(1).maybeSingle();
    if (!existing) { return res.status(404).json({ success: false, message: 'User not found' }); }
    if (existing.role === 'admin') { return res.status(400).json({ success: false, message: 'Cannot modify admin user status' }); }
    await supabase.from('users').update({ is_active: true }).eq('id', userId);
    res.json({ success: true, message: 'User activated successfully', user: { _id: existing.id, email: existing.email, isActive: true } });

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
    const { data: existing } = await supabase.from('users').select('id,email,role').eq('id', userId).limit(1).maybeSingle();
    if (!existing) { return res.status(404).json({ success: false, message: 'User not found' }); }
    if (existing.role === 'admin') { return res.status(400).json({ success: false, message: 'Cannot modify admin user status' }); }
    await supabase.from('users').update({ is_active: false }).eq('id', userId);
    res.json({ success: true, message: 'User deactivated successfully', user: { _id: existing.id, email: existing.email, isActive: false } });

    try {
      if (process.env.ADMIN_EMAIL) {
        sendAdminUserDeletedEmail({ email: existing.email }, req.user, reason).catch(() => {});
      }
    } catch (_) {}

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
  param('userId').isString().withMessage('Invalid user id'),
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
    const reason = (req.body && req.body.reason) || req.query.reason || undefined;

    const { data: user } = await supabase
      .from('users')
      .select('id,email,role,profile,balance')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    const { count: pendingTransactions } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'processing']);
    if ((pendingTransactions || 0) > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete user with pending transactions. Please wait for all transactions to complete.' });
    }

    const hasBalance = user.balance && (((user.balance.available || 0) > 0) || ((user.balance.pending || 0) > 0));
    if (hasBalance) {
      return res.status(400).json({ success: false, message: 'Cannot delete user with remaining balance. Please process payouts first.' });
    }

    const nowIso = new Date().toISOString();
    const newEmail = `deleted_${Date.now()}_${user.email}`;
    const profile = {
      ...(user.profile || {}),
      firstName: 'Deleted',
      lastName: 'User',
      phoneNumber: 'deleted',
      businessName: 'Deleted Business',
      address: { ...(user.profile?.address || {}), city: user.profile?.address?.city || 'Juba', country: user.profile?.address?.country || 'South Sudan' }
    };
    const adminNotes = [{ note: `User deleted by admin: ${reason || 'No reason provided'}`, addedBy: req.user.id, addedAt: nowIso }];
    await supabase
      .from('users')
      .update({ is_active: false, email: newEmail, profile, apiKeys: null, adminNotes, updated_at: nowIso })
      .eq('id', userId);

    res.json({ success: true, message: 'User has been successfully deleted and anonymized' });

  } catch (error) {
    console.error('Delete user error:', error);
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors || {}).map(e => ({ msg: e.message, path: e.path }))
      });
    }
    // Ignore duplicate key semantics in Supabase context
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let tq = supabase
      .from('transactions')
      .select('id,transaction_id,reference,amount,currency,status,payment_method,description,user_id,customer,created_at,completed_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + parseInt(limit) - 1);
    if (status) tq = tq.eq('status', status);
    if (paymentMethod) tq = tq.eq('payment_method', paymentMethod);
    if (startDate) tq = tq.gte('created_at', new Date(startDate).toISOString());
    if (endDate) tq = tq.lte('created_at', new Date(endDate).toISOString());
    const { data: txRows, count: totalCount } = await tq;

    const userIds = [...new Set((txRows || []).map(t => t.user_id).filter(Boolean))];
    const usersById = {};
    if (userIds.length) {
      const { data: us } = await supabase.from('users').select('id,email,profile').in('id', userIds);
      (us || []).forEach(u => { usersById[u.id] = u; });
    }

    const transformedTransactions = (txRows || []).map(t => ({
      id: t.transaction_id,
      transactionId: t.transaction_id,
      merchantName: usersById[t.user_id]?.profile?.businessName || `${usersById[t.user_id]?.profile?.firstName || ''} ${usersById[t.user_id]?.profile?.lastName || ''}`.trim() || 'Unknown Merchant',
      merchantEmail: usersById[t.user_id]?.email || '',
      customerPhone: t.customer?.phoneNumber || '',
      customerEmail: t.customer?.email || '',
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      paymentMethod: t.payment_method,
      description: t.description,
      createdAt: t.created_at,
      completedAt: t.completed_at,
      fees: t.fees
    }));

    const { data: allForStats } = await supabase.from('transactions').select('status,amount,created_at');
    const total = (allForStats || []).length;
    const totalAmount = (allForStats || []).reduce((s, r) => s + (r.amount || 0), 0);
    const successful = (allForStats || []).filter(r => r.status === 'successful').length;
    const pending = (allForStats || []).filter(r => r.status === 'pending').length;
    const failed = (allForStats || []).filter(r => r.status === 'failed').length;
    const avgAmount = total ? totalAmount / total : 0;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayRows = (allForStats || []).filter(r => new Date(r.created_at) >= todayStart);
    const stats = {
      total,
      totalAmount,
      successful,
      pending,
      failed,
      avgAmount,
      successRate: total ? Math.round((successful / total) * 100) : 0,
      todayTransactions: todayRows.length,
      todayAmount: todayRows.reduce((s, r) => s + (r.amount || 0), 0)
    };

    const totalPages = Math.ceil((totalCount || 0) / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({ success: true, transactions: transformedTransactions, stats, pagination: { currentPage: parseInt(page), totalPages, totalCount: totalCount || 0, hasNextPage, hasPrevPage, limit: parseInt(limit) } });

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

    const { data: txAll } = await supabase
      .from('transactions')
      .select('amount,fees,status,created_at')
      .gte('created_at', startDate.toISOString());
    const fmtDate = (d) => {
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth()+1).padStart(2,'0');
      const day = String(dt.getDate()).padStart(2,'0');
      if (groupFormat === '%Y-%m') return `${y}-${m}`;
      return `${y}-${m}-${day}`;
    };
    const txGrouped = {};
    (txAll||[]).forEach(t => {
      const key = fmtDate(t.created_at);
      txGrouped[key] = txGrouped[key] || { _id: key, statuses: {}, totalCount: 0, totalAmount: 0, totalFees: 0 };
      const stat = txGrouped[key];
      stat.totalCount += 1;
      stat.totalAmount += (t.amount||0);
      stat.totalFees += (t.fees?.total || t.fees?.totalFees || t.fees?.platform || 0);
      const s = t.status || 'unknown';
      stat.statuses[s] = stat.statuses[s] || { status: s, count: 0, amount: 0, fees: 0 };
      stat.statuses[s].count += 1;
      stat.statuses[s].amount += (t.amount||0);
      stat.statuses[s].fees += (t.fees?.total || t.fees?.totalFees || t.fees?.platform || 0);
    });
    const transactionTrends = Object.values(txGrouped).sort((a,b)=>a._id.localeCompare(b._id)).map(row => ({
      _id: row._id,
      statuses: Object.values(row.statuses),
      totalCount: row.totalCount,
      totalAmount: row.totalAmount,
      totalFees: row.totalFees
    }));

    const { data: userAll } = await supabase
      .from('users')
      .select('created_at,kyc,role')
      .eq('role','merchant')
      .gte('created_at', startDate.toISOString());
    const userGrouped = {};
    (userAll||[]).forEach(u => {
      const key = fmtDate(u.created_at);
      userGrouped[key] = userGrouped[key] || { _id: key, newUsers: 0, kycSubmitted: 0, kycApproved: 0 };
      const g = userGrouped[key];
      g.newUsers += 1;
      const st = u?.kyc?.status || null;
      if (st) g.kycSubmitted += 1;
      if (st === 'approved') g.kycApproved += 1;
    });
    const userTrends = Object.values(userGrouped).sort((a,b)=>a._id.localeCompare(b._id));

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
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let uq = supabase
      .from('users')
      .select('id,email,profile,kyc,created_at', { count: 'exact' })
      .eq('role', 'merchant')
      .not('kyc->>status', 'eq', 'not_submitted')
      .order('kyc->>submittedAt', { ascending: false })
      .range(skip, skip + parseInt(limit) - 1);
    if (status && status !== 'all') uq = uq.eq('kyc->>status', status);
    const { data: subs, count: totalCount } = await uq;

    const { count: pending } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('kyc->>status', 'pending');
    const { count: approved } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('kyc->>status', 'approved');
    const { count: rejected } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'merchant').eq('kyc->>status', 'rejected');
    const formattedStats = { total: (pending || 0) + (approved || 0) + (rejected || 0), pending: pending || 0, approved: approved || 0, rejected: rejected || 0 };

    const transformedSubmissions = (subs || []).map(u => ({
      id: u.id,
      firstName: u?.profile?.firstName || '',
      lastName: u?.profile?.lastName || '',
      businessName: u?.profile?.businessName || '',
      businessType: u?.profile?.businessType || '',
      email: u.email,
      phone: u?.profile?.phoneNumber || '',
      city: u?.profile?.address?.city || '',
      status: u?.kyc?.status || 'not_submitted',
      submittedAt: u?.kyc?.submittedAt || u.created_at,
      reviewedAt: u?.kyc?.reviewedAt,
      rejectionReason: u?.kyc?.rejectionReason,
      idDocument: u?.kyc?.documents?.idDocument,
      businessLicense: u?.kyc?.documents?.businessLicense
    }));

    const totalPages = Math.ceil((totalCount || 0) / parseInt(limit));
    res.json({ success: true, submissions: transformedSubmissions, stats: formattedStats, pagination: { currentPage: parseInt(page), totalPages, totalCount: totalCount || 0, hasNextPage: parseInt(page) < totalPages, hasPrevPage: parseInt(page) > 1, limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve KYC submission
router.put('/kyc-submissions/:id/approve', [auth, adminAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const { data: user } = await supabase
      .from('users')
      .select('id,email,kyc')
      .eq('id', id)
      .limit(1)
      .maybeSingle();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if ((user.kyc?.status || '') !== 'pending') return res.status(400).json({ message: 'KYC submission is not pending' });

    const kyc = { ...(user.kyc || {}), status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: req.user.id, adminNotes: notes || null };
    await supabase.from('users').update({ kyc }).eq('id', id);

    try {
      if (user.email) {
        sendKYCApprovedEmail({ email: user.email, kyc }).catch(() => {});
      }
    } catch (_) {}

    res.json({ success: true, message: 'KYC submission approved successfully', user: { id, email: user.email, kyc } });
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

    const { data: user } = await supabase
      .from('users')
      .select('id,email,kyc')
      .eq('id', id)
      .limit(1)
      .maybeSingle();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if ((user.kyc?.status || '') !== 'pending') return res.status(400).json({ message: 'KYC submission is not pending' });

    const kyc = { ...(user.kyc||{}), status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: req.user.id, rejectionReason: reason, adminNotes: notes || null };
    await supabase.from('users').update({ kyc }).eq('id', id);

    // Send KYC rejection email (non-blocking)
    try {
      if (user.email) {
        sendKYCRejectedEmail({ email: user.email, kyc }, reason).catch(err => {
          console.error('KYC rejected email failed:', err?.message || err);
        });
      }
    } catch (e) {
      console.error('KYC rejected email error wrapper:', e?.message || e);
    }

    res.json({ success: true, message: 'KYC submission rejected successfully', user: { id, email: user.email, kyc } });
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
    let eq = supabase
      .from('transactions')
      .select('reference,amount,status,payment_method,created_at,user_id,fees')
      .order('created_at', { ascending: false });
    if (startDate) eq = eq.gte('created_at', new Date(startDate).toISOString());
    if (endDate) eq = eq.lte('created_at', new Date(endDate).toISOString());
    const { data: rows } = await eq;
    const userIds = [...new Set((rows || []).map(r => r.user_id).filter(Boolean))];
    const usersById = {};
    if (userIds.length) {
      const { data: us } = await supabase.from('users').select('id,email,profile').in('id', userIds);
      (us || []).forEach(u => { usersById[u.id] = u; });
    }
    if (format === 'csv') {
      const csvData = (rows || []).map(t => ({
        Reference: t.reference,
        Amount: t.amount,
        Status: t.status,
        'Payment Method': t.payment_method,
        'Merchant Email': usersById[t.user_id]?.email,
        'Merchant Name': `${usersById[t.user_id]?.profile?.firstName || ''} ${usersById[t.user_id]?.profile?.lastName || ''}`.trim(),
        'Business Name': usersById[t.user_id]?.profile?.businessName,
        'Platform Fee': t.fees?.platform || t.fees?.total || t.fees?.totalFees || 0,
        'Created At': t.created_at
      }));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rowsCsv = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rowsCsv].join('\n');
      res.send(csv);
    } else {
      res.json({ success: true, transactions: rows || [] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Export payouts data
router.get('/payouts/export', [auth, adminAuth], async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    let pq = supabase
      .from('payouts')
      .select('payout_id,amount,status,created_at,completed_at,user_id,destination')
      .order('created_at', { ascending: false });
    if (startDate) pq = pq.gte('created_at', new Date(startDate).toISOString());
    if (endDate) pq = pq.lte('created_at', new Date(endDate).toISOString());
    const { data: rows } = await pq;
    const userIds = [...new Set((rows || []).map(r => r.user_id).filter(Boolean))];
    const usersById = {};
    if (userIds.length) {
      const { data: us } = await supabase.from('users').select('id,email,profile').in('id', userIds);
      (us || []).forEach(u => { usersById[u.id] = u; });
    }
    if (format === 'csv') {
      const csvData = (rows || []).map(p => ({
        Reference: p.payout_id,
        Amount: p.amount,
        Status: p.status,
        'Bank Name': p.destination?.bankName,
        'Account Number': p.destination?.accountNumber,
        'Merchant Email': usersById[p.user_id]?.email,
        'Merchant Name': `${usersById[p.user_id]?.profile?.firstName || ''} ${usersById[p.user_id]?.profile?.lastName || ''}`.trim(),
        'Business Name': usersById[p.user_id]?.profile?.businessName,
        'Created At': p.created_at,
        'Processed At': p.completed_at
      }));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payouts.csv');
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rowsCsv = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rowsCsv].join('\n');
      res.send(csv);
    } else {
      res.json({ success: true, payouts: rows || [] });
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

    const { data: payout } = await supabase
      .from('payouts')
      .select('*')
      .eq('payout_id', payoutId)
      .limit(1)
      .maybeSingle();
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }
    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending payouts can be approved' });
    }
    const fee = Payouts.calculateProcessingFee(payout.amount, payout.method);
    const dec = (payout.amount || 0) + fee;
    await supabase.from('payouts').update({ status: 'processing', processed_at: new Date().toISOString(), admin_notes: notes || null }).eq('payout_id', payoutId);
    const { data: u } = await supabase.from('users').select('balance').eq('id', payout.user_id).limit(1).maybeSingle();
    const newAvail = Math.max(0, (u?.balance?.available || 0) - dec);
    await supabase.from('users').update({ balance: { ...(u?.balance||{}), available: newAvail } }).eq('id', payout.user_id);
    res.json({ success: true, message: 'Payout approved successfully', payout: { ...payout, status: 'processing' } });
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

    const { data: payout } = await supabase
      .from('payouts')
      .select('*')
      .eq('payout_id', payoutId)
      .limit(1)
      .maybeSingle();
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }
    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending payouts can be rejected' });
    }
    await supabase.from('payouts').update({ status: 'failed', cancelled_at: new Date().toISOString(), cancel_reason: reason || 'Rejected by admin' }).eq('payout_id', payoutId);
    res.json({ success: true, message: 'Payout rejected successfully', payout: { ...payout, status: 'failed' } });
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

    const { data: payout } = await supabase
      .from('payouts')
      .select('*')
      .eq('payout_id', payoutId)
      .limit(1)
      .maybeSingle();
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }
    if (payout.status !== 'processing' && payout.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only processing/approved payouts can be completed' });
    }
    await supabase.from('payouts').update({ status: 'completed', completed_at: new Date().toISOString(), external_reference: externalReference || 'Manual completion' }).eq('payout_id', payoutId);
    res.json({ success: true, message: 'Payout completed successfully', payout: { ...payout, status: 'completed' } });
  } catch (error) {
    console.error('Complete payout error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
});

module.exports = router;
