import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import { Mail, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import RealtimeStatus from './RealtimeStatus';

const EnhancedEmailVerification = () => {
  const { user, resendVerificationEmail } = useAuth();
  const { refreshUserData } = useRealtime();
  const [isResending, setIsResending] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Listen for email verification events
  useEffect(() => {
    const handleEmailVerified = (event) => {
      toast.success('🎉 Email verified! Welcome to PaySSD!');
    };

    window.addEventListener('emailVerified', handleEmailVerified);
    return () => window.removeEventListener('emailVerified', handleEmailVerified);
  }, []);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      await resendVerificationEmail();
      setLastSent(new Date());
      setCountdown(60); // 60 second cooldown
      toast.success('📧 Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleManualRefresh = async () => {
    await refreshUserData();
    toast.success('Account status refreshed!');
  };

  if (!user || user.isEmailVerified) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      {/* Real-time Status Indicator */}
      <RealtimeStatus />
      
      {/* Main Verification Content */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verify Your Email Address
          </h3>
          
          <p className="text-gray-700 mb-4">
            We've sent a verification link to <strong>{user.email}</strong>. 
            Click the link in your email to activate your account and access all features.
          </p>
          
          <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900">Real-time Verification</span>
            </div>
            <p className="text-sm text-gray-600">
              Once you click the verification link, your account will be automatically 
              activated across all your devices and browser tabs - no need to refresh!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend in {countdown}s
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </button>
            
            <button
              onClick={handleManualRefresh}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </button>
          </div>
          
          {lastSent && (
            <p className="text-xs text-gray-500 mt-3">
              Last sent: {lastSent.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Troubleshooting Section */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <details className="group">
          <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            <AlertCircle className="w-4 h-4 mr-2" />
            Didn't receive the email?
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <p>• Check your spam/junk folder</p>
            <p>• Make sure {user.email} is correct</p>
            <p>• Try adding noreply@payssd.com to your contacts</p>
            <p>• Wait a few minutes and check again</p>
            <p>• If you verified on another device, this page will update automatically</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default EnhancedEmailVerification;