import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  LinkIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired, disabled
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalClicks: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const fetchPaymentLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payments/links');
      setPaymentLinks(response.data.paymentLinks || []);
      setStats(response.data.stats || stats);
    } catch (err) {
      console.error('Error fetching payment links:', err);
      toast.error('Failed to load payment links');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Payment link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const deletePaymentLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this payment link? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/payments/links/${linkId}`);
      setPaymentLinks(prev => prev.filter(link => link._id !== linkId));
      toast.success('Payment link deleted successfully');
    } catch (err) {
      console.error('Error deleting payment link:', err);
      toast.error('Failed to delete payment link');
    }
  };

  const toggleLinkStatus = async (linkId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      await axios.patch(`/api/payments/links/${linkId}/status`, {
        status: newStatus
      });
      
      setPaymentLinks(prev => prev.map(link => 
        link._id === linkId ? { ...link, status: newStatus } : link
      ));
      
      toast.success(`Payment link ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error('Error updating payment link status:', err);
      toast.error('Failed to update payment link status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (link) => {
    if (link.status === 'disabled') {
      return <span className="badge badge-gray">Disabled</span>;
    }
    
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return <span className="badge badge-danger">Expired</span>;
    }
    
    return <span className="badge badge-success">Active</span>;
  };

  const filteredLinks = paymentLinks.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'active':
        return link.status === 'active' && (!link.expiresAt || new Date(link.expiresAt) > new Date());
      case 'expired':
        return link.expiresAt && new Date(link.expiresAt) < new Date();
      case 'disabled':
        return link.status === 'disabled';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading payment links..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage payment links for your customers
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/payment-links/create"
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Payment Link
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LinkIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <ChartBarIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Links</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
                <EyeIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
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
                <CurrencyDollarIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Links
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'active'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'expired'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Expired
              </button>
              <button
                onClick={() => setFilter('disabled')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'disabled'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Disabled
              </button>
            </div>
            
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search payment links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Links List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Payment Links ({filteredLinks.length})
          </h3>
        </div>
        
        {filteredLinks.length === 0 ? (
          <div className="card-body text-center py-12">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {paymentLinks.length === 0 ? 'No payment links yet' : 'No links match your filter'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {paymentLinks.length === 0
                ? 'Create your first payment link to start accepting payments.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {paymentLinks.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/dashboard/payment-links/create"
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Payment Link
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Link Details</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Clicks</th>
                    <th className="table-header-cell">Created</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredLinks.map((link) => (
                    <tr key={link._id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {link.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {link.description}
                          </div>
                          {link.expiresAt && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Expires: {new Date(link.expiresAt).toLocaleDateString('en-SS')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(link.amount)}
                        </div>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(link)}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {link.clickCount || 0}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {new Date(link.createdAt).toLocaleDateString('en-SS')}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(link.url)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Copy link"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                          
                          <Link
                            to={`/dashboard/payment-links/${link._id}`}
                            className="text-gray-600 hover:text-gray-700"
                            title="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => toggleLinkStatus(link._id, link.status)}
                            className={`text-sm px-2 py-1 rounded ${
                              link.status === 'active'
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-success-600 hover:text-success-700'
                            }`}
                            title={link.status === 'active' ? 'Disable' : 'Enable'}
                          >
                            {link.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                          
                          <button
                            onClick={() => deletePaymentLink(link._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete link"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentLinks;