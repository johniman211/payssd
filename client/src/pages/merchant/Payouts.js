import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Payouts = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total: 0
  });
  const [stats, setStats] = useState({
    totalRequested: 0,
    totalPaid: 0,
    pendingAmount: 0,
    successRate: 0
  });

  useEffect(() => {
    fetchPayouts();
    fetchBalance();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [payouts]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payouts');
      setPayouts(response.data);
    } catch (err) {
      console.error('Error fetching payouts:', err);
      toast.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/users/balance');
      setBalance(response.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const calculateStats = () => {
    const totalRequested = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const successRate = payouts.length > 0 
      ? (payouts.filter(p => p.status === 'completed').length / payouts.length) * 100 
      : 0;

    setStats({
      totalRequested,
      totalPaid,
      pendingAmount,
      successRate
    });
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(requestAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > balance.available) {
      toast.error('Insufficient available balance');
      return;
    }
    
    if (amount < 100) {
      toast.error('Minimum payout amount is SSP 100');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await axios.post('/api/payouts', {
        amount,
        note: requestNote
      });
      
      setPayouts(prev => [response.data, ...prev]);
      setBalance(prev => ({
        ...prev,
        available: prev.available - amount,
        pending: prev.pending + amount
      }));
      
      setShowRequestModal(false);
      setRequestAmount('');
      setRequestNote('');
      toast.success('Payout request submitted successfully!');
    } catch (err) {
      console.error('Error requesting payout:', err);
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'badge badge-success',
      pending: 'badge badge-warning',
      rejected: 'badge badge-danger'
    };
    return badges[status] || 'badge badge-secondary';
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

  const viewPayout = (payout) => {
    setSelectedPayout(payout);
    setShowDetailModal(true);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Request payouts and track your payment history
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={balance.available < 100}
          className="mt-4 sm:mt-0 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Request Payout
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance.available)}
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
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance.pending)}
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
                <BanknotesIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance.total)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Requested</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(stats.totalRequested)}
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
                <CheckCircleIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
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
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-600">
                    {stats.successRate.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Important Notice */}
      {balance.available < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50 border border-warning-200 rounded-lg p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-800">
                Minimum Payout Amount
              </h3>
              <div className="mt-2 text-sm text-warning-700">
                <p>
                  The minimum payout amount is SSP 100. Your current available balance is {formatCurrency(balance.available)}.
                  You need at least {formatCurrency(100 - balance.available)} more to request a payout.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payouts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Payout History ({payouts.length})
          </h2>
        </div>
        
        {payouts.length === 0 ? (
          <div className="card-body text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payouts yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your payout requests will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date Requested</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date Processed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, index) => (
                  <motion.tr
                    key={payout._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="text-sm text-gray-900">
                        {formatDate(payout.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payout.amount)}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadge(payout.status)}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">
                        {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => viewPayout(payout)}
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

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Payout
                </h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="form-label">Available Balance</label>
                  <div className="text-2xl font-bold text-success-600">
                    {formatCurrency(balance.available)}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Payout Amount (SSP) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      className="form-input pl-10"
                      placeholder="0.00"
                      min="100"
                      max={balance.available}
                      step="0.01"
                      required
                    />
                  </div>
                  <p className="form-help">
                    Minimum amount: SSP 100. Maximum: {formatCurrency(balance.available)}
                  </p>
                </div>
                
                <div>
                  <label className="form-label">Note (Optional)</label>
                  <textarea
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    rows={3}
                    className="form-textarea"
                    placeholder="Add any additional notes for this payout request"
                    maxLength={500}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Payout Information
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Payouts are processed manually by our team</li>
                          <li>Processing time: 1-3 business days</li>
                          <li>You will receive an email notification when processed</li>
                          <li>Funds will be transferred to your registered bank account</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payout Detail Modal */}
      {showDetailModal && selectedPayout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Payout Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payout ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayout._id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center">
                      {getStatusIcon(selectedPayout.status)}
                      <span className={`ml-2 ${getStatusBadge(selectedPayout.status)}`}>
                        {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {formatCurrency(selectedPayout.amount)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Requested</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedPayout.createdAt)}
                    </p>
                  </div>
                  
                  {selectedPayout.processedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Processed</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedPayout.processedAt)}
                      </p>
                    </div>
                  )}
                  
                  {selectedPayout.processedBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Processed By</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayout.processedBy}</p>
                    </div>
                  )}
                </div>
                
                {selectedPayout.note && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Note</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayout.note}</p>
                  </div>
                )}
                
                {selectedPayout.adminNote && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Note</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayout.adminNote}</p>
                  </div>
                )}
                
                {selectedPayout.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <p className="mt-1 text-sm text-red-600">{selectedPayout.rejectionReason}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
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

export default Payouts;