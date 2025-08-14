import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">PaySSD</span>
            </div>
          </div>
          
          {/* 404 Error */}
          <div className="mt-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
            <p className="mt-2 text-lg text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
          
          {/* Help Links */}
          <div className="mt-8 text-sm text-gray-500">
            <p>Need help? Contact our support team:</p>
            <div className="mt-2 space-x-4">
              <a
                href="mailto:support@payssd.com"
                className="text-blue-600 hover:text-blue-500"
              >
                support@payssd.com
              </a>
              <span>•</span>
              <Link
                to="/help"
                className="text-blue-600 hover:text-blue-500"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;