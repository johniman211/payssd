import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      paymentReceived: true,
      paymentFailed: true,
      weeklyReports: true,
      monthlyReports: true,
      securityAlerts: true,
      marketingEmails: false
    },
    preferences: {
      language: 'en',
      timezone: 'Africa/Juba',
      currency: 'SSP',
      theme: 'system',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'en-SS'
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
      allowMultipleSessions: false
    },
    business: {
      autoAcceptPayments: true,
      paymentTimeout: 15,
      defaultPaymentMethods: ['mtn_momo', 'digicash'],
      webhookUrl: '',
      returnUrl: '',
      cancelUrl: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/settings');
      setSettings(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Use default settings if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section, data) => {
    try {
      setSaving(true);
      await axios.put('/api/user/settings', {
        section,
        settings: data
      });
      toast.success('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    const newNotifications = {
      ...settings.notifications,
      [key]: value
    };
    setSettings(prev => ({
      ...prev,
      notifications: newNotifications
    }));
    saveSettings('notifications', newNotifications);
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = {
      ...settings.preferences,
      [key]: value
    };
    setSettings(prev => ({
      ...prev,
      preferences: newPreferences
    }));
    saveSettings('preferences', newPreferences);
  };

  const handleSecurityChange = (key, value) => {
    const newSecurity = {
      ...settings.security,
      [key]: value
    };
    setSettings(prev => ({
      ...prev,
      security: newSecurity
    }));
    saveSettings('security', newSecurity);
  };

  const handleBusinessChange = (key, value) => {
    const newBusiness = {
      ...settings.business,
      [key]: value
    };
    setSettings(prev => ({
      ...prev,
      business: newBusiness
    }));
    saveSettings('business', newBusiness);
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        enabled ? 'bg-primary-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'business', name: 'Business', icon: CreditCardIcon }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your PaySSD experience and manage your preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Email Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
              <p className="text-sm text-gray-500">Manage your email notification preferences</p>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.emailNotifications}
                  onChange={(value) => handleNotificationChange('emailNotifications', value)}
                  disabled={saving}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Payment Received</h3>
                  <p className="text-sm text-gray-500">Get notified when you receive a payment</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.paymentReceived}
                  onChange={(value) => handleNotificationChange('paymentReceived', value)}
                  disabled={saving || !settings.notifications.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Payment Failed</h3>
                  <p className="text-sm text-gray-500">Get notified when a payment fails</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.paymentFailed}
                  onChange={(value) => handleNotificationChange('paymentFailed', value)}
                  disabled={saving || !settings.notifications.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                  <p className="text-sm text-gray-500">Receive weekly transaction summaries</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.weeklyReports}
                  onChange={(value) => handleNotificationChange('weeklyReports', value)}
                  disabled={saving || !settings.notifications.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Monthly Reports</h3>
                  <p className="text-sm text-gray-500">Receive monthly business insights</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.monthlyReports}
                  onChange={(value) => handleNotificationChange('monthlyReports', value)}
                  disabled={saving || !settings.notifications.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Security Alerts</h3>
                  <p className="text-sm text-gray-500">Important security notifications</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.securityAlerts}
                  onChange={(value) => handleNotificationChange('securityAlerts', value)}
                  disabled={saving || !settings.notifications.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                  <p className="text-sm text-gray-500">Product updates and promotional content</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.marketingEmails}
                  onChange={(value) => handleNotificationChange('marketingEmails', value)}
                  disabled={saving || !settings.notifications.emailNotifications}
                />
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
              <p className="text-sm text-gray-500">Manage your SMS notification preferences</p>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.smsNotifications}
                  onChange={(value) => handleNotificationChange('smsNotifications', value)}
                  disabled={saving}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <BellIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      SMS notifications are sent for critical events only
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        To keep costs low, SMS notifications are only sent for payment confirmations and security alerts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Language & Region */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
              <p className="text-sm text-gray-500">Customize your language and regional settings</p>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Language</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="form-select pl-10"
                      disabled={saving}
                    >
                      <option value="en">English</option>
                      <option value="ar" disabled>Juba Arabic (Coming Soon)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Timezone</label>
                  <select
                    value={settings.preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    className="form-select"
                    disabled={saving}
                  >
                    <option value="Africa/Juba">Africa/Juba (CAT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Currency</label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="form-select"
                    disabled={saving}
                  >
                    <option value="SSP">South Sudanese Pound (SSP)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Date Format</label>
                  <select
                    value={settings.preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    className="form-select"
                    disabled={saving}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <p className="text-sm text-gray-500">Customize the look and feel of your dashboard</p>
            </div>
            <div className="card-body">
              <div>
                <label className="form-label">Theme</label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: SunIcon },
                    { value: 'dark', label: 'Dark', icon: MoonIcon },
                    { value: 'system', label: 'System', icon: ComputerDesktopIcon }
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => handlePreferenceChange('theme', theme.value)}
                        disabled={saving}
                        className={`relative flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          settings.preferences.theme === theme.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">{theme.label}</span>
                        {settings.preferences.theme === theme.value && (
                          <CheckIcon className="absolute top-2 right-2 h-4 w-4 text-primary-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Note: Dark theme is coming soon. System theme will follow your device settings.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Authentication */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
              <p className="text-sm text-gray-500">Manage your account security settings</p>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-warning">Coming Soon</span>
                  <ToggleSwitch
                    enabled={settings.security.twoFactorAuth}
                    onChange={(value) => handleSecurityChange('twoFactorAuth', value)}
                    disabled={true}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Login Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <ToggleSwitch
                  enabled={settings.security.loginNotifications}
                  onChange={(value) => handleSecurityChange('loginNotifications', value)}
                  disabled={saving}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Allow Multiple Sessions</h3>
                  <p className="text-sm text-gray-500">Allow logging in from multiple devices simultaneously</p>
                </div>
                <ToggleSwitch
                  enabled={settings.security.allowMultipleSessions}
                  onChange={(value) => handleSecurityChange('allowMultipleSessions', value)}
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="form-label">Session Timeout (minutes)</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                  className="form-select"
                  disabled={saving}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
                <p className="form-help">
                  Automatically log out after this period of inactivity
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Business Tab */}
      {activeTab === 'business' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Payment Settings */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>
              <p className="text-sm text-gray-500">Configure your payment processing preferences</p>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Auto-Accept Payments</h3>
                  <p className="text-sm text-gray-500">Automatically accept successful payments</p>
                </div>
                <ToggleSwitch
                  enabled={settings.business.autoAcceptPayments}
                  onChange={(value) => handleBusinessChange('autoAcceptPayments', value)}
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="form-label">Payment Timeout (minutes)</label>
                <select
                  value={settings.business.paymentTimeout}
                  onChange={(e) => handleBusinessChange('paymentTimeout', parseInt(e.target.value))}
                  className="form-select"
                  disabled={saving}
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
                <p className="form-help">
                  How long customers have to complete their payment
                </p>
              </div>
              
              <div>
                <label className="form-label">Default Payment Methods</label>
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'mtn_momo', label: 'MTN Mobile Money' },
                    { value: 'digicash', label: 'Digicash' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.business.defaultPaymentMethods.includes(method.value)}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...settings.business.defaultPaymentMethods, method.value]
                            : settings.business.defaultPaymentMethods.filter(m => m !== method.value);
                          handleBusinessChange('defaultPaymentMethods', methods);
                        }}
                        disabled={saving}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>
                <p className="form-help">
                  Payment methods available by default for new payment links
                </p>
              </div>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Integration Settings</h2>
              <p className="text-sm text-gray-500">Configure webhooks and redirect URLs</p>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="form-label">Webhook URL</label>
                <input
                  type="url"
                  value={settings.business.webhookUrl}
                  onChange={(e) => handleBusinessChange('webhookUrl', e.target.value)}
                  className="form-input"
                  placeholder="https://your-website.com/webhook"
                  disabled={saving}
                />
                <p className="form-help">
                  We'll send payment notifications to this URL
                </p>
              </div>
              
              <div>
                <label className="form-label">Success Return URL</label>
                <input
                  type="url"
                  value={settings.business.returnUrl}
                  onChange={(e) => handleBusinessChange('returnUrl', e.target.value)}
                  className="form-input"
                  placeholder="https://your-website.com/success"
                  disabled={saving}
                />
                <p className="form-help">
                  Customers will be redirected here after successful payment
                </p>
              </div>
              
              <div>
                <label className="form-label">Cancel Return URL</label>
                <input
                  type="url"
                  value={settings.business.cancelUrl}
                  onChange={(e) => handleBusinessChange('cancelUrl', e.target.value)}
                  className="form-input"
                  placeholder="https://your-website.com/cancel"
                  disabled={saving}
                />
                <p className="form-help">
                  Customers will be redirected here if they cancel payment
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CogIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      API Integration
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Need help with API integration? Check our documentation or contact support for assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Settings;