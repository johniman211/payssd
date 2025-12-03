import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Lock,
  Shield,
  Headphones,
  CheckCircle,
  XCircle,
  CreditCard,
  Smartphone,
  Building2,
  Download,
  ArrowLeft,
  Loader
} from 'lucide-react';
import { supabase } from '../supabase/supabaseClient';
import { publishNotification } from '@/services/notifications';

/* -------------------- Custom Hook: usePayment -------------------- */
const brandLogos = {
  visa: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  mobile_money: '/logos/mobile_money.svg',
};

const PaymentLogo = ({ src, alt, className }) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <span className={`px-2 py-1 bg-secondary-100 rounded text-xs ${className}`}>{alt}</span>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};

const BankLogo = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2 2 7v2h20V7L12 2zm-8 9v8h2v-8H4zm4 0v8h2v-8H8zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 8v-8h-2v8h2zM2 21h20v-2H2v2z" />
  </svg>
);
const usePayment = (paymentLink, merchant, formData, cardData, mobileMoneyData) => {
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed' | null
  const [transactionId, setTransactionId] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const amount = parseFloat(formData.amount);

      // Platform fee & net amount
      const platformFee = amount * 0.025;
      const netAmount = amount - platformFee;

      // Transaction reference
      const transactionRef =
        'TXN' +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).substr(2, 6).toUpperCase();

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            merchant_id: paymentLink.merchant_id,
            transaction_reference: transactionRef,
            amount: amount,
            currency: 'SSP',
            payment_method: formData.paymentMethod,
            customer_name: formData.customerName,
            customer_email: formData.customerEmail || null,
            customer_phone: formData.customerPhone || mobileMoneyData.phoneNumber || null,
            description: paymentLink.description || paymentLink.title,
            status: 'pending',
            environment: merchant?.verification_status === 'approved' ? 'live' : 'sandbox',
            platform_fee: platformFee,
            net_amount: netAmount,
            payment_details: {
              card:
                formData.paymentMethod === 'card'
                  ? { last4: cardData.cardNumber.slice(-4), expiry: cardData.expiryDate }
                  : null,
              mobile_money:
                formData.paymentMethod === 'mobile_money'
                  ? { provider: mobileMoneyData.provider, phone: mobileMoneyData.phoneNumber }
                  : null,
            },
          },
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      setTransactionId(transaction.transaction_reference);

      // Call payment function
      const res = await supabase.functions.invoke('pay', {
        body: {
          merchant_id: merchant?.id || paymentLink.merchant_id,
          amount: parseFloat(formData.amount || paymentLink.amount),
          currency: paymentLink.currency || 'SSP',
          link_code: paymentLink.link_code,
          customer_email: formData.customerEmail,
          redirect_url: window.location.href,
        },
      });

      const link = res.data?.flutterwave?.data?.link;
      const simulated = !!res.data?.test_simulated;
      const ok = res.data?.ok === true;

      if (link) {
        window.location.href = link;
        return;
      }
      if (simulated || ok) {
        if (simulated) alert('Test payment completed successfully');
      } else {
        throw new Error(res.data?.error || res.error?.message || 'Payment initiation failed');
      }

      await supabase
        .from('payment_links')
        .update({ current_uses: (paymentLink?.current_uses || 0) + 1 })
        .eq('id', paymentLink.id);

      setPaymentStatus('success');
      await publishNotification('transaction_succeeded', {
        merchant_id: paymentLink.merchant_id,
        payload: { amount, reference: transactionRef },
      });
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      setPaymentError(errorMessage);
      setPaymentStatus('failed');
      await publishNotification('transaction_failed', {
        merchant_id: paymentLink?.merchant_id,
        payload: {
          amount: parseFloat(formData.amount || paymentLink?.amount || 0),
          reference: transactionId,
          reason: errorMessage,
        },
      }).catch(() => {});
    } finally {
      setProcessing(false);
    }
  };

  return { handlePayment, processing, paymentStatus, transactionId, paymentError };
};

/* -------------------- Reusable Components -------------------- */
const PaymentSummary = ({ merchant, paymentLink, formData, mobileMoneyData }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SSP', minimumFractionDigits: 2 }).format(
      amount
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-secondary-900 mb-4">Payment Summary</h2>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-secondary-500 mb-1">Merchant</p>
          <p className="font-semibold text-secondary-900">
            {merchant?.business_name || `${merchant?.first_name} ${merchant?.last_name}`}
          </p>
        </div>

        <div>
          <p className="text-sm text-secondary-500 mb-1">Payment For</p>
          <p className="font-semibold text-secondary-900">{paymentLink?.title}</p>
          {paymentLink?.description && <p className="text-sm text-secondary-600 mt-1">{paymentLink.description}</p>}
        </div>

        <div className="border-t border-secondary-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-secondary-500">Amount</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(parseFloat(formData.amount || paymentLink?.amount || 0))}
            </p>
          </div>
          <p className="text-xs text-secondary-500">South Sudanese Pound (SSP)</p>
        </div>

        <div>
          <p className="text-sm text-secondary-500 mb-1">Payment Method</p>
          <div className="flex items-center gap-3">
            {formData.paymentMethod === 'mobile_money' && (
              <PaymentLogo src={brandLogos.mobile_money} alt="Mobile Money" className="h-10" />
            )}
            {formData.paymentMethod === 'card' && (
              <div className="flex items-center gap-2">
              <PaymentLogo src={brandLogos.visa} alt="Visa" className="h-5" />
              <PaymentLogo src={brandLogos.mastercard} alt="Mastercard" className="h-5" />
              </div>
            )}
            {formData.paymentMethod === 'bank_transfer' && <BankLogo className="h-5 w-5 text-primary-600" />}
            <span className="font-semibold text-secondary-900 capitalize">{formData.paymentMethod.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="border-t border-secondary-200 pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Lock className="text-green-600" size={16} />
          <span>Secure Payment (SSL Encrypted)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Shield className="text-blue-600" size={16} />
          <span>Verified Merchant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Headphones className="text-primary-600" size={16} />
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
  );
};

/* -------------------- Payment Status Component -------------------- */
const PaymentStatus = ({ status, merchant, transactionId, formData, paymentError, navigate }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SSP', minimumFractionDigits: 2 }).format(
      amount
    );

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">Payment Successful!</h2>
            <p className="text-secondary-600">Your payment has been processed successfully.</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary-600">Merchant:</span>
              <span className="font-semibold text-secondary-900">
                {merchant?.business_name || `${merchant?.first_name} ${merchant?.last_name}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Amount:</span>
              <span className="font-semibold text-primary-600 text-lg">{formatCurrency(parseFloat(formData.amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Transaction ID:</span>
              <span className="font-mono text-sm text-secondary-900">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Payment Method:</span>
              <span className="font-semibold text-secondary-900 capitalize">{formData.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Date:</span>
              <span className="font-semibold text-secondary-900">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => alert('Receipt download feature coming soon!')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
            >
              <Download size={20} />
              Download Receipt
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Payment Failed</h2>
          <p className="text-secondary-600 mb-4">We couldn't process your payment.</p>
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-800 font-medium mb-1">Error Details:</p>
              <p className="text-sm text-red-700">{paymentError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/* -------------------- Exported Checkout Page -------------------- */
const PaymentCheckout = () => {
  const { linkCode } = useParams();
  const navigate = useNavigate();

  const [paymentLink, setPaymentLink] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    amount: '',
    paymentMethod: 'mobile_money',
  });

  const [cardData, setCardData] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
  const [mobileMoneyData, setMobileMoneyData] = useState({ phoneNumber: '', provider: 'mtn' });

  const { handlePayment, processing, paymentStatus, transactionId, paymentError } = usePayment(
    paymentLink,
    merchant,
    formData,
    cardData,
    mobileMoneyData
  );

  useEffect(() => {
    const loadPaymentLink = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: link, error: linkError } = await supabase
          .from('payment_links')
          .select('*, merchants(*)')
          .eq('link_code', linkCode)
          .eq('is_active', true)
          .single();

        if (linkError || !link) {
          setError('Payment link not found or has been deactivated.');
          return;
        }

        setPaymentLink(link);
        setMerchant(link.merchants);
        setFormData((prev) => ({ ...prev, amount: link.amount?.toString() || '' }));
      } catch (err) {
        setError('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentLink();
  }, [linkCode]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center justify-center gap-3" role="status" aria-live="polite">
          <Loader className="animate-spin h-5 w-5 text-primary-600" aria-hidden="true" />
          <span className="text-secondary-600 text-sm">Loading payment details...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Payment Link Error</h2>
          <p className="text-secondary-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );

  if (paymentStatus) return <PaymentStatus status={paymentStatus} merchant={merchant} transactionId={transactionId} formData={formData} paymentError={paymentError} navigate={navigate} />;

  /* -------------------- Render Payment Form -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors mb-4">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">Secure Payment</h1>
          <p className="text-secondary-600 mt-1">Complete your payment below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PaymentSummary merchant={merchant} paymentLink={paymentLink} formData={formData} mobileMoneyData={mobileMoneyData} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              {/* PaymentForm */}
              <PaymentForm
                formData={formData}
                setFormData={setFormData}
                cardData={cardData}
                setCardData={setCardData}
                mobileMoneyData={mobileMoneyData}
                setMobileMoneyData={setMobileMoneyData}
                handlePayment={handlePayment}
                processing={processing}
                merchant={merchant}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- PaymentForm Component -------------------- */
const PaymentForm = ({
  formData,
  setFormData,
  cardData,
  setCardData,
  mobileMoneyData,
  setMobileMoneyData,
  handlePayment,
  processing,
  merchant,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') setCardData((prev) => ({ ...prev, [name]: value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim() }));
    else if (name === 'expiryDate') setCardData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5) }));
    else if (name === 'cvv') setCardData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 4) }));
    else setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) return alert('Please enter your name.') || false;
    if (!formData.customerEmail.trim() && !formData.customerPhone.trim()) return alert('Please enter either email or phone number.') || false;
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) return alert('Please enter a valid email address.') || false;
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return alert('Please enter a valid amount.') || false;

    if (formData.paymentMethod === 'card') {
      if (!cardData.cardNumber.replace(/\s/g, '') || cardData.cardNumber.replace(/\s/g, '').length < 16)
        return alert('Please enter a valid card number.') || false;
      if (!cardData.expiryDate || cardData.expiryDate.length < 5) return alert('Please enter a valid expiry date (MM/YY).') || false;
      if (!cardData.cvv || cardData.cvv.length < 3) return alert('Please enter a valid CVV.') || false;
      if (!cardData.cardName.trim()) return alert('Please enter the name on the card.') || false;
    }

    if (formData.paymentMethod === 'mobile_money' && !mobileMoneyData.phoneNumber.trim())
      return alert('Please enter your mobile money phone number.') || false;

    return true;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    handlePayment();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Your Information</h3>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="John Doe" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Email Address</label>
            <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Phone Number</label>
            <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="+211 XXX XXX XXX" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Amount (SSP) <span className="text-red-500">*</span>
          </label>
          <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} step="0.01" min="0.01" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="0.00" required />
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-900">Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'mobile_money' }))} className={`p-4 border-2 rounded-xl transition-all ${formData.paymentMethod === 'mobile_money' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'}`}>
            <div className="flex items-center justify-center mb-2">
              <PaymentLogo src={brandLogos.mobile_money} alt="Mobile Money" className="h-10" />
            </div>
            <p className={`font-semibold ${formData.paymentMethod === 'mobile_money' ? 'text-primary-600' : 'text-secondary-700'}`}>MOBILE MONEY</p>
          </button>
          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'card' }))} className={`p-4 border-2 rounded-xl transition-all ${formData.paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'}`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <PaymentLogo src={brandLogos.visa} alt="Visa" className="h-6" />
              <PaymentLogo src={brandLogos.mastercard} alt="Mastercard" className="h-6" />
            </div>
            <p className={`font-semibold ${formData.paymentMethod === 'card' ? 'text-primary-600' : 'text-secondary-700'}`}>CARD PAYMENT</p>
          </button>
          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'bank_transfer' }))} className={`p-4 border-2 rounded-xl transition-all ${formData.paymentMethod === 'bank_transfer' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'}`}>
            <div className="flex items-center justify-center mb-2">
              <BankLogo className={`h-8 w-8 ${formData.paymentMethod === 'bank_transfer' ? 'text-primary-600' : 'text-secondary-400'}`} />
            </div>
            <p className={`font-semibold ${formData.paymentMethod === 'bank_transfer' ? 'text-primary-600' : 'text-secondary-700'}`}>BANK TRANSFER</p>
          </button>
        </div>

        {/* Conditional Forms */}
        {formData.paymentMethod === 'mobile_money' && (
          <div className="bg-primary-50 rounded-xl p-6 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Mobile Money Provider</label>
              <select value={mobileMoneyData.provider} onChange={(e) => setMobileMoneyData((prev) => ({ ...prev, provider: e.target.value }))} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                <option value="mtn">MTN Mobile Money</option>
                <option value="orange">Orange Money</option>
                <option value="zain">Zain Cash</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" value={mobileMoneyData.phoneNumber} onChange={(e) => setMobileMoneyData((prev) => ({ ...prev, phoneNumber: e.target.value }))} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="+211 XXX XXX XXX" required />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800"><strong>Instructions:</strong> You will receive a prompt on your phone to confirm the payment. Enter your PIN to complete the transaction.</p>
            </div>
          </div>
        )}

        {formData.paymentMethod === 'card' && (
          <div className="bg-primary-50 rounded-xl p-6 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Card Number <span className="text-red-500">*</span></label>
              <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleCardInputChange} maxLength="19" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="1234 5678 9012 3456" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Name on Card <span className="text-red-500">*</span></label>
              <input type="text" name="cardName" value={cardData.cardName} onChange={handleCardInputChange} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="JOHN DOE" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Expiry Date <span className="text-red-500">*</span></label>
                <input type="text" name="expiryDate" value={cardData.expiryDate} onChange={handleCardInputChange} maxLength="5" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="MM/YY" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">CVV <span className="text-red-500">*</span></label>
                <input type="text" name="cvv" value={cardData.cvv} onChange={handleCardInputChange} maxLength="4" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="123" required />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <Lock size={16} />
              <span>Your card details are encrypted and secure</span>
            </div>
          </div>
        )}

        {formData.paymentMethod === 'bank_transfer' && (
          <div className="bg-primary-50 rounded-xl p-6 space-y-4 animate-fade-in">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-secondary-900 mb-3">Bank Transfer Instructions</h4>
              <div className="space-y-2 text-sm text-secondary-700">
                <p><strong>Bank:</strong> {merchant?.bank_name || 'Equity Bank'}</p>
                <p><strong>Account Number:</strong> {merchant?.account_number || 'N/A'}</p>
                <p><strong>Account Name:</strong> {merchant?.account_name || merchant?.business_name || 'N/A'}</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800"><strong>Note:</strong> After making the transfer, contact the merchant with your transaction reference.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="submit" disabled={processing} className="w-full py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
        {processing ? (
          <>
            <Loader className="animate-spin" size={20} />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock size={20} />
            Pay Now
          </>
        )}
      </button>
    </form>
  );
};

export default PaymentCheckout;
