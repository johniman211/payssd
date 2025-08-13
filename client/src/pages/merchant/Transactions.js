import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    successRate: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = transactions.length;
    const successful = transactions.filter(t => t.status === 'completed').length;
    const pending = transactions.filter(t => t.status === 'pending').length;
    const failed = transactions.filter(t => t.status === 'failed').length;
    const totalAmount = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    setStats({
      total,
      successful,
      pending,
      failed,
      totalAmount,
      successRate
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'badge badge-success',
      pending: 'badge badge-warning',
      failed: 'badge badge-danger'
    };
    return badges[status] || 'badge badge-secondary';
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'mtn_momo':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-yellow-500" />;
      case 'digicash':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 0
    }).format(amount);
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

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      // Search filter
      const searchMatch = !searchTerm || 
        transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;

      // Method filter
      const methodMatch = methodFilter === 'all' || transaction.paymentMethod === methodFilter;

      // Date filter
      let dateMatch = true;
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();

      switch (dateFilter) {
        case 'today':
          dateMatch = transactionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = transactionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = transactionDate >= monthAgo;
          break;
        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            const startDate = new Date(customDateRange.start);
            const endDate = new Date(customDateRange.end);
            endDate.setHours(23, 59, 59, 999);
            dateMatch = transactionDate >= startDate && transactionDate <= endDate;
          }
          break;
        default:
          dateMatch = true;
      }

      return searchMatch && statusMatch && methodMatch && dateMatch;
    });
  };

  const exportTransactions = () => {
    const filteredTransactions = getFilteredTransactions();
    const csvContent = [
      ['Date', 'Reference', 'Customer', 'Amount', 'Method', 'Status', 'Description'].join(','),
      ...filteredTransactions.map(t => [
        formatDate(t.createdAt),
        t.reference,
        t.customerName || t.customerEmail || 'N/A',
        t.amount,
        t.paymentMethod,
        t.status,
        `"${t.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully!');
  };

  const viewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all your payment transactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={exportTransactions}
            className="btn btn-primary"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
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
                <CheckCircleIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
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
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {stats.successRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
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
              
              <div>
                <label className="form-label">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label text-xs">From</label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="form-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">To</label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="form-input text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
              placeholder="Search by reference, customer name, email, or description..."
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactions ({filteredTransactions.length})
          </h2>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="card-body text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your transactions will appear here once customers start paying'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.reference}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customerName || 'N/A'}
                        </div>
                        {transaction.customerEmail && (
                          <div className="text-sm text-gray-500">
                            {transaction.customerEmail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getMethodIcon(transaction.paymentMethod)}
                        <span className="ml-2 text-sm text-gray-900">
                          {transaction.paymentMethod === 'mtn_momo' ? 'MTN MoMo' :
                           transaction.paymentMethod === 'digicash' ? 'Digicash' :
                           transaction.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => viewTransaction(transaction)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Transaction Detail Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reference</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.reference}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center">
                      {getStatusIcon(selectedTransaction.status)}
                      <span className={`ml-2 ${getStatusBadge(selectedTransaction.status)}`}>
                        {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <div className="mt-1 flex items-center">
                      {getMethodIcon(selectedTransaction.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedTransaction.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' :
                         selectedTransaction.paymentMethod === 'digicash' ? 'Digicash' :
                         selectedTransaction.paymentMethod}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                  
                  {selectedTransaction.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Completed</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedTransaction.completedAt)}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedTransaction.customerName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.customerName}</p>
                  </div>
                )}
                
                {selectedTransaction.customerEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.customerEmail}</p>
                  </div>
                )}
                
                {selectedTransaction.customerPhone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.customerPhone}</p>
                  </div>
                )}
                
                {selectedTransaction.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>
                )}
                
                {selectedTransaction.failureReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Failure Reason</label>
                    <p className="mt-1 text-sm text-red-600">{selectedTransaction.failureReason}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;