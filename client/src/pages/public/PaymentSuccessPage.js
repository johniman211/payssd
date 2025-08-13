import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your payment has been processed successfully.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;