import React, { useState, useEffect } from 'react';
import { Receipt, CheckCircle, XCircle, Send, TrendingUp, DollarSign } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    balance: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get merchant stats
      const { data: merchant } = await supabase
        .from('merchants')
        .select('balance, total_transactions, total_revenue')
        .eq('id', profile.id)
        .single();

      // Get transaction counts
      const { data: transactions } = await supabase
        .from('transactions')
        .select('status')
        .eq('merchant_id', profile.id);

      const completed = transactions?.filter(t => t.status === 'completed').length || 0;
      const pending = transactions?.filter(t => t.status === 'pending').length || 0;

      // Get recent transactions
      const { data: recentTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        balance: merchant?.balance || 0,
        totalTransactions: merchant?.total_transactions || 0,
        completedTransactions: completed,
        pendingTransactions: pending,
      });

      setTransactions(recentTx || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      failed: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Dashboard
          </h1>
          <p className="text-secondary-600">
            Welcome back, {profile?.first_name || profile?.business_name || 'there'}! 👋
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions}
            icon={Receipt}
            color="orange"
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Completed"
            value={stats.completedTransactions}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending"
            value={stats.pendingTransactions}
            icon={XCircle}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.balance)}
            icon={Send}
            color="blue"
          />
        </div>

        {/* Wallet Balance & Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 shadow-stripe-xl">
              {/* Mastercard Circles Background */}
              <div className="absolute top-8 left-8 opacity-20">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white"></div>
                  <div className="w-16 h-16 rounded-full bg-white -ml-6"></div>
                </div>
              </div>

              {/* Card Icon on Right */}
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-20 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-white text-xs rotate-90 font-medium">
                  💳
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-6xl font-bold text-white mb-2">
                  {formatCurrency(stats.balance)}
                </div>
                <div className="text-white/90 text-lg font-medium mb-4">
                  Wallet Balance
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <TrendingUp size={16} className="mr-2" />
                  <span>+0.8% than last week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Card */}
          <Card className="flex flex-col">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Account Overview
            </h3>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-secondary-600">Account</span>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-secondary-600">Services</span>
                </div>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-secondary-600">Payments</span>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary-300"></div>
                  <span className="text-sm text-secondary-600">Others</span>
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>

            {/* Simple Chart Visualization */}
            <div className="mt-4 h-2 bg-secondary-100 rounded-full overflow-hidden flex">
              <div className="bg-blue-500" style={{ width: '20%' }}></div>
              <div className="bg-green-500" style={{ width: '40%' }}></div>
              <div className="bg-orange-500" style={{ width: '25%' }}></div>
              <div className="bg-secondary-300" style={{ width: '15%' }}></div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary-900">
              Recent Transactions
            </h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-secondary-500">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-secondary-600 mb-4">No transactions yet</p>
              <p className="text-sm text-secondary-500">
                Your transactions will appear here once you start accepting payments
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4 text-sm font-medium text-secondary-900">
                        {tx.transaction_reference}
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600">
                        {tx.customer_name || tx.customer_email || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-secondary-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
