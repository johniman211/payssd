import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { User, Lock, Bell, Webhook, Save, CheckCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password settings
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    merchantSignups: true,
    transactionAlerts: true,
    payoutRequests: true,
    systemAlerts: true,
  });

  // Webhook settings
  const [webhookSettings, setWebhookSettings] = useState({
    webhookUrl: '',
    webhookSecret: '',
    enabled: false,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoApproveVerification: false,
    minWithdrawalAmount: 100,
    maxWithdrawalAmount: 100000,
    transactionFeePercentage: 2.5,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setProfile({
          name: user.user_metadata?.name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        });
      }

      // Load other settings from database or localStorage
      const savedNotifications = localStorage.getItem('adminNotificationSettings');
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }

      const savedWebhooks = localStorage.getItem('adminWebhookSettings');
      if (savedWebhooks) {
        setWebhookSettings(JSON.parse(savedWebhooks));
      }

      const savedSystem = localStorage.getItem('adminSystemSettings');
      if (savedSystem) {
        setSystemSettings(JSON.parse(savedSystem));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
        }
      });

      if (error) throw error;

      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwords.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showSuccess('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('adminNotificationSettings', JSON.stringify(notificationSettings));
    showSuccess('Notification settings saved!');
  };

  const handleWebhookUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('adminWebhookSettings', JSON.stringify(webhookSettings));
    showSuccess('Webhook settings saved!');
  };

  const handleSystemUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('adminSystemSettings', JSON.stringify(systemSettings));
    showSuccess('System settings saved!');
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook },
    { id: 'system', name: 'System', icon: Save },
  ];

  return (
    <AdminLayout activePage="settings">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your admin account and system preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="+211 XXX XXX XXX"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <Lock size={18} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleNotificationUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>

                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                      <label className="text-white font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        type="button"
                        onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !value })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save size={18} />
                  Save Preferences
                </button>
              </form>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
              <form onSubmit={handleWebhookUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Webhook Configuration</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={webhookSettings.webhookUrl}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, webhookUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="https://your-server.com/webhook"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Webhook Secret</label>
                  <input
                    type="text"
                    value={webhookSettings.webhookSecret}
                    onChange={(e) => setWebhookSettings({ ...webhookSettings, webhookSecret: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    placeholder="Your webhook secret key"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <label className="text-white font-medium">Enable Webhooks</label>
                  <button
                    type="button"
                    onClick={() => setWebhookSettings({ ...webhookSettings, enabled: !webhookSettings.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      webhookSettings.enabled ? 'bg-primary-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        webhookSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save size={18} />
                  Save Webhook Settings
                </button>
              </form>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <form onSubmit={handleSystemUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">System Configuration</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div>
                      <label className="text-white font-medium">Maintenance Mode</label>
                      <p className="text-sm text-gray-400">Temporarily disable the system</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                    <div>
                      <label className="text-white font-medium">Auto-Approve Verification</label>
                      <p className="text-sm text-gray-400">Automatically verify new merchants</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSystemSettings({ ...systemSettings, autoApproveVerification: !systemSettings.autoApproveVerification })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.autoApproveVerification ? 'bg-primary-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.autoApproveVerification ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Min Withdrawal Amount (SSP)</label>
                  <input
                    type="number"
                    value={systemSettings.minWithdrawalAmount}
                    onChange={(e) => setSystemSettings({ ...systemSettings, minWithdrawalAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Max Withdrawal Amount (SSP)</label>
                  <input
                    type="number"
                    value={systemSettings.maxWithdrawalAmount}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxWithdrawalAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Transaction Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={systemSettings.transactionFeePercentage}
                    onChange={(e) => setSystemSettings({ ...systemSettings, transactionFeePercentage: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save size={18} />
                  Save System Settings
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminSettings;

