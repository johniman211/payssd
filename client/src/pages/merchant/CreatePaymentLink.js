import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CreatePaymentLink = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'SSP',
    expiresAt: '',
    allowCustomAmount: false,
    minAmount: '',
    maxAmount: '',
    collectCustomerInfo: true,
    redirectUrl: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [step, setStep] = useState(1); // 1: form, 2: preview, 3: success

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.allowCustomAmount) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    } else {
      if (formData.minAmount && parseFloat(formData.minAmount) <= 0) {
        newErrors.minAmount = 'Minimum amount must be greater than 0';
      }
      if (formData.maxAmount && parseFloat(formData.maxAmount) <= 0) {
        newErrors.maxAmount = 'Maximum amount must be greater than 0';
      }
      if (formData.minAmount && formData.maxAmount && 
          parseFloat(formData.minAmount) >= parseFloat(formData.maxAmount)) {
        newErrors.maxAmount = 'Maximum amount must be greater than minimum amount';
      }
    }
    
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expiresAt = 'Expiry date must be in the future';
      }
    }
    
    if (formData.redirectUrl && !isValidUrl(formData.redirectUrl)) {
      newErrors.redirectUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        amount: formData.allowCustomAmount ? null : parseFloat(formData.amount),
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null
      };
      
      const response = await axios.post('/api/payments/create-link', submitData);
      setCreatedLink(response.data);
      setStep(3);
      toast.success('Payment link created successfully!');
    } catch (err) {
      console.error('Error creating payment link:', err);
      toast.error(err.response?.data?.message || 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SS', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (step === 3 && createdLink) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 mb-4">
            <LinkIcon className="h-6 w-6 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Link Created Successfully!
          </h1>
          <p className="text-gray-600">
            Your payment link is ready to share with customers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-6"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Payment Link Details</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Link URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={createdLink.url}
                  readOnly
                  className="form-input rounded-r-none flex-1"
                />
                <button
                  onClick={() => copyToClipboard(createdLink.url)}
                  className="btn btn-secondary rounded-l-none border-l-0"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <p className="text-sm text-gray-900">{createdLink.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-sm text-gray-900">
                  {createdLink.allowCustomAmount
                    ? `${createdLink.minAmount ? formatCurrency(createdLink.minAmount) + ' - ' : ''}${createdLink.maxAmount ? formatCurrency(createdLink.maxAmount) : 'Any amount'}`
                    : formatCurrency(createdLink.amount)
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className="badge badge-success">Active</span>
              </div>
              
              {createdLink.expiresAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(createdLink.expiresAt).toLocaleDateString('en-SS', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900">{createdLink.description}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => window.open(createdLink.url, '_blank')}
            className="btn btn-secondary flex-1"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview Payment Page
          </button>
          
          <Link
            to="/dashboard/payment-links"
            className="btn btn-primary flex-1"
          >
            View All Payment Links
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Link
          to="/dashboard/payment-links"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Payment Link</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate a secure payment link for your customers
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center ${
          step >= 1 ? 'text-primary-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Details</span>
        </div>
        
        <div className={`w-16 h-0.5 ${
          step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
        }`} />
        
        <div className={`flex items-center ${
          step >= 2 ? 'text-primary-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Preview</span>
        </div>
        
        <div className={`w-16 h-0.5 ${
          step >= 3 ? 'bg-primary-600' : 'bg-gray-200'
        }`} />
        
        <div className={`flex items-center ${
          step >= 3 ? 'text-primary-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Complete</span>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Payment Link Details' : 'Preview Payment Link'}
          </h2>
        </div>
        
        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="card-body space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`form-input ${errors.title ? 'border-red-300' : ''}`}
                    placeholder="e.g., Product Purchase, Service Payment"
                    maxLength={100}
                  />
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>
                
                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`form-textarea ${errors.description ? 'border-red-300' : ''}`}
                    placeholder="Describe what the customer is paying for"
                    maxLength={500}
                  />
                  {errors.description && <p className="form-error">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Amount</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowCustomAmount"
                    checked={formData.allowCustomAmount}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Allow customers to enter custom amount
                  </label>
                </div>
                
                {!formData.allowCustomAmount ? (
                  <div>
                    <label className="form-label">Amount (SSP) *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className={`form-input pl-10 ${errors.amount ? 'border-red-300' : ''}`}
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    {errors.amount && <p className="form-error">{errors.amount}</p>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Minimum Amount (SSP)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="minAmount"
                          value={formData.minAmount}
                          onChange={handleInputChange}
                          className={`form-input pl-10 ${errors.minAmount ? 'border-red-300' : ''}`}
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                        />
                      </div>
                      {errors.minAmount && <p className="form-error">{errors.minAmount}</p>}
                    </div>
                    
                    <div>
                      <label className="form-label">Maximum Amount (SSP)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="maxAmount"
                          value={formData.maxAmount}
                          onChange={handleInputChange}
                          className={`form-input pl-10 ${errors.maxAmount ? 'border-red-300' : ''}`}
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                        />
                      </div>
                      {errors.maxAmount && <p className="form-error">{errors.maxAmount}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Expiry Date (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.expiresAt ? 'border-red-300' : ''}`}
                      min={getMinDate()}
                    />
                  </div>
                  {errors.expiresAt && <p className="form-error">{errors.expiresAt}</p>}
                  <p className="form-help">Leave empty for no expiry</p>
                </div>
                
                <div>
                  <label className="form-label">Redirect URL (Optional)</label>
                  <input
                    type="url"
                    name="redirectUrl"
                    value={formData.redirectUrl}
                    onChange={handleInputChange}
                    className={`form-input ${errors.redirectUrl ? 'border-red-300' : ''}`}
                    placeholder="https://yourwebsite.com/thank-you"
                  />
                  {errors.redirectUrl && <p className="form-error">{errors.redirectUrl}</p>}
                  <p className="form-help">Where to redirect customers after successful payment</p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="collectCustomerInfo"
                    checked={formData.collectCustomerInfo}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Collect customer contact information
                  </label>
                </div>
                
                <div>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="Additional notes or instructions for customers"
                    maxLength={1000}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Preview Payment Link
              </button>
            </div>
          </form>
        ) : (
          <div className="card-body space-y-6">
            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Link Preview</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {formData.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {formData.description}
                  </p>
                  
                  <div className="text-3xl font-bold text-primary-600 mb-4">
                    {formData.allowCustomAmount
                      ? `${formData.minAmount ? formatCurrency(parseFloat(formData.minAmount)) + ' - ' : ''}${formData.maxAmount ? formatCurrency(parseFloat(formData.maxAmount)) : 'Any amount'}`
                      : formatCurrency(parseFloat(formData.amount) || 0)
                    }
                  </div>
                  
                  {formData.expiresAt && (
                    <p className="text-sm text-gray-500 mb-4">
                      Expires on {new Date(formData.expiresAt).toLocaleDateString('en-SS')}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <button className="w-full btn btn-primary">
                      Pay with MTN Mobile Money
                    </button>
                    <button className="w-full btn btn-secondary">
                      Pay with Digicash
                    </button>
                  </div>
                  
                  {formData.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Back to Edit
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Payment Link'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreatePaymentLink;