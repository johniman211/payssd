import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import Card from '../../components/Card';
import Button from '../../components/Button';

const QuickAdminSetup = () => {
  const [email, setEmail] = useState('johnnyafrica211@gmail.com');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState([]);

  const createAdmin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setDetails([]);

    const logs = [];

    try {
      logs.push('🔍 Step 1: Requesting admin creation via secure function');
      const { data, error } = await supabase.functions.invoke('admin-setup', {
        body: { email }
      })
      if (error) {
        logs.push('❌ Function error: ' + error.message)
        throw new Error(error.message)
      }
      if (!data?.ok) {
        const msg = data?.error || 'unknown_error'
        logs.push('❌ Admin setup failed: ' + msg)
        throw new Error('Admin setup failed: ' + msg)
      }
      if (data.created === false) {
        logs.push('✅ Admin already exists')
        setDetails(logs)
        setStatus('success')
        setMessage('Admin account already exists! You can login now.')
        return
      }
      logs.push('✅ Admin created successfully!')
      logs.push(`   Admin ID: ${data.admin?.id || ''}`)
      logs.push(`   Name: ${data.admin?.name || ''}`)
      logs.push(`   Role: ${data.admin?.role || ''}`)

      setDetails(logs);
      setStatus('success');
      setMessage('Admin account created successfully! 🎉');

    } catch (error) {
      console.error('Error:', error);
      logs.push('❌ Error: ' + error.message);
      setDetails(logs);
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">🚀</span>
          </div>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Quick Admin Setup
          </h1>
          <p className="text-secondary-600">
            Create admin account from merchant email
          </p>
        </div>

        <form onSubmit={createAdmin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Merchant Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="merchant@email.com"
              required
            />
            <p className="text-xs text-secondary-500 mt-2">
              Enter the email address you use to login as a merchant
            </p>
          </div>

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold"
          >
            {status === 'loading' ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={20} />
                <span>Creating Admin Account...</span>
              </div>
            ) : (
              'Create Admin Account'
            )}
          </Button>
        </form>

        {/* Status Message */}
        {status === 'success' && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">{message}</h3>
                <p className="text-sm text-green-800">
                  You can now login at the admin login page with your merchant credentials.
                </p>
              </div>
            </div>
            <Button
              href="/admin/login"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Admin Login →
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Details Log */}
        {details.length > 0 && (
          <details className="mt-6 p-4 bg-secondary-50 rounded-xl">
            <summary className="cursor-pointer font-medium text-secondary-700 mb-2">
              View Details ({details.length} steps)
            </summary>
            <div className="mt-3 space-y-1 text-sm font-mono text-secondary-600">
              {details.map((detail, index) => (
                <div key={index} className="py-1">
                  {detail}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-secondary-200">
          <h3 className="font-semibold text-secondary-900 mb-3">How it works:</h3>
          <ol className="space-y-2 text-sm text-secondary-600">
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">1.</span>
              <span>Enter your merchant email address</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">2.</span>
              <span>Click "Create Admin Account"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">3.</span>
              <span>System finds your merchant account and creates admin access</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-purple-600">4.</span>
              <span>Login at /admin/login with the same credentials</span>
            </li>
          </ol>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2 text-sm">
          <p className="text-secondary-600">
            <a href="/admin/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Already have admin access? Login here
            </a>
          </p>
          <p className="text-secondary-600">
            <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Home
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default QuickAdminSetup;


