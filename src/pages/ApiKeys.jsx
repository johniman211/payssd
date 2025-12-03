import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Key, Lock, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const ApiKeys = () => {
  const { profile } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState({});

  useEffect(() => {
    if (profile?.id) {
      loadApiKeys();
    }
  }, [profile]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_type, public_key, secret_key, total_requests, last_used_at')
        .eq('merchant_id', profile.id);

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (keyId) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.substring(0, 12) + '•'.repeat(20) + key.substring(key.length - 4);
  };

  const sandboxKeys = apiKeys.filter(k => k.key_type === 'sandbox');
  const liveKeys = apiKeys.filter(k => k.key_type === 'live');
  const isVerified = profile?.verification_status === 'approved';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">API Keys</h1>
          <p className="text-secondary-600">Manage your API keys for integration</p>
        </div>

        {/* Verification Alert */}
        {!isVerified && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <Lock className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Live API Keys Locked</h3>
                <p className="text-sm text-yellow-800">
                  Complete merchant verification to unlock live API keys. Sandbox keys are available for testing.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Sandbox Keys */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Key className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">Sandbox API Keys</h2>
                <p className="text-sm text-secondary-600">For testing and development</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              Test Mode
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : sandboxKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-500 mb-4">No sandbox keys found</p>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await supabase.rpc('generate_api_keys', { p_merchant_id: profile.id, p_key_type: 'sandbox' });
                  } catch (e) {
                    console.error('Error generating sandbox key:', e);
                    alert('Failed to generate sandbox key.');
                  } finally {
                    await loadApiKeys();
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw size={16} /> Generate Sandbox Key
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sandboxKeys.map((key) => (
                <div key={key.id} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Public Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={key.public_key}
                        readOnly
                        className="flex-1 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(key.public_key)}
                        className="p-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Secret Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={visibleKeys[key.id] ? key.secret_key : maskKey(key.secret_key)}
                        readOnly
                        className="flex-1 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl font-mono text-sm"
                      />
                      <button
                        onClick={() => toggleVisibility(key.id)}
                        className="p-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                      >
                        {visibleKeys[key.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.secret_key)}
                        className="p-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-secondary-600 pt-2 border-t border-secondary-200">
                    <span>Total Requests: {key.total_requests || 0}</span>
                    <span>Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Live Keys */}
        <Card className={!isVerified ? 'opacity-60' : ''}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <Key className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 flex items-center gap-2">
                  Live API Keys
                  {!isVerified && <Lock size={20} className="text-secondary-400" />}
                </h2>
                <p className="text-sm text-secondary-600">
                  {isVerified ? 'For production transactions' : 'Available after verification'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
              Production
            </span>
          </div>

          {!isVerified ? (
            <div className="text-center py-12">
              <Lock className="mx-auto h-16 w-16 text-secondary-300 mb-4" />
              <p className="text-secondary-600 mb-4">Complete verification to unlock live API keys</p>
              <button
                onClick={() => window.location.href = '/verification'}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Go to Verification
              </button>
            </div>
          ) : liveKeys.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              Live keys will be generated after approval
            </div>
          ) : (
            <div className="space-y-6">
              {liveKeys.map((key) => (
                <div key={key.id} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Public Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={key.public_key}
                        readOnly
                        className="flex-1 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(key.public_key)}
                        className="p-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Secret Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={visibleKeys[key.id] ? key.secret_key : maskKey(key.secret_key)}
                        readOnly
                        className="flex-1 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl font-mono text-sm"
                      />
                      <button
                        onClick={() => toggleVisibility(key.id)}
                        className="p-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                      >
                        {visibleKeys[key.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.secret_key)}
                        className="p-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* API Documentation */}
        <Card className="bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl">
              <Key className="text-primary-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Ready to integrate?
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Use these API keys to integrate Payssd into your application. Check our documentation for implementation details.
              </p>
              <a href="/api-docs" className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                View API Documentation
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ApiKeys;


