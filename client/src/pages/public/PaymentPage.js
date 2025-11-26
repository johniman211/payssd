import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon
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
  const [flwReady, setFlwReady] = useState(false);
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
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    fetchPaymentLink();
    if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
      setFlwReady(true);
    }
  }, [linkId]);

  const gatewayAvailable = () => {
    return typeof window !== 'undefined' && !!window.FlutterwaveCheckout;
  };

  const fetchPaymentLink = async () => {
    try {
      const response = await axios.get(`/api/payments/link/${linkId}`);
      if (response.data.success) {
        setPaymentLink(response.data.paymentLink);
        
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
      // Prepare local transaction and get tx_ref
      const prep = await axios.post('/api/payments/flutterwave/prepare', {
        linkId,
        customer: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
        },
      });
      if (!prep.data?.success) {
        toast.error(prep.data?.message || 'Failed to prepare payment');
        setProcessing(false);
        return;
      }
      const publicKey = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || window.FLW_PUBLIC_KEY || '';
      const useInline = gatewayAvailable() && !!publicKey;

      const { tx_ref, amount, currency } = prep.data;

      if (useInline) {
        let settled = false;
        const fallback = async () => {
          if (settled) return;
          settled = true;
          try {
            const init = await axios.post('/api/payments/flutterwave/initiate', {
              linkId,
              customer: {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                email: formData.email || undefined,
              },
            });
            if (init.data?.success && init.data.redirectLink) {
              toast('Opening secure payment page...', { icon: '🔐' });
              window.location.href = init.data.redirectLink;
            } else {
              toast.error(init.data?.message || 'Failed to initiate payment');
              setProcessing(false);
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment could not start');
            setProcessing(false);
          }
        };

        try {
          window.FlutterwaveCheckout({
            public_key: publicKey,
            tx_ref,
            amount,
            currency,
            payment_options: 'card,mpesa,mobilemoney,banktransfer',
            customer: {
              email: formData.email || undefined,
              phone_number: formData.phoneNumber,
              name: formData.name,
            },
            meta: { linkId },
            customizations: {
              title: paymentLink.title,
              description: paymentLink.description,
              logo: paymentLink.customization?.logo || undefined,
            },
            callback: (data) => {
              settled = true;
              toast.success('Payment attempted');
              const transaction = {
                id: data.transaction_id,
                status: data.status,
                tx_ref: data.tx_ref,
                amount: data.amount,
                currency: data.currency,
              };
              localStorage.setItem('lastTransaction', JSON.stringify(transaction));
              setProcessing(false);
              navigate('/payment/success', { state: { transaction, paymentLink } });
            },
            onclose: () => {
              if (!settled) {
                settled = true;
                setProcessing(false);
                toast('Payment window closed', { icon: '👋' });
              }
            },
          });
          setTimeout(() => {
            if (!settled) {
              fallback();
            }
          }, 3000);
        } catch (e) {
          await fallback();
        }
      } else {
        try {
          const init = await axios.post('/api/payments/flutterwave/initiate', {
            linkId,
            customer: {
              name: formData.name,
              phoneNumber: formData.phoneNumber,
              email: formData.email || undefined,
            },
          });
          if (init.data?.success && init.data.redirectLink) {
            toast('Opening secure payment page...', { icon: '🔐' });
            window.location.href = init.data.redirectLink;
          } else {
            toast.error(init.data?.message || 'Failed to initiate payment');
            setProcessing(false);
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment could not start');
          setProcessing(false);
        }
      }
    } catch (err) {
      console.error('Initiate payment error:', err);
      toast.error(err.response?.data?.message || 'Payment failed to start');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    return null;
  };

  const PaymentMethodLogo = ({ method, className = '' }) => {
    if (method === 'card') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center justify-center w-8 h-5 rounded-sm" style={{ background: 'linear-gradient(90deg,#1a1f71 0%,#1a1f71 100%)' }}>
            <span className="text-[9px] font-bold tracking-wider text-yellow-400">VISA</span>
          </div>
          <div className="relative w-8 h-5 rounded-sm overflow-hidden" style={{ backgroundColor: '#fff' }}>
            <div className="absolute left-0 top-0 w-3 h-3 rounded-full" style={{ backgroundColor: '#EB001B' }} />
            <div className="absolute right-0 top-0 w-3 h-3 rounded-full" style={{ backgroundColor: '#F79E1B' }} />
          </div>
        </div>
      );
    }
    if (method === 'mpesa') {
      return (
        <div className={`flex items-center ${className}`}>
          <div className="flex items-center justify-center w-16 h-5 rounded-sm" style={{ backgroundColor: '#1FB841' }}>
            <span className="text-[9px] font-semibold tracking-wider text-white">M-PESA</span>
          </div>
        </div>
      );
    }
    if (method === 'mtn_momo') {
      return (
        <div className={`flex items-center ${className}`}>
          <div className="flex items-center justify-center w-16 h-5 rounded-sm" style={{ backgroundColor: '#FFCC00' }}>
            <span className="text-[9px] font-bold tracking-wider text-black">MTN MoMo</span>
          </div>
        </div>
      );
    }
    if (method === 'bank_transfer') {
      return (
        <div className={`flex items-center ${className}`}>
          <div className="flex items-center justify-center w-16 h-5 rounded-sm bg-gray-800">
            <span className="text-[9px] font-semibold tracking-wider text-white">BANK</span>
          </div>
        </div>
      );
    }
    return <div className={`w-8 h-5 bg-gray-200 rounded-sm ${className}`} />;
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'card':
        return 'Card';
      case 'mpesa':
        return 'Mpesa';
      case 'mtn_momo':
        return 'MTN MoMo';
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
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Link Unavailable</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h1>
            <p className="text-gray-600">Complete your payment safely and securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Secure
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                          validationErrors.name ? 'border-red-300' : focusedField === 'name' ? 'border-primary-300' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {validationErrors.name && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                          validationErrors.phoneNumber ? 'border-red-300' : focusedField === 'phone' ? 'border-primary-300' : 'border-gray-300'
                        }`}
                        placeholder="+211123456789"
                      />
                      {validationErrors.phoneNumber && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.phoneNumber}</p>
                      )}
                    </div>
                    
                    {(paymentLink.collectCustomerInfo?.email?.required || paymentLink.collectCustomerInfo?.email?.optional) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email {paymentLink.collectCustomerInfo?.email?.required ? '*' : '(Optional)'}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                            validationErrors.email ? 'border-red-300' : focusedField === 'email' ? 'border-primary-300' : 'border-gray-300'
                          }`}
                          placeholder="john@example.com"
                        />
                        {validationErrors.email && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Methods Info */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Available Methods
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <PaymentMethodLogo method="card" />
                      <PaymentMethodLogo method="mpesa" />
                      <PaymentMethodLogo method="mtn_momo" />
                      <PaymentMethodLogo method="bank_transfer" />
                    </div>
                    <p className="text-xs text-gray-600">Click Pay to choose a method in the secure popup.</p>
                  </div>

                  {/* Method-specific fields */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={formData.paymentMethod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      {true && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CreditCardIcon className="h-5 w-5 text-gray-600 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Card Payment</h4>
                              <p className="text-xs text-gray-600">Secure card processing via Flutterwave</p>
                            </div>
                          </div>
                          <PaymentMethodLogo method="card" />
                        </div>
                      )}

                      {false && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Mpesa</h4>
                              <p className="text-xs text-gray-600">You'll receive an authorization prompt</p>
                            </div>
                          </div>
                          <PaymentMethodLogo method="mpesa" />
                        </div>
                      )}

                      {false && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">MTN Mobile Money</h4>
                              <p className="text-xs text-gray-600">Authorization request to your MTN wallet</p>
                            </div>
                          </div>
                          <PaymentMethodLogo method="mtn_momo" />
                        </div>
                      )}

                      {false && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Bank Transfer</h4>
                              <p className="text-xs text-gray-600">Transfer to provided account details</p>
                            </div>
                          </div>
                          <PaymentMethodLogo method="bank_transfer" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Pay {formatCurrency(paymentLink.amount)}
                      </>
                    )}
                  </button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-600" />
                    Your payment is encrypted and secure
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                {/* Merchant Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3"
                      style={{ backgroundColor: paymentLink.customization?.primaryColor || '#2563eb' }}
                    >
                      {paymentLink.merchant.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{paymentLink.merchant.businessName}</p>
                      <p className="text-sm text-gray-600">Verified Merchant</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Title</span>
                    <span className="font-medium text-gray-900">{paymentLink.title}</span>
                  </div>
                  
                  {paymentLink.description && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Description</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{paymentLink.description}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium text-gray-900">{paymentLink.currency}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paymentLink.amount)}
                    </span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center mb-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Protected by PaySSD</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Your payment is protected by our secure payment system with end-to-end encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-medium">PaySSD</span> • Secure Payment Processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
