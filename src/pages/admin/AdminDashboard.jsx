import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, DollarSign, TrendingUp, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../supabase/supabaseClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMerchants: 0,
    verifiedMerchants: 0,
    pendingVerification: 0,
    todayTransactions: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get merchants
      const { data: merchants, error: merchantsError } = await supabase
        .from('merchants')
        .select('*');
      
      if (merchantsError) {
        console.error('Error fetching merchants:', merchantsError);
        alert('Error loading merchants: ' + merchantsError.message);
      }

      // Get transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*');
      
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        alert('Error loading transactions: ' + transactionsError.message);
      }

      // Get payouts
      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('*');
      
      if (payoutsError) {
        console.error('Error fetching payouts:', payoutsError);
        alert('Error loading payouts: ' + payoutsError.message);
      }

      console.log('Dashboard Data:', {
        merchants: merchants?.length || 0,
        transactions: transactions?.length || 0,
        payouts: payouts?.length || 0,
      });

      const today = new Date().toDateString();
      const todayTxns = transactions?.filter(t => new Date(t.created_at).toDateString() === today) || [];
      const completedTxns = transactions?.filter(t => t.status === 'completed') || [];
      const pendingPayouts = payouts?.filter(p => p.status === 'pending') || [];

      setStats({
        totalMerchants: merchants?.length || 0,
        verifiedMerchants: merchants?.filter(m => m.verification_status === 'approved').length || 0,
        pendingVerification: merchants?.filter(m => m.verification_status === 'pending').length || 0,
        todayTransactions: todayTxns.length,
        totalRevenue: completedTxns.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        pendingPayouts: pendingPayouts.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      });

      // Build recent activity from real data
      const activities = [];
      
      // Recent merchant signups
      const recentMerchants = merchants?.slice(0, 3) || [];
      recentMerchants.forEach(merchant => {
        const timeAgo = getTimeAgo(new Date(merchant.created_at));
        activities.push({
          type: 'Merchant Signup',
          user: merchant.business_name || `${merchant.first_name} ${merchant.last_name}`,
          time: timeAgo,
          status: 'success',
        });
      });

      // Recent transactions
      const recentTxns = transactions?.slice(0, 2) || [];
      recentTxns.forEach(txn => {
        const timeAgo = getTimeAgo(new Date(txn.created_at));
        activities.push({
          type: 'Transaction',
          user: txn.customer_name || txn.customer_email || 'Customer',
          time: timeAgo,
          status: txn.status === 'completed' ? 'success' : txn.status === 'failed' ? 'error' : 'pending',
        });
      });

      // Recent payouts
      const recentPayouts = payouts?.slice(0, 2) || [];
      recentPayouts.forEach(payout => {
        const timeAgo = getTimeAgo(new Date(payout.created_at));
        const merchant = merchants?.find(m => m.id === payout.merchant_id);
        activities.push({
          type: 'Payout Request',
          user: merchant?.business_name || merchant?.first_name + ' ' + merchant?.last_name || 'Merchant',
          time: timeAgo,
          status: payout.status === 'completed' ? 'success' : payout.status === 'failed' ? 'error' : 'pending',
        });
      });

      // Sort by time and take most recent 5
      setRecentActivity(activities.sort((a, b) => {
        // Simple sort - most recent first
        return activities.indexOf(b) - activities.indexOf(a);
      }).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
      alert('Error loading dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Sample data for charts (will be replaced with real data later)
  const transactionTrends = [
    { name: 'Mon', transactions: 45, revenue: 12500 },
    { name: 'Tue', transactions: 52, revenue: 15800 },
    { name: 'Wed', transactions: 48, revenue: 14200 },
    { name: 'Thu', transactions: 61, revenue: 18900 },
    { name: 'Fri', transactions: 55, revenue: 16400 },
    { name: 'Sat', transactions: 38, revenue: 11200 },
    { name: 'Sun', transactions: 42, revenue: 13600 },
  ];

  const verificationProgress = [
    { name: 'Verified', value: stats.verifiedMerchants, color: '#10b981' },
    { name: 'Pending', value: stats.pendingVerification, color: '#f59e0b' },
    { name: 'Rejected', value: 2, color: '#ef4444' },
  ];

  const statCards = [
    {
      title: 'Total Merchants',
      value: stats.totalMerchants,
      change: '+12%',
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/20',
    },
    {
      title: 'Verified Merchants',
      value: stats.verifiedMerchants,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/20',
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification,
      change: '+3',
      trend: 'up',
      icon: Clock,
      gradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-500/20',
    },
    {
      title: 'Today\'s Transactions',
      value: stats.todayTransactions,
      change: '+15%',
      trend: 'up',
      icon: Activity,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/20',
    },
    {
      title: 'Total Revenue',
      value: `SSP ${stats.totalRevenue.toLocaleString()}`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-500/20',
    },
    {
      title: 'Pending Payouts',
      value: `SSP ${stats.pendingPayouts.toLocaleString()}`,
      change: '5 requests',
      trend: 'neutral',
      icon: TrendingUp,
      gradient: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500/20',
    },
  ];

  return (
    <AdminLayout activePage="dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend === 'up' && <ArrowUp size={16} className="text-green-400" />}
                    {stat.trend === 'down' && <ArrowDown size={16} className="text-red-400" />}
                    <span className={stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-white/60 text-sm mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-500`} />
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Trends */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Transaction Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="transactions" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Verification Progress */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Merchant Verification</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={verificationProgress}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {verificationProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '12px' }} />
              <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-400' :
                    activity.status === 'pending' ? 'bg-yellow-400' :
                    'bg-red-400'
                  } animate-pulse`} />
                  <div>
                    <p className="text-white font-medium">{activity.type}</p>
                    <p className="text-white/60 text-sm">{activity.user}</p>
                  </div>
                </div>
                <span className="text-white/40 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
