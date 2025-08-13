import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TokenStorage } from '../../utils/security';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      pendingKyc: 0,
      newThisMonth: 0,
      growth: 0
    },
    transactions: {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      totalAmount: 0,
      todayAmount: 0,
      growth: 0
    },
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    kyc: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    }
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingKyc, setPendingKyc] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const [statsRes, activityRes, kycRes, transactionsRes] = await Promise.all([
        axios.get('/api/admin/stats', config),
        axios.get('/api/admin/recent-activity', config),
        axios.get('/api/admin/pending-kyc', config),
        axios.get('/api/admin/recent-transactions', config)
      ]);
      
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setPendingKyc(kycRes.data);
      setRecentTransactions(transactionsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-SS').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-SS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUpIcon className="h-4 w-4 text-success-500" />;
    if (growth < 0) return <ArrowDownIcon className="h-4 w-4 text-danger-500" />;
    return null;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-success-600';
    if (growth < 0) return 'text-danger-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'rejected':
        return 'badge badge-danger';
      case 'successful':
        return 'badge badge-success';
      case 'failed':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <UsersIcon className="h-5 w-5 text-blue-500" />;
      case 'kyc_submitted':
        return <CheckCircleIcon className="h-5 w-5 text-warning-500" />;
      case 'payment_received':
        return <CurrencyDollarIcon className="h-5 w-5 text-success-500" />;
      case 'payment_failed':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName}. Here's what's happening with PaySSD today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(stats.users.total)}
                  </p>
                  <div className={`ml-2 flex items-center text-sm ${getGrowthColor(stats.users.growth)}`}>
                    {getGrowthIcon(stats.users.growth)}
                    <span className="ml-1">{Math.abs(stats.users.growth)}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formatNumber(stats.users.newThisMonth)} new this month
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.revenue.total)}
                  </p>
                  <div className={`ml-2 flex items-center text-sm ${getGrowthColor(stats.revenue.growth)}`}>
                    {getGrowthIcon(stats.revenue.growth)}
                    <span className="ml-1">{Math.abs(stats.revenue.growth)}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats.revenue.thisMonth)} this month
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(stats.transactions.total)}
                  </p>
                  <div className={`ml-2 flex items-center text-sm ${getGrowthColor(stats.transactions.growth)}`}>
                    {getGrowthIcon(stats.transactions.growth)}
                    <span className="ml-1">{Math.abs(stats.transactions.growth)}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formatNumber(stats.transactions.successful)} successful
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending KYC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.kyc.pending)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(stats.kyc.total)} total submissions
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.user}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-xs text-gray-500">
                            {formatDate(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {recentActivity.length === 0 && (
              <div className="text-center py-6">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">Activity will appear here as users interact with the platform.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending KYC Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-header flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Pending KYC Reviews</h2>
            <a
              href="/admin/kyc-management"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </a>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {pendingKyc.map((kyc) => (
                <div key={kyc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-warning-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {kyc.firstName} {kyc.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{kyc.businessName}</p>
                      <p className="text-xs text-gray-500">
                        Submitted {formatDate(kyc.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={getStatusBadge(kyc.status)}>
                      {kyc.status ? kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1) : 'Unknown'}
                    </span>
                    <button className="btn btn-sm btn-secondary">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pendingKyc.length === 0 && (
              <div className="text-center py-6">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
                <p className="mt-1 text-sm text-gray-500">All KYC submissions have been reviewed.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="card-header flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <a
            href="/admin/transactions"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </a>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <span className="font-mono text-sm">
                        {transaction.id ? transaction.id.slice(0, 8) : 'N/A'}...
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.merchant ? transaction.merchant.businessName : 'Unknown Business'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.merchant ? `${transaction.merchant.firstName || ''} ${transaction.merchant.lastName || ''}`.trim() : 'Unknown Merchant'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {transaction.paymentMethod === 'mtn_momo' && (
                          <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-yellow-800">M</span>
                          </div>
                        )}
                        {transaction.paymentMethod === 'digicash' && (
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-blue-800">D</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-900">
                          {transaction.paymentMethod === 'mtn_momo' ? 'MTN MoMo' : 'Digicash'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentTransactions.length === 0 && (
            <div className="text-center py-6">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent transactions</h3>
              <p className="mt-1 text-sm text-gray-500">Transactions will appear here as they are processed.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Manage Users</h3>
                <p className="text-xs text-gray-500">View and manage user accounts</p>
              </div>
            </a>
            
            <a
              href="/admin/kyc-management"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircleIcon className="h-8 w-8 text-warning-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Review KYC</h3>
                <p className="text-xs text-gray-500">Approve or reject KYC submissions</p>
              </div>
            </a>
            
            <a
              href="/admin/transactions"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCardIcon className="h-8 w-8 text-success-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">View Transactions</h3>
                <p className="text-xs text-gray-500">Monitor all platform transactions</p>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;