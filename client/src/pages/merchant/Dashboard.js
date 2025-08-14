import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
    pendingAmount: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, transactionsResponse] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/transactions?limit=5')
      ]);
      
      setStats(statsResponse.data);
      setRecentTransactions(transactionsResponse.data.transactions || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'badge badge-success',
      pending: 'badge badge-warning',
      failed: 'badge badge-danger',
      cancelled: 'badge badge-gray'
    };
    
    return (
      <span className={statusClasses[status] || 'badge badge-gray'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    if (method?.toLowerCase().includes('mtn')) {
      return '📱'; // MTN Mobile Money
    } else if (method?.toLowerCase().includes('digicash')) {
      return '💳'; // Digicash
    }
    return '💰'; // Default
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, {user?.businessName || user?.firstName}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your PaySSD account today.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            to="/dashboard/payment-links/create"
            className="btn btn-primary w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Payment Link
          </Link>
        </div>
      </div>

      {/* KYC Status Alert */}
      {user?.kycStatus !== 'approved' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning"
        >
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">
                {user?.kycStatus === 'pending' ? 'KYC Verification Pending' : 'Complete Your KYC Verification'}
              </p>
              <p className="text-sm mt-1">
                {user?.kycStatus === 'pending' 
                  ? 'Your KYC documents are being reviewed. You\'ll be notified once approved.'
                  : 'Complete your KYC verification to start accepting payments.'
                }
              </p>
              {user?.kycStatus !== 'pending' && (
                <Link to="/dashboard/kyc" className="text-sm font-medium underline mt-2 inline-block">
                  Complete KYC Now
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-success-600" />
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <div className="flex items-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  {stats.monthlyGrowth !== 0 && (
                    <div className="ml-2 flex items-center text-sm">
                      {stats.monthlyGrowth > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 text-success-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`ml-1 ${
                        stats.monthlyGrowth > 0 ? 'text-success-600' : 'text-red-600'
                      }`}>
                        {Math.abs(stats.monthlyGrowth)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.monthlyGrowth !== 0 ? 'this month' : 'total earnings'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <div className="flex items-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.totalTransactions.toLocaleString()}
                  </p>
                  {stats.weeklyGrowth !== 0 && (
                    <div className="ml-2 flex items-center text-sm">
                      {stats.weeklyGrowth > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 text-success-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`ml-1 ${
                        stats.weeklyGrowth > 0 ? 'text-success-600' : 'text-red-600'
                      }`}>
                        {Math.abs(stats.weeklyGrowth)}%
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.weeklyGrowth !== 0 ? 'this week' : 'total count'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-warning-600" />
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.successRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment success rate
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {formatCurrency(stats.pendingAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting settlement
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            <Link
              to="/dashboard/transactions"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="card-body">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating your first payment link.
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard/payment-links/create"
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Payment Link
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Transaction</th>
                      <th className="table-header-cell">Amount</th>
                      <th className="table-header-cell">Method</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Action</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction._id} className="table-row">
                        <td className="table-cell">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description || 'Payment'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.reference}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                            </span>
                            <span className="text-sm text-gray-900">
                              {transaction.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString('en-SS')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString('en-SS', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="table-cell">
                          <Link
                            to={`/dashboard/transactions/${transaction._id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-lg">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description || 'Payment'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{transaction.paymentMethod}</span>
                      <span>
                        {new Date(transaction.createdAt).toLocaleDateString('en-SS')}
                      </span>
                      <Link
                        to={`/dashboard/transactions/${transaction._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              to="/dashboard/payment-links/create" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-8 w-8 text-primary-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900">Create Payment Link</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Generate a new payment link for your customers
                </p>
              </div>
            </Link>

            <Link 
              to="/dashboard/transactions" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCardIcon className="h-8 w-8 text-success-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900">View Transactions</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Monitor all your payment transactions
                </p>
              </div>
            </Link>

            <Link 
              to="/dashboard/payouts" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors sm:col-span-2 lg:col-span-1"
            >
              <CurrencyDollarIcon className="h-8 w-8 text-warning-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900">Request Payout</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Withdraw your available balance
                </p>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="alert alert-danger"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;