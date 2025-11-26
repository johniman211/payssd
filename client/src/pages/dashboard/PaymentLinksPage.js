import React, { useState, useEffect } from 'react';
import { Link, Copy, ExternalLink, Eye, Trash2, Plus, Edit } from 'lucide-react';
import axios from 'axios';
import { TokenStorage } from '../../utils/security';

const PaymentLinksPage = () => {
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    expiresAt: '',
    isMultiUse: true,
    maxUses: '',
    allowedPaymentMethods: ['flutterwave']
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const fetchPaymentLinks = async () => {
    try {
      const response = await axios.get('/api/payments/links');
      setPaymentLinks(response.data.links || []);
    } catch (error) {
      console.error('Error fetching payment links:', error);
      setError('Failed to load payment links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = TokenStorage.getToken();
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        expiresAt: formData.expiresAt || undefined
      };

      await axios.post('/api/payments/create-link', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Payment link created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        expiresAt: '',
        isMultiUse: true,
        maxUses: '',
        allowedPaymentMethods: ['flutterwave']
      });
      fetchPaymentLinks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create payment link');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const deletePaymentLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this payment link?')) return;

    try {
      await axios.delete(`/api/payments/links/${linkId}`);
      setSuccess('Payment link deleted successfully!');
      fetchPaymentLinks();
    } catch (error) {
      setError('Failed to delete payment link');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (link) => {
    if (!link.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
    if (!link.isMultiUse && link.usageCount >= 1) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Used</span>;
    }
    if (link.maxUses && link.usageCount >= link.maxUses) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Limit Reached</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
          <p className="text-gray-600 mt-1">Manage your payment links</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
            <p className="text-gray-600 mt-1">Create and manage payment links for your customers</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Create Payment Link Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create Payment Link</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={100}
                  placeholder="e.g., Product Purchase"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <div className="flex">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SSP">SSP</option>
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={500}
                rows={3}
                placeholder="Describe what this payment is for..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  placeholder="Unlimited"
                  disabled={!formData.isMultiUse}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isMultiUse}
                  onChange={(e) => setFormData({ ...formData, isMultiUse: e.target.checked, maxUses: e.target.checked ? formData.maxUses : '' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow multiple uses</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Payment Methods (Flutterwave)
              </label>
              <div className="space-y-2">
                {[
                  { key: 'card', label: 'Card' },
                  { key: 'mobilemoney', label: 'Mobile Money' },
                  { key: 'mpesa', label: 'M‑Pesa' },
                  { key: 'bank_transfer', label: 'Bank Transfer' }
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowedPaymentMethods.includes(opt.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, allowedPaymentMethods: [...formData.allowedPaymentMethods, opt.key] });
                        } else {
                          setFormData({ ...formData, allowedPaymentMethods: formData.allowedPaymentMethods.filter(m => m !== opt.key) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || formData.allowedPaymentMethods.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Links List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Payment Links</h2>
        </div>
        
        {paymentLinks.length === 0 ? (
          <div className="p-6 text-center">
            <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No payment links created yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paymentLinks.map((link) => (
              <div key={link._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{link.title}</h3>
                      {getStatusBadge(link)}
                    </div>
                    <p className="text-gray-600 mb-3">{link.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="font-medium">{formatCurrency(link.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Uses:</span>
                        <p className="font-medium">
                          {link.usageCount} {link.maxUses ? `/ ${link.maxUses}` : '/ ∞'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium">{new Date(link.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Expires:</span>
                        <p className="font-medium">
                          {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-700 break-all">
                          {`${window.location.origin}/pay/${link.linkId}`}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/pay/${link.linkId}`)}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <a
                      href={`/pay/${link.linkId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="View payment page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deletePaymentLink(link._id)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentLinksPage;
