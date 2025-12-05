import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User, Building, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase/supabaseClient';
import Button from '../components/Button';
import Card from '../components/Card';
import logoSvg from '@/assets/logo-ssd.svg';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('account-type'); // account-type, signup, verify
  const [accountType, setAccountType] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setStep('signup');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      let invokeOk = false;
      try {
        const { data, error } = await supabase.functions.invoke('signup', {
          body: {
            email: formData.email,
            password: formData.password,
            business: {
              business_type: accountType === 'business' ? 'business' : 'personal',
              contact_name: `${formData.firstName} ${formData.lastName}`,
              contact_phone: formData.phone
            }
          }
        })
        invokeOk = !!data?.ok && !error
      } catch (fnErr) {
        console.warn('Signup function returned non-2xx, continuing if auth works:', fnErr)
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password })
      if (signInError) throw signInError

      setStep('verify');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  // Account Type Selection
  if (step === 'account-type') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <a href="/" className="inline-flex items-center gap-2 mb-6 justify-center">
              <img src={logoSvg} alt="PaySSD" className="h-6 w-6 rounded-lg" />
              <span className="text-2xl font-bold text-secondary-900">PaySSD</span>
            </a>
            <h1 className="text-4xl font-bold text-secondary-900 mb-3">
              Choose Your Account Type
            </h1>
            <p className="text-lg text-secondary-600">
              Select the account type that best fits your needs
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Personal Account */}
            <Card 
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary-500 group"
              onClick={() => handleAccountTypeSelect('personal')}
            >
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <User className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                  Personal Account
                </h3>
                <p className="text-secondary-600 mb-6">
                  Perfect for freelancers and individuals
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Quick setup with personal info</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Bank or mobile money withdrawals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Sandbox API for testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Live API after verification</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Select Personal
                </Button>
              </div>
            </Card>

            {/* Business Account */}
            <Card 
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary-500 group"
              onClick={() => handleAccountTypeSelect('business')}
            >
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <Building className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                  Business Account
                </h3>
                <p className="text-secondary-600 mb-6">
                  Ideal for companies and organizations
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Complete business profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Business verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Full dashboard features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-sm text-secondary-700">Advanced analytics</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                  Select Business
                </Button>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-secondary-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Signup Form
  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2 mb-6 justify-center">
              <img src={logoSvg} alt="PaySSD" className="h-6 w-6 rounded-lg" />
              <span className="text-xl font-bold text-secondary-900">PaySSD</span>
            </a>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
              {accountType === 'personal' ? (
                <>
                  <User size={16} className="text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Personal Account</span>
                </>
              ) : (
                <>
                  <Building size={16} className="text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Business Account</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-secondary-600">Get started in minutes</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+211 XXX XXX XXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-secondary-700">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 py-3"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-secondary-200 text-center space-y-2">
            <button
              onClick={() => setStep('account-type')}
              className="text-sm text-secondary-600 hover:text-secondary-900"
            >
              ← Change Account Type
            </button>
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Email Verification
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6">
            <Mail className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Check Your Email
          </h1>
          <p className="text-secondary-600 mb-8">
            We've sent a verification link to <strong>{formData.email}</strong>. 
            Please check your inbox and click the link to verify your account.
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/onboarding')}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700"
            >
              Continue to Onboarding
            </Button>
            <Button
              href="/login"
              variant="secondary"
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
          <p className="text-xs text-secondary-500 mt-6">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </Card>
      </div>
    );
  }
};

export default Signup;
