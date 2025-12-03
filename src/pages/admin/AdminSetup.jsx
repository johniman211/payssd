import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminSetup = () => {
  const [status, setStatus] = useState('checking'); // checking, ready, error, success
  const [steps, setSteps] = useState([
    { id: 1, name: 'Check merchant account', status: 'pending', message: '' },
    { id: 2, name: 'Check admin record', status: 'pending', message: '' },
    { id: 3, name: 'Create admin account', status: 'pending', message: '' },
    { id: 4, name: 'Verify setup', status: 'pending', message: '' },
  ]);
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkSetup();
  }, []);

  const updateStep = (stepId, status, message = '') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const checkSetup = async () => {
    try {
      setStatus('checking');
      setError('');

      // Step 1: Get current user
      updateStep(1, 'loading');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        updateStep(1, 'error', 'Not logged in');
        setStatus('error');
        setError('You need to be logged in as a merchant first. Please login at /login');
        return;
      }
      
      updateStep(1, 'success', `User: ${user.email}`);

      // Step 2: Check if merchant exists
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (merchantError || !merchant) {
        updateStep(2, 'error', 'No merchant account found');
        setStatus('error');
        setError('No merchant account found for this user');
        return;
      }

      updateStep(2, 'success', `Merchant: ${merchant.email}`);
      setAdminEmail(merchant.email);

      // Step 3: Check if admin already exists
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingAdmin) {
        updateStep(3, 'success', 'Admin already exists');
        updateStep(4, 'success', 'Setup complete!');
        setStatus('success');
        return;
      }

      if (adminCheckError && adminCheckError.code !== 'PGRST116') {
        updateStep(3, 'error', adminCheckError.message);
        setStatus('error');
        setError('Error checking admin status');
        return;
      }

      updateStep(3, 'ready', 'Ready to create admin');
      setStatus('ready');

    } catch (err) {
      console.error('Setup check error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const createAdmin = async () => {
    try {
      setStatus('creating');
      updateStep(3, 'loading', 'Creating admin account...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not logged in');
      }

      // Get merchant info
      const { data: merchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Create admin record
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert([{
          user_id: user.id,
          email: merchant.email,
          name: `${merchant.first_name || ''} ${merchant.last_name || ''}`.trim() || merchant.email,
          role: 'super_admin'
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      updateStep(3, 'success', 'Admin created!');
      updateStep(4, 'loading', 'Verifying...');

      // Verify it was created
      const { data: verifyAdmin } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (verifyAdmin) {
        updateStep(4, 'success', 'Admin verified!');
        setStatus('success');
      } else {
        throw new Error('Verification failed');
      }

    } catch (err) {
      console.error('Create admin error:', err);
      updateStep(3, 'error', err.message);
      setError(err.message);
      setStatus('error');
    }
  };

  const getStatusIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'success':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'error':
        return <XCircle className="text-red-600" size={24} />;
      case 'loading':
        return <Loader className="text-blue-600 animate-spin" size={24} />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">⚙️</span>
          </div>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Admin Account Setup
          </h1>
          <p className="text-secondary-600">
            Automatic setup wizard for admin access
          </p>
        </div>

        {/* Status Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">{step.name}</h3>
                {step.message && (
                  <p className="text-sm text-secondary-600 mt-1">{step.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {status === 'ready' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Ready to create admin account for:</strong> {adminEmail}
              </p>
            </div>
            <Button
              onClick={createAdmin}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold"
            >
              Create Admin Account
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Admin Account Created! 🎉
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Your admin account is ready. You can now login to the admin panel.
              </p>
              <p className="text-sm text-green-700 font-medium">
                Email: {adminEmail}
              </p>
            </div>
            <Button
              href="/admin/login"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              Go to Admin Login
              <ArrowRight size={20} />
            </Button>
          </div>
        )}

        {status === 'checking' && (
          <div className="text-center py-8">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-secondary-600">Checking your account...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Button
              onClick={checkSetup}
              variant="secondary"
              className="w-full"
            >
              Try Again
            </Button>
            <p className="text-center text-sm text-secondary-600">
              Need help? <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">Login first</a>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-secondary-200 text-center space-y-2">
          <p className="text-sm text-secondary-600">
            <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Home
            </a>
          </p>
          <p className="text-xs text-secondary-500">
            This wizard will automatically create an admin account for your logged-in merchant user
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminSetup;


