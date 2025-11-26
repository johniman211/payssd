import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { TokenStorage } from '../../utils/security';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [transactionAnalytics, setTransactionAnalytics] = useState(null);
  const [payoutStats, setPayoutStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Request interceptors already attach the token
      const [statsRes, analyticsRes, payoutsRes, transactionsRes] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/transactions/analytics/overview'),
        axios.get('/api/payouts/stats/overview'),
        axios.get('/api/transactions', { params: { limit: 5 } })
      ]);

      setStats(statsRes.data?.stats || null);
      setTransactionAnalytics(analyticsRes.data?.analytics || null);
      setPayoutStats(payoutsRes.data?.stats || null);
      setRecentTransactions(transactionsRes.data?.transactions || []);
      // Refresh user profile to get latest subscription status
      await updateUser();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'SSP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'SSP' ? 'USD' : currency,
      minimumFractionDigits: 2
    }).format(amount).replace('$', currency === 'SSP' ? 'SSP ' : '$');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your merchant dashboard</p>
          </div>
          <div className="flex items-center space-x-3">
            {user?.subscription?.plan && (
              <span
                title={`Plan: ${user.subscription.plan} • Status: ${user.subscription.status || 'active'}`}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  user.subscription.plan === 'pro'
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : user.subscription.plan === 'private'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {user.subscription.plan === 'private'
                  ? 'Private Account'
                  : user.subscription.plan === 'pro'
                  ? 'Pro'
                  : 'Starter'}
              </span>
            )}
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <Link
              to="/dashboard/payment-links/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Payment Link
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats ? formatCurrency(stats.overview?.totalAmount || 0) : '--'}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate: </span>
                  <span className="ml-1 font-medium text-success-600 dark:text-success-400">
                    {stats && stats.overview?.successRate !== undefined ? `${stats.overview.successRate.toFixed(1)}%` : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/20 rounded-xl flex items-center justify-center">
                  <CreditCardIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats && stats.overview?.totalTransactions !== undefined ? stats.overview.totalTransactions.toLocaleString() : '--'}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Successful: </span>
                  <span className="ml-1 font-medium text-success-600 dark:text-success-400">
                    {stats && stats.overview?.successfulTransactions !== undefined ? stats.overview.successfulTransactions.toLocaleString() : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-dark-600 dark:text-dark-300" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Transaction</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats ? formatCurrency(stats.overview?.averageAmount || 0) : '--'}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Fees: </span>
                  <span className="ml-1 font-medium text-primary-600 dark:text-primary-400">
                    {stats ? formatCurrency(stats.overview?.totalFees || 0) : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-success-100 dark:bg-success-900/20 rounded-xl flex items-center justify-center">
                  <BanknotesIcon className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {payoutStats ? formatCurrency(payoutStats.totalAmount) : '--'}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completed: </span>
                  <span className="ml-1 font-medium text-success-600 dark:text-success-400">
                    {payoutStats && payoutStats.completedPayouts !== undefined ? payoutStats.completedPayouts.toLocaleString() : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      {transactionAnalytics && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Today's Performance</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {transactionAnalytics?.today?.transactions || '--'}
                    </span>
                    {transactionAnalytics?.comparison?.transactions?.change !== 0 && (
                      <div className={`ml-2 flex items-center ${
                        transactionAnalytics?.comparison?.transactions?.change > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transactionAnalytics?.comparison?.transactions?.change > 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium ml-1">
                          {Math.abs(transactionAnalytics?.comparison?.transactions?.change || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Transactions Today</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(transactionAnalytics?.today?.revenue || 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Revenue Today</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {transactionAnalytics?.today?.successRate !== undefined ? `${transactionAnalytics.today.successRate.toFixed(1)}%` : '--'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Success Rate Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          <Link
            to="/dashboard/transactions"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Link>
        </div>
        <div className="overflow-hidden">
          {recentTransactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <li key={transaction._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <CreditCardIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.paymentMethod?.replace('_', ' ').toUpperCase()} • {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(transaction.status)
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating your first payment link.
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard/payment-links/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Payment Link
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/payment-links/create"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-600 text-white">
                  <PlusIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create Payment Link
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate a new payment link for your customers
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/transactions"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-600 text-white">
                  <CreditCardIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  View Transactions
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Monitor all your payment transactions
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/payouts"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-600 text-white">
                  <BanknotesIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Payouts
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Request and track your payouts
                </p>
              </div>
            </Link>

            <Link
              to="/dashboard/profile"
              className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-orange-600 text-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Account Settings
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Update your profile and preferences
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
