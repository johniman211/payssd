import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import Button from '../../components/Button';
import Card from '../../components/Card';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setLoading(true);

    try {
      console.log('🔐 Step 1: Attempting to sign in...');
      
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }

      console.log('✅ Step 2: Authentication successful!');
      console.log('👤 User ID:', authData.user.id);
      
      setDebugInfo(`Authenticated as: ${authData.user.email}`);

      // Step 2: Check if user is an admin
      console.log('🔍 Step 3: Checking admin table...');
      
      const { data: adminProfile, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      console.log('Admin query result:', { adminProfile, adminError });

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('❌ Error checking admin:', adminError);
        throw new Error('Error checking admin status: ' + adminError.message);
      }

      if (!adminProfile) {
        console.error('❌ Not an admin');
        // Not an admin - sign out and show error
        await supabase.auth.signOut();
        setError(`Access denied. This account is not authorized as an admin. User ID: ${authData.user.id}`);
        setDebugInfo(`No admin record found for user_id: ${authData.user.id}`);
        setLoading(false);
        return;
      }

      console.log('✅ Step 4: Admin verified!');
      console.log('👑 Admin profile:', adminProfile);

      // Step 3: Admin verified - redirect to admin dashboard
      setDebugInfo('Admin verified! Redirecting...');
      
      // Small delay to ensure state updates
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 500);
      
    } catch (error) {
      console.error('❌ Admin login error:', error);
      setError(error.message || 'Invalid admin credentials');
      setDebugInfo(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">🔐</span>
          </div>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Admin Login
          </h1>
          <p className="text-secondary-600">
            Payssd Administration Panel
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium mb-1">{error}</p>
                {debugInfo && (
                  <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
                    Debug: {debugInfo}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Debug Info */}
        {debugInfo && !error && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">{debugInfo}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="admin@payssd.com"
                required
                autoFocus
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
                className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              'Sign In as Admin'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-secondary-200">
          <div className="text-center space-y-3">
            <p className="text-sm text-secondary-600">
              Not an admin?{' '}
              <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Merchant Login
              </a>
            </p>
            <p className="text-sm text-secondary-600">
              <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
                ← Back to Home
              </a>
            </p>
            {/* Removed admin self-provision link for security */}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Lock className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-purple-800">
              This is a secure admin area. Only authorized personnel with admin credentials can access this panel.
            </p>
          </div>
        </div>

        {/* Debug helper removed */}
      </Card>
    </div>
  );
};

export default AdminLogin;
