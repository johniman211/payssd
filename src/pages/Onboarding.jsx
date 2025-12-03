import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Building, CreditCard, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import Button from '../components/Button';
import Card from '../components/Card';

const Onboarding = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Business Info (for business accounts)
    businessName: '',
    businessRegistrationNumber: '',
    businessAddress: '',
    businessType: '',
    
    // Bank/Mobile Money
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileMoneyProvider: '',
    mobileMoneyNumber: '',
    
    // Terms
    termsAccepted: false,
    privacyAccepted: false,
  });

  const isBusinessAccount = profile?.account_type === 'business';

  // Steps for Personal Account
  const personalSteps = [
    { id: 1, title: 'Bank/Mobile Money', icon: CreditCard, description: 'Payment details' },
    { id: 2, title: 'Terms & Agreements', icon: FileText, description: 'Final step' },
  ];

  // Steps for Business Account
  const businessSteps = [
    { id: 1, title: 'Business Information', icon: Building, description: 'Company details' },
    { id: 2, title: 'Bank/Mobile Money', icon: CreditCard, description: 'Payment details' },
    { id: 3, title: 'Terms & Agreements', icon: FileText, description: 'Final step' },
  ];

  const steps = isBusinessAccount ? businessSteps : personalSteps;
  const totalSteps = steps.length;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const onboardingPayload = {
        business_type: formData.businessType || null,
        address: formData.businessAddress || null,
        description: null,
        industry: null,
        contact_name: formData.accountName || null,
        contact_phone: formData.mobileMoneyNumber || null
      };

      const { data, error } = await supabase.functions.invoke('onboarding', {
        body: { merchant_id: profile.id, onboarding: onboardingPayload }
      });
      if (error || !data?.ok) throw new Error(error?.message || 'Onboarding failed');

      if (data?.test_public_key && data?.test_secret_key_once) {
        alert(`Your Test API Keys\nPublic: ${data.test_public_key}\nSecret (shown once): ${data.test_secret_key_once}`);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error completing onboarding');
    } finally {
      setLoading(false);
    }
  };

  // Business Information Step
  const renderBusinessInfo = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Business Information</h2>
        <p className="text-secondary-600">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Your Business Ltd"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Business Type *
          </label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select business type</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="partnership">Partnership</option>
            <option value="llc">Limited Liability Company (LLC)</option>
            <option value="corporation">Corporation</option>
            <option value="ngo">NGO/Non-Profit</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Business Registration Number
          </label>
          <input
            type="text"
            value={formData.businessRegistrationNumber}
            onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
            className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="REG123456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Business Address *
          </label>
          <textarea
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Street address, city, country"
            rows="3"
            required
          />
        </div>
      </div>
    </div>
  );

  // Bank/Mobile Money Step
  const renderBankInfo = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Payment Details</h2>
        <p className="text-secondary-600">How would you like to receive payments?</p>
      </div>

      <div className="space-y-6">
        {/* Bank Details */}
        <div className="p-6 bg-secondary-50 rounded-xl">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Bank Account (Optional)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Bank Name
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select bank</option>
                <option value="Equity Bank">Equity Bank</option>
                <option value="KCB Bank">KCB Bank</option>
                <option value="Cooperative Bank">Cooperative Bank</option>
                <option value="Commercial Bank">Commercial Bank</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Account holder name"
              />
            </div>
          </div>
        </div>

        {/* Mobile Money */}
        <div className="p-6 bg-secondary-50 rounded-xl">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            📱 Mobile Money (Optional)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Provider
              </label>
              <select
                value={formData.mobileMoneyProvider}
                onChange={(e) => setFormData({ ...formData, mobileMoneyProvider: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select provider</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="Airtel">Airtel Money</option>
                <option value="Mpesa">M-Pesa</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobileMoneyNumber}
                onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+211 XXX XXX XXX"
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-secondary-600 bg-blue-50 p-4 rounded-xl">
          💡 You can add or update payment details later in your account settings
        </p>
      </div>
    </div>
  );

  // Terms & Agreements Step
  const renderTerms = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Terms & Agreements</h2>
        <p className="text-secondary-600">Review and accept our terms</p>
      </div>

      <div className="space-y-4">
        <div className="p-6 bg-secondary-50 rounded-xl max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-secondary-900 mb-3">Merchant Agreement</h3>
          <div className="text-sm text-secondary-700 space-y-2">
            <p>By using Payssd services, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Comply with all applicable laws and regulations</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Accept our platform fees and payment terms</li>
              <li>Not engage in fraudulent or prohibited activities</li>
              <li>Allow us to verify your identity and business</li>
            </ul>
            <p className="mt-4">
              <strong>Fees:</strong> Payssd charges a 2.5% platform fee on successful transactions.
            </p>
            <p>
              <strong>Payouts:</strong> Withdrawals are processed within 1-3 business days after approval.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 border border-secondary-200 rounded-xl">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="mt-1"
              required
            />
            <label htmlFor="terms" className="text-sm text-secondary-700">
              I have read and agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Merchant Agreement
              </a>
            </label>
          </div>

          <div className="flex items-start gap-3 p-4 border border-secondary-200 rounded-xl">
            <input
              type="checkbox"
              id="privacy"
              checked={formData.privacyAccepted}
              onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
              className="mt-1"
              required
            />
            <label htmlFor="privacy" className="text-sm text-secondary-700">
              I acknowledge that I have read and understand the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (isBusinessAccount) {
      switch (currentStep) {
        case 1: return renderBusinessInfo();
        case 2: return renderBankInfo();
        case 3: return renderTerms();
        default: return null;
      }
    } else {
      switch (currentStep) {
        case 1: return renderBankInfo();
        case 2: return renderTerms();
        default: return null;
      }
    }
  };

  const canProceed = () => {
    if (currentStep === totalSteps) {
      return formData.termsAccepted && formData.privacyAccepted;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">Payssd</span>
          </a>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-secondary-600">
            {isBusinessAccount ? 'Business' : 'Personal'} Account Setup
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep > step.id ? 'bg-green-500' :
                    currentStep === step.id ? 'bg-primary-600' :
                    'bg-secondary-200'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="text-white" size={24} />
                    ) : (
                      <step.icon className={currentStep === step.id ? 'text-white' : 'text-secondary-500'} size={24} />
                    )}
                  </div>
                  <p className={`text-xs font-medium text-center ${
                    currentStep >= step.id ? 'text-secondary-900' : 'text-secondary-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-secondary-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-2xl">
          <div className="min-h-96">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-secondary-200">
            <Button
              onClick={handleBack}
              variant="secondary"
              disabled={currentStep === 1}
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>

            <div className="text-sm text-secondary-600">
              Step {currentStep} of {totalSteps}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="bg-gradient-to-r from-primary-600 to-primary-700"
            >
              {loading ? 'Saving...' : currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              {currentStep < totalSteps && <ArrowRight size={20} className="ml-2" />}
            </Button>
          </div>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-secondary-600 hover:text-secondary-900"
          >
            Skip for now, complete later →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;


