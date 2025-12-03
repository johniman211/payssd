import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, User, Shield } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import Card from '../../components/Card';
import Button from '../../components/Button';

const DatabaseCheck = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      setError('');

      // Check current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Get all merchants
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (merchantsError && merchantsError.code !== 'PGRST116') {
        throw merchantsError;
      }
      setMerchants(merchantsData || []);

      // Get all admins
      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminsError && adminsError.code !== 'PGRST116') {
        throw adminsError;
      }
      setAdmins(adminsData || []);

    } catch (err) {
      console.error('Database check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMerchantFromAuth = async () => {
    try {
      if (!currentUser) {
        alert('Not logged in!');
        return;
      }

      const { data, error } = await supabase
        .from('merchants')
        .insert([{
          user_id: currentUser.id,
          email: currentUser.email,
          account_type: 'personal',
          first_name: currentUser.email.split('@')[0],
          last_name: 'User',
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Merchant created! Refresh page.');
      checkDatabase();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const createAdminFromMerchant = async (merchant) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .insert([{
          user_id: merchant.user_id,
          email: merchant.email,
          name: `${merchant.first_name} ${merchant.last_name}`.trim(),
          role: 'super_admin'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Admin created! ✅');
      checkDatabase();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl text-center py-12">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-secondary-600">Checking database...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                🔍 Database Diagnostic Tool
              </h1>
              <p className="text-secondary-600">Check what's in your database</p>
            </div>
            <Button onClick={checkDatabase} variant="secondary">
              <RefreshCw size={20} className="mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Current User */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <User className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-secondary-900">Current Logged-In User</h2>
          </div>
          {currentUser ? (
            <div className="bg-secondary-50 p-4 rounded-xl font-mono text-sm">
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>User ID:</strong> {currentUser.id}</p>
              <p><strong>Created:</strong> {new Date(currentUser.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-yellow-800">❌ Not logged in</p>
              <a href="/login" className="text-blue-600 underline">Login here</a>
            </div>
          )}
        </Card>

        {/* Merchants */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-secondary-900">
                Merchants Table ({merchants.length})
              </h2>
            </div>
            {currentUser && merchants.length === 0 && (
              <Button onClick={createMerchantFromAuth} className="bg-green-600 hover:bg-green-700">
                Create Merchant
              </Button>
            )}
          </div>
          
          {merchants.length === 0 ? (
            <div className="bg-yellow-50 p-6 rounded-xl text-center">
              <p className="text-yellow-900 font-semibold mb-2">❌ No merchants found!</p>
              <p className="text-yellow-800 text-sm mb-4">
                This is the problem! You need a merchant record first.
              </p>
              {currentUser && (
                <Button onClick={createMerchantFromAuth} className="bg-green-600 hover:bg-green-700">
                  ✅ Create Merchant Now
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {merchants.map((merchant) => (
                <div key={merchant.id} className="bg-secondary-50 p-4 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-900">
                        {merchant.first_name} {merchant.last_name}
                      </p>
                      <p className="text-sm text-secondary-600">{merchant.email}</p>
                      <p className="text-xs text-secondary-500 font-mono mt-1">
                        User ID: {merchant.user_id}
                      </p>
                    </div>
                    <Button
                      onClick={() => createAdminFromMerchant(merchant)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Make Admin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Admins */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-secondary-900">
              Admins Table ({admins.length})
            </h2>
          </div>
          
          {admins.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-700">No admins yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="bg-purple-50 p-4 rounded-xl">
                  <p className="font-semibold text-secondary-900">{admin.name}</p>
                  <p className="text-sm text-secondary-600">{admin.email}</p>
                  <p className="text-xs text-secondary-500 font-mono mt-1">
                    User ID: {admin.user_id}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                    {admin.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">📋 What to do:</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><strong>1.</strong> If you see "Not logged in" → <a href="/login" className="underline">Login here</a></li>
            <li><strong>2.</strong> If "Merchants Table (0)" → Click "Create Merchant" button</li>
            <li><strong>3.</strong> Once merchant exists → Click "Make Admin" button next to your merchant</li>
            <li><strong>4.</strong> Go to <a href="/admin/login" className="underline">Admin Login</a> and login!</li>
          </ol>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-white/80 text-sm">
            <a href="/" className="underline">← Back to Home</a>
            {' | '}
            <a href="/login" className="underline">Merchant Login</a>
            {' | '}
            <a href="/admin/login" className="underline">Admin Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseCheck;


