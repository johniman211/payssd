import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationBanner = () => {
  const { user, resendVerificationEmail, isEmailVerified } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);

  // Don't show banner if email is verified or user is not logged in
  if (!user || isEmailVerified() || !isVisible) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    await resendVerificationEmail();
    setIsResending(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-700">
              <strong>Email verification required:</strong> Please verify your email address to access all features.
              Some functionalities may be limited until verification is complete.
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-1 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </button>
              <span className="text-yellow-600">•</span>
              <span className="text-sm text-yellow-600">
                Sent to: {user.email}
              </span>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleDismiss}
                className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerificationBanner;