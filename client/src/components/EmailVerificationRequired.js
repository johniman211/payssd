import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import EnhancedEmailVerification from './EnhancedEmailVerification';

const EmailVerificationRequired = () => {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link to="/" className="inline-flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">PaySSD</span>
          </Link>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verification Required</h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to verify your email address to access this feature.
            </p>
            
            <div className="mt-6">
              <EnhancedEmailVerification />
            </div>
            
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;