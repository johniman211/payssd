import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  BanknotesIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TokenStorage } from '../../utils/security';

const PayoutManagement = () => {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0
  });

  useEffect(() => {
    fetchPayouts();
  }, []);

  useEffect(() => {
    filterPayouts();
  }, [payouts, searchTerm, statusFilter, dateFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/admin/payouts', config);
      setPayouts(response.data.payouts || []);
      
      // Provide default stats values
      const incomingStats = response.data.stats || {};
      setStats({
        total: Number(incomingStats.total) || 0,
        pending: Number(incomingStats.pending) || 0,
        approved: Number(incomingStats.approved) || 0,
        completed: Number(incomingStats.completed) || 0,
        rejected: Number(incomingStats.rejected) || 0,
        totalAmount: Number(incomingStats.totalAmount) || 0,
        pendingAmount: Number(incomingStats.pendingAmount) || 0,
        completedAmount: Number(incomingStats.completedAmount) || 0,
        processing: Number(incomingStats.processing) || 0,
        failed: Number(incomingStats.failed) || 0,
        cancelled: Number(incomingStats.cancelled) || 0
      });
    } catch (err) {
      console.error('Error fetching payouts:', err);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const filterPayouts = () => {
    let filtered = [...payouts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payout =>
        payout.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.merchantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payout.payoutId || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payout => payout.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(payout => 
          new Date(payout.requestedAt) >= filterDate
        );
      }
    }

    setFilteredPayouts(filtered);
  };

  const handleApprovePayout = async (payoutId, notes) => {
    try {
      setProcessing(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`/api/admin/payouts/${payoutId}/approve`, {
        notes
      }, config);
      
      // Update local state
      setPayouts(prev => prev.map(payout => 
        payout.payoutId === payoutId 
          ? { 
              ...payout, 
              status: 'approved', 
              approvedAt: new Date().toISOString(),
              approvalNotes: notes
            }
          : payout
      ));
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1,
        pendingAmount: prev.pendingAmount - selectedPayout.amount
      }));
      
      toast.success('Payout approved successfully');
      setShowModal(false);
      setShowApprovalModal(false);
      setApprovalNotes('');
    } catch (err) {
      console.error('Error approving payout:', err);
      toast.error(err.response?.data?.message || 'Failed to approve payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayout = async (payoutId, reason) => {
    try {
      setProcessing(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`/api/admin/payouts/${payoutId}/reject`, {
        reason
      }, config);
      
      // Update local state
      setPayouts(prev => prev.map(payout => 
        payout.payoutId === payoutId 
          ? { 
              ...payout, 
              status: 'rejected', 
              rejectedAt: new Date().toISOString(),
              rejectionReason: reason
            }
          : payout
      ));
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1,
        pendingAmount: prev.pendingAmount - selectedPayout.amount
      }));
      
      toast.success('Payout rejected');
      setShowModal(false);
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting payout:', err);
      toast.error(err.response?.data?.message || 'Failed to reject payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompletePayout = async (payoutId) => {
    try {
      setProcessing(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`/api/admin/payouts/${payoutId}/complete`, {}, config);
      
      // Update local state
      setPayouts(prev => prev.map(payout => 
        payout.payoutId === payoutId 
          ? { 
              ...payout, 
              status: 'completed', 
              completedAt: new Date().toISOString()
            }
          : payout
      ));
      
      setStats(prev => ({
        ...prev,
        approved: prev.approved - 1,
        completed: prev.completed + 1,
        completedAmount: prev.completedAmount + selectedPayout.amount
      }));
      
      toast.success('Payout marked as completed');
      setShowModal(false);
    } catch (err) {
      console.error('Error completing payout:', err);
      toast.error(err.response?.data?.message || 'Failed to complete payout');
    } finally {
      setProcessing(false);
    }
  };

  const exportPayouts = async () => {
    try {
      const response = await axios.get('/api/admin/payouts/export', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          dateFilter,
          search: searchTerm || undefined
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payouts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Payouts exported successfully');
    } catch (err) {
      console.error('Error exporting payouts:', err);
      toast.error('Failed to export payouts');
    }
  };

  const openPayoutModal = (payout) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const openApprovalModal = () => {
    setShowApprovalModal(true);
  };

  const openRejectionModal = () => {
    setShowRejectionModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      case 'completed':
        return 'badge badge-success';
      case 'approved':
        return 'badge badge-primary';
      case 'pending':
        return 'badge badge-warning';
      case 'rejected':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'approved':
        return <CheckIcon className="h-5 w-5 text-primary-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'rejected':
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and process merchant payout requests
          </p>
        </div>
        <button
          onClick={exportPayouts}
          className="btn btn-primary"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
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
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.pendingAmount)}</p>
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
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.completedAmount)}</p>
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
                <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
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
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-xl font-semibold text-primary-600">{stats.approved}</p>
              </div>
              <CheckIcon className="h-8 w-8 text-primary-600" />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-xl font-semibold text-danger-600">{stats.rejected}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-danger-600" />
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
                <p className="text-sm font-medium text-gray-500">Avg. Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(stats.total > 0 ? stats.totalAmount / stats.total : 0)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="Search by merchant or ID"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label">Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select pl-10"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="form-label">Requested</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="form-select pl-10"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Showing {filteredPayouts.length} of {payouts.length} requests
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payouts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Payout Requests</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((payout) => (
                  <tr key={payout.payoutId}>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          #{(payout.payoutId || '').slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">{payout.destination?.accountNumber}</p>
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
                          <p className="text-sm font-medium text-gray-900">{payout.merchantName}</p>
                          <p className="text-xs text-gray-500">{payout.merchantEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payout.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(payout.status)}
                        <span className={`ml-2 ${getStatusBadge(payout.status)}`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(payout.requestedAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openPayoutModal(payout)}
                        className="btn btn-sm btn-secondary"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPayouts.length === 0 && (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payout requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Payout requests will appear here when merchants request withdrawals.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payout Details Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payout Request - #{(selectedPayout.payoutId || '').slice(-8).toUpperCase()}
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
                {/* Payout Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Payout Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Request ID</p>
                      <p className="text-sm text-gray-900 mt-1">#{selectedPayout.payoutId}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatCurrency(selectedPayout.amount)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedPayout.status)}
                        <span className={`ml-2 ${getStatusBadge(selectedPayout.status)}`}>
                          {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Requested Date</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedPayout.requestedAt)}</p>
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
                        <p className="text-sm font-medium text-gray-900">{selectedPayout.merchantName}</p>
                        <p className="text-xs text-gray-500">Business Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedPayout.merchantEmail}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedPayout.merchantPhone}</p>
                        <p className="text-xs text-gray-500">Phone Number</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedPayout.merchantBalance)}</p>
                        <p className="text-xs text-gray-500">Current Balance</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Bank Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bank Name</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedPayout.destination?.bankName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedPayout.destination?.accountNumber}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Name</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedPayout.destination?.accountName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Branch</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedPayout.destination?.branch || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedPayout.notes && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Request Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{selectedPayout.notes}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Payout Requested</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedPayout.requestedAt)}</p>
                      </div>
                    </div>
                    
                    {selectedPayout.approvedAt && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Payout Approved</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedPayout.approvedAt)}</p>
                          {selectedPayout.approvalNotes && (
                            <p className="text-xs text-gray-600 mt-1">{selectedPayout.approvalNotes}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedPayout.completedAt && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Payout Completed</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedPayout.completedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedPayout.rejectedAt && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Payout Rejected</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedPayout.rejectedAt)}</p>
                          {selectedPayout.rejectionReason && (
                            <p className="text-xs text-danger-600 mt-1">{selectedPayout.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                {selectedPayout.status === 'pending' && (
                  <>
                    <button
                      onClick={openRejectionModal}
                      disabled={processing}
                      className="btn btn-danger"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={openApprovalModal}
                      disabled={processing}
                      className="btn btn-success"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  </>
                )}
                
                {selectedPayout.status === 'approved' && (
                  <button
                    onClick={() => handleCompletePayout(selectedPayout.payoutId)}
                    disabled={processing}
                    className="btn btn-primary"
                  >
                    {processing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Approve Payout Request</h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-success-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-success-800">
                        Approve payout of {formatCurrency(selectedPayout.amount)}?
                      </h3>
                      <div className="mt-2 text-sm text-success-700">
                        <p>
                          This will approve the payout request. You can add notes for the merchant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Approval Notes (Optional)</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Add any notes for the merchant..."
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprovePayout(selectedPayout.payoutId, approvalNotes)}
                  disabled={processing}
                  className="btn btn-success"
                >
                  {processing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Approving...
                    </>
                  ) : (
                    'Approve Payout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Reject Payout Request</h3>
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-danger-800">
                        Please provide a reason for rejection
                      </h3>
                      <div className="mt-2 text-sm text-danger-700">
                        <p>
                          This will help the merchant understand why their payout request was rejected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="form-textarea"
                    rows={4}
                    placeholder="Please explain why this payout request is being rejected..."
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectPayout(selectedPayout.payoutId, rejectionReason)}
                  disabled={processing || !rejectionReason.trim()}
                  className="btn btn-danger"
                >
                  {processing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutManagement;
