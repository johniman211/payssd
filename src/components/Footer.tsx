import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="text-lg font-bold text-gray-900 mb-2">PaySSD</div>
            <p className="text-sm text-gray-600">Simple, transparent payments for South Sudan.</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Product</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/pricing" className="text-gray-700 hover:text-gray-900">Pricing</Link></li>
              <li><Link to="/reports" className="text-gray-700 hover:text-gray-900">Reports</Link></li>
              <li><Link to="/contact" className="text-gray-700 hover:text-gray-900">Contact</Link></li>
              <li><Link to="/compliance" className="text-gray-700 hover:text-gray-900">Compliance</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Company</div>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@payssd.com" className="text-gray-700 hover:text-gray-900">Support</a></li>
              <li><Link to="/login" className="text-gray-700 hover:text-gray-900">Sign in</Link></li>
              <li><Link to="/register" className="text-gray-700 hover:text-gray-900">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500">© {new Date().getFullYear()} PaySSD. All rights reserved.</div>
      </div>
    </footer>
  );
};

