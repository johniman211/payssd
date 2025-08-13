import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TokenStorage } from '../../utils/security';

const KYCManagement = () => {
  const [loading, setLoading] = useState(true);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchKYCSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [kycSubmissions, searchTerm, statusFilter, dateFilter]);

  const fetchKYCSubmissions = async () => {
    try {
      setLoading(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('/api/admin/kyc-submissions', config);
      const submissions = Array.isArray(response.data?.submissions) ? response.data.submissions : [];
      const incomingStats = response.data?.stats || {};
      setKycSubmissions(submissions);
      setStats({
        total: Number(incomingStats.total) || submissions.length,
        pending: Number(incomingStats.pending) || 0,
        approved: Number(incomingStats.approved) || 0,
        rejected: Number(incomingStats.rejected) || 0
      });
    } catch (err) {
      console.error('Error fetching KYC submissions:', err);
      toast.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...kycSubmissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
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
        filtered = filtered.filter(submission => 
          new Date(submission.submittedAt) >= filterDate
        );
      }
    }

    setFilteredSubmissions(filtered);
  };

  const handleApprove = async (submissionId) => {
    try {
      setProcessing(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`/api/admin/kyc-submissions/${submissionId}/approve`, {}, config);
      
      // Update local state
      setKycSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { ...submission, status: 'approved', reviewedAt: new Date().toISOString() }
          : submission
      ));
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
      
      toast.success('KYC submission approved successfully');
      setShowModal(false);
    } catch (err) {
      console.error('Error approving KYC:', err);
      toast.error(err.response?.data?.message || 'Failed to approve KYC submission');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (submissionId, reason) => {
    try {
      setProcessing(true);
      const currentRole = TokenStorage.getCurrentRole();
      const token = TokenStorage.getToken(currentRole);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.put(`/api/admin/kyc-submissions/${submissionId}/reject`, {
        reason
      }, config);
      
      // Update local state
      setKycSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: 'rejected', 
              rejectionReason: reason,
              reviewedAt: new Date().toISOString() 
            }
          : submission
      ));
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      toast.success('KYC submission rejected');
      setShowModal(false);
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      toast.error(err.response?.data?.message || 'Failed to reject KYC submission');
    } finally {
      setProcessing(false);
    }
  };

  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const openRejectionModal = () => {
    setShowRejectionModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-SS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge badge-success';
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
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage Know Your Customer submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Submissions</p>
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
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
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
                <XCircleIcon className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
                  placeholder="Search by name, business, or email"
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
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="form-label">Submitted</label>
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
                Showing {filteredSubmissions.length} of {kycSubmissions.length} submissions
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">KYC Submissions</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {submission.firstName} {submission.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{submission.city}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.businessName}
                        </p>
                        <p className="text-xs text-gray-500">{submission.businessType}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-gray-900">{submission.email}</p>
                        <p className="text-xs text-gray-500">{submission.phone}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(submission.status)}
                        <span className={`ml-2 ${getStatusBadge(submission.status)}`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(submission.submittedAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openSubmissionModal(submission)}
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
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'KYC submissions will appear here when users submit their documents.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Review Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  KYC Review - {selectedSubmission.firstName} {selectedSubmission.lastName}
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
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedSubmission.firstName} {selectedSubmission.lastName}
                        </p>
                        <p className="text-xs text-gray-500">Full Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.email}</p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.phone}</p>
                        <p className="text-xs text-gray-500">Phone Number</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.city}</p>
                        <p className="text-xs text-gray-500">City</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.businessName}</p>
                        <p className="text-xs text-gray-500">Business Name</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.businessType}</p>
                        <p className="text-xs text-gray-500">Business Type</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Submitted Documents</h4>
                  <div className="space-y-3">
                    {selectedSubmission.idDocument && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">ID Document</p>
                            <p className="text-xs text-gray-500">National ID or Passport</p>
                          </div>
                        </div>
                        <a
                          href={selectedSubmission.idDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </div>
                    )}
                    
                    {selectedSubmission.businessLicense && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Business License</p>
                            <p className="text-xs text-gray-500">Business registration document</p>
                          </div>
                        </div>
                        <a
                          href={selectedSubmission.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Submission Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Status</p>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedSubmission.status)}
                        <span className={`ml-2 ${getStatusBadge(selectedSubmission.status)}`}>
                          {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {selectedSubmission.reviewedAt && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reviewed Date</p>
                        <p className="text-sm text-gray-900">{formatDate(selectedSubmission.reviewedAt)}</p>
                      </div>
                    )}
                    
                    {selectedSubmission.rejectionReason && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedSubmission.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              {selectedSubmission.status === 'pending' && (
                <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                  <button
                    onClick={openRejectionModal}
                    disabled={processing}
                    className="btn btn-danger"
                  >
                    {processing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <XMarkIcon className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    disabled={processing}
                    className="btn btn-success"
                  >
                    {processing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </button>
                </div>
              )}
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
                <h3 className="text-lg font-semibold text-gray-900">Reject KYC Submission</h3>
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
                          This will help the user understand what needs to be corrected for resubmission.
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
                    placeholder="Please explain why this KYC submission is being rejected..."
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
                  onClick={() => handleReject(selectedSubmission.id, rejectionReason)}
                  disabled={processing || !rejectionReason.trim()}
                  className="btn btn-danger"
                >
                  {processing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Submission'
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

export default KYCManagement;