import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PaymentPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '+211',
    email: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchPaymentLink();
  }, [linkId]);

  const fetchPaymentLink = async () => {
    try {
      const response = await axios.get(`/api/payments/link/${linkId}`);
      if (response.data.success) {
        setPaymentLink(response.data.paymentLink);
        
        // Prefer 'card' as default, else first available
        if (response.data.paymentLink.allowedPaymentMethods?.length > 0) {
          setFormData(prev => ({
            ...prev,
            paymentMethod: 'card'
          }));
        }
      } else {
        setError(response.data.message || 'Payment link not found');
      }
    } catch (err) {
      console.error('Error fetching payment link:', err);
      setError(err.response?.data?.message || 'Failed to load payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phoneNumber.match(/^\+211[0-9]{9}$/)) {
      errors.phoneNumber = 'Valid South Sudan phone number required (+211xxxxxxxxx)';
    }
    
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Valid email address required';
    }
    
    if (paymentLink?.collectCustomerInfo?.email?.required && !formData.email) {
      errors.email = 'Email is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      setProcessing(true);
      const { data } = await axios.post('/api/payments/flutterwave/initiate', {
        linkId,
        customer: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
        },
      });
      if (data?.success && data?.redirectLink) {
        window.location.href = data.redirectLink;
      } else {
        toast.error(data?.message || 'Failed to initiate payment');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Initiate payment error:', err);
      toast.error(err.response?.data?.message || 'Payment failed to start');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount, currency = 'SSP') => {
    return new Intl.NumberFormat('en-SS', {
      style: 'currency',
      currency: currency === 'SSP' ? 'USD' : currency,
      minimumFractionDigits: 0
    }).format(amount).replace('$', currency === 'SSP' ? 'SSP ' : '$');
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'mpesa':
        return '📲';
      case 'mtn_momo':
        return '📱';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'card':
        return 'Card Payment';
      case 'mpesa':
        return 'Mpesa';
      case 'mtn_momo':
        return 'MTN Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Link Unavailable</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Payment link not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Payment Link Info */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          {/* Header with customization */}
          <div 
            className="px-6 py-4 text-white"
            style={{
              backgroundColor: paymentLink.customization?.primaryColor || '#2563eb'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">{paymentLink.title}</h1>
                <p className="text-sm opacity-90">{paymentLink.merchant.businessName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(paymentLink.amount, paymentLink.currency)}
                </div>
                <div className="text-xs opacity-75">{paymentLink.currency}</div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <p className="text-gray-600 flex-1">{paymentLink.description}</p>
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700">
                <div className="font-semibold">Total</div>
                <div>{formatCurrency(paymentLink.amount, paymentLink.currency)}</div>
                <div className="text-xs text-gray-500">Converted if required during checkout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Complete Payment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+211123456789"
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.phoneNumber}</p>
                  )}
                </div>
                
                {(paymentLink.collectCustomerInfo?.email?.required || paymentLink.collectCustomerInfo?.email?.optional) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email {paymentLink.collectCustomerInfo?.email?.required ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['card','mpesa','mtn_momo','bank_transfer'].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      formData.paymentMethod === method ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{getPaymentMethodIcon(method)}</span>
                    <span className="text-sm font-semibold">{getPaymentMethodName(method)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Method-specific fields */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {formData.paymentMethod === 'card' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Card Payment</h3>
                  <p className="text-xs text-gray-600">You will enter card details securely on Flutterwave.</p>
                </div>
              )}

              {formData.paymentMethod === 'mpesa' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Mpesa Details</h3>
                  <p className="text-xs text-gray-600">Enter your phone number. You will be prompted to authorize the payment.</p>
                </div>
              )}

              {formData.paymentMethod === 'mtn_momo' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">MTN Mobile Money</h3>
                  <p className="text-xs text-gray-600">We will send an authorization request to your MTN MoMo wallet.</p>
                </div>
              )}

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Bank Transfer Instructions</h3>
                  <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    Transfer the total amount to the provided bank account during checkout. Your payment will be verified automatically.
                  </div>
                </div>
              )}
            </motion.div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="ml-2">
                  <div className="text-sm font-medium text-green-800">Secure Payment</div>
                  <div className="text-xs text-green-700">
                    Your payment is protected by PaySSD's secure payment system
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-2xl font-bold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Pay Now ({formatCurrency(paymentLink.amount, paymentLink.currency)})
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Powered by PaySSD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
