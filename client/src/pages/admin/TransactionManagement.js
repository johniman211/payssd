import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TokenStorage } from '../../utils/security';

const TransactionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    successRate: 0,
    avgAmount: 0,
    todayTransactions: 0,
    todayAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, methodFilter, dateFilter, customDateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/admin/transactions', config);
      setTransactions(response.data.transactions);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Payment method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === methodFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          filterDate.setDate(now.getDate() - 1);
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            const startDate = new Date(customDateRange.start);
            const endDate = new Date(customDateRange.end);
            endDate.setHours(23, 59, 59, 999);
            
            filtered = filtered.filter(transaction => {
              const transactionDate = new Date(transaction.createdAt);
              return transactionDate >= startDate && transactionDate <= endDate;
            });
          }
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all' && dateFilter !== 'custom') {
        filtered = filtered.filter(transaction => 
          new Date(transaction.createdAt) >= filterDate
        );
      }
    }

    setFilteredTransactions(filtered);
  };

  const exportTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/transactions/export', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          method: methodFilter !== 'all' ? methodFilter : undefined,
          dateFilter,
          startDate: customDateRange.start || undefined,
          endDate: customDateRange.end || undefined,
          search: searchTerm || undefined
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Transactions exported successfully');
    } catch (err) {
      console.error('Error exporting transactions:', err);
      toast.error('Failed to export transactions');
    }
  };

  const openTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'successful':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'failed':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'mtn_momo':
        return (
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <DevicePhoneMobileIcon className="h-4 w-4 text-white" />
          </div>
        );
      case 'digicash':
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <CreditCardIcon className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
            <CurrencyDollarIcon className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  const getMethodName = (method) => {
    switch (method) {
      case 'mtn_momo':
        return 'MTN Mobile Money';
      case 'digicash':
        return 'Digicash';
      default:
        return method;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage all platform transactions
          </p>
        </div>
        <button
          onClick={exportTransactions}
          className="btn btn-primary"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
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
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
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
                <ArrowTrendingUpIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Amount</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.avgAmount)}</p>
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
                <CalendarIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">{stats.todayTransactions}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.todayAmount)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Successful</p>
                <p className="text-xl font-semibold text-success-600">{stats.successful.toLocaleString()}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-xl font-semibold text-warning-600">{stats.pending.toLocaleString()}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-warning-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-xl font-semibold text-danger-600">{stats.failed.toLocaleString()}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-danger-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="form-label">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Search transactions..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="form-label">Payment Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Methods</option>
                <option value="mtn_momo">MTN Mobile Money</option>
                <option value="digicash">Digicash</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="form-label">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setShowCustomDate(e.target.value === 'custom');
                }}
                className="form-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {showCustomDate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Merchant</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{transaction.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{transaction.merchantName}</p>
                          <p className="text-xs text-gray-500">{transaction.merchantEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-gray-900">{transaction.customerPhone || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{transaction.customerEmail || 'N/A'}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getMethodIcon(transaction.paymentMethod)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getMethodName(transaction.paymentMethod)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className={`ml-2 ${getStatusBadge(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openTransactionModal(transaction)}
                        className="btn btn-sm btn-secondary"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Transactions will appear here when merchants start processing payments.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details - #{selectedTransaction.id.slice(-8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-4 space-y-6">
                {/* Transaction Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Transaction Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                      <p className="text-sm text-gray-900 mt-1">#{selectedTransaction.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedTransaction.status)}
                        <span className={`ml-2 ${getStatusBadge(selectedTransaction.status)}`}>
                          {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <div className="flex items-center mt-1">
                        {getMethodIcon(selectedTransaction.paymentMethod)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getMethodName(selectedTransaction.paymentMethod)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedTransaction.description}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reference</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedTransaction.reference || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Merchant Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Merchant Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedTransaction.merchantName}</p>
                        <p className="text-xs text-gray-500">Business Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedTransaction.merchantEmail}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedTransaction.customerPhone || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-sm text-gray-900 mt-1">{selectedTransaction.customerEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Transaction Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Transaction Created</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedTransaction.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedTransaction.processedAt && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Transaction Processed</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedTransaction.processedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedTransaction.failedAt && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Transaction Failed</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedTransaction.failedAt)}</p>
                          {selectedTransaction.failureReason && (
                            <p className="text-xs text-danger-600 mt-1">{selectedTransaction.failureReason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedTransaction.metadata || selectedTransaction.webhookUrl) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Additional Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedTransaction.webhookUrl && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-500">Webhook URL</p>
                          <p className="text-sm text-gray-900 mt-1 break-all">{selectedTransaction.webhookUrl}</p>
                        </div>
                      )}
                      
                      {selectedTransaction.metadata && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Metadata</p>
                          <pre className="text-xs text-gray-900 mt-1 whitespace-pre-wrap">
                            {JSON.stringify(selectedTransaction.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
