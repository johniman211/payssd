import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

const PaymentFailedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600">There was an issue processing your payment. Please try again.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;