import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { TokenStorage } from '../../utils/security';
import axios from 'axios'

const CreatePaymentLinkPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'SSP',
    expiresAt: '',
    maxUses: '',
    allowCustomAmount: false,
    minAmount: '',
    maxAmount: '',
    collectCustomerInfo: true,
    redirectUrl: '',
    webhookUrl: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Frontend validation
    if (!formData.allowCustomAmount && (!formData.amount || parseFloat(formData.amount) < 1)) {
      setError('Amount must be at least 1');
      setLoading(false);
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
      };

      // For custom amounts, we need to set a default amount for backend validation
      if (formData.allowCustomAmount && !payload.amount) {
        payload.amount = 1; // Set minimum required amount for backend validation
      }

      const { data } = await axios.post('/api/payments/create-link', payload);

      setSuccess('Payment link created successfully!');
      setTimeout(() => {
        navigate('/dashboard/payment-links');
      }, 2000);
    } catch (error) {
      console.error('Error creating payment link:', error);
      const message = error.response?.data?.message || 'Failed to create payment link. Please try again.';
      if (message.includes('KYC verification required')) {
        setError('KYC verification required. Please complete your verification process before creating payment links.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (currency) => {
    return currency === 'SSP' ? 'SSP' : currency;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Create Payment Link</h1>
        <p className="text-gray-600 mt-1">Create a new payment link for your customers</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-red-600">{error}</p>
              {error.includes('KYC verification required') && (
                <p className="text-red-600 mt-2">
                  <Link 
                    to="/dashboard/kyc" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Complete KYC verification here
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-green-600">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Product Purchase, Service Payment"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency *
                </label>
                <select
                  name="currency"
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="SSP">South Sudanese Pound (SSP)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                required
                minLength={10}
                maxLength={500}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe what this payment is for... (minimum 10 characters)"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters (minimum 10 required)
              </p>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Payment Amount
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="allowCustomAmount"
                id="allowCustomAmount"
                checked={formData.allowCustomAmount}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowCustomAmount" className="ml-2 block text-sm text-gray-900">
                Allow customers to enter custom amount
              </label>
            </div>

            {!formData.allowCustomAmount ? (
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Fixed Amount * ({formatCurrency(formData.currency)})
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    required={!formData.allowCustomAmount}
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{formatCurrency(formData.currency)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700">
                    Minimum Amount ({formatCurrency(formData.currency)})
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="minAmount"
                      id="minAmount"
                      min="0"
                      step="0.01"
                      value={formData.minAmount}
                      onChange={handleInputChange}
                      className="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{formatCurrency(formData.currency)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700">
                    Maximum Amount ({formatCurrency(formData.currency)})
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="maxAmount"
                      id="maxAmount"
                      min="0"
                      step="0.01"
                      value={formData.maxAmount}
                      onChange={handleInputChange}
                      className="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{formatCurrency(formData.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Link Settings
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                  Expiration Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    id="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
              </div>
              <div>
                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  name="maxUses"
                  id="maxUses"
                  min="1"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Unlimited"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited uses</p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="collectCustomerInfo"
                id="collectCustomerInfo"
                checked={formData.collectCustomerInfo}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="collectCustomerInfo" className="ml-2 block text-sm text-gray-900">
                Collect customer information (name, email, phone)
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
            <p className="text-sm text-gray-500">Optional settings for advanced use cases</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="redirectUrl" className="block text-sm font-medium text-gray-700">
                Success Redirect URL
              </label>
              <input
                type="url"
                name="redirectUrl"
                id="redirectUrl"
                value={formData.redirectUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://yourwebsite.com/success"
              />
              <p className="mt-1 text-xs text-gray-500">Where to redirect customers after successful payment</p>
            </div>
            <div>
              <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                Webhook URL
              </label>
              <input
                type="url"
                name="webhookUrl"
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://yourapi.com/webhook"
              />
              <p className="mt-1 text-xs text-gray-500">Receive payment notifications at this URL</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/payment-links')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              'Create Payment Link'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePaymentLinkPage;