import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ServerIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ToggleSwitch = ({ enabled, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      className={`${
        enabled ? 'bg-primary-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      role="switch"
      aria-checked={enabled}
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      platformName: 'PaySSD',
      platformDescription: 'Secure payment gateway for South Sudan',
      supportEmail: 'support@payssd.com',
      supportPhone: '+211 123 456 789',
      maintenanceMode: false,
      registrationEnabled: true,
      kycRequired: true,
      autoApproveKyc: false
    },
    payments: {
      flutterwaveCardEnabled: true,
      flutterwaveMobileMoneyEnabled: true,
      flutterwaveMpesaEnabled: true,
      flutterwaveBankTransferEnabled: true,
      minPaymentAmount: 100,
      maxPaymentAmount: 1000000,
      transactionFeePercentage: 2.5,
      fixedTransactionFee: 0,
      paymentTimeout: 300,
      autoRefundEnabled: true,
      refundTimeout: 24
    },
    payouts: {
      minPayoutAmount: 1000,
      maxPayoutAmount: 5000000,
      payoutFeePercentage: 1.0,
      fixedPayoutFee: 50,
      autoApprovePayouts: false,
      payoutProcessingDays: 3,
      requireBankVerification: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      requireTwoFactor: false,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      apiRateLimit: 100,
      ipWhitelistEnabled: false
    },
    notifications: {
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: true,
      webhookNotificationsEnabled: true,
      adminEmailAlerts: true,
      transactionAlerts: true,
      securityAlerts: true,
      systemMaintenanceAlerts: true,
      dailyReports: true,
      weeklyReports: true,
      monthlyReports: true
    },
    integrations: {
      flutterwavePublicKey: '',
      flutterwaveSecretKey: '',
      flutterwaveEncryptionKey: '',
      flutterwaveSandboxMode: true,
      emailServiceProvider: 'sendgrid',
      emailApiKey: '',
      smsServiceProvider: 'twilio',
      smsApiKey: '',
      smsApiSecret: ''
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'payments', name: 'Payments', icon: CurrencyDollarIcon },
    { id: 'payouts', name: 'Payouts', icon: BanknotesIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'integrations', name: 'Integrations', icon: ServerIcon }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/settings');
      if (data && data.settings) {
        setSettings(data.settings);
      } else {
        toast.error('Invalid settings response');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put('/api/admin/settings', { settings });
      if (data && data.settings) {
        setSettings(data.settings);
      }
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure platform-wide settings and integrations
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
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
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Platform Information</h2>
                <p className="text-sm text-gray-500">Basic platform configuration and branding</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Platform Name</label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Support Email</label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Support Phone</label>
                    <input
                      type="tel"
                      value={settings.general.supportPhone}
                      onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Platform Description</label>
                  <textarea
                    value={settings.general.platformDescription}
                    onChange={(e) => updateSetting('general', 'platformDescription', e.target.value)}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Platform Controls</h2>
                <p className="text-sm text-gray-500">Control platform availability and user registration</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">Temporarily disable platform access for maintenance</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.general.maintenanceMode}
                    onChange={(value) => updateSetting('general', 'maintenanceMode', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">User Registration</h3>
                    <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.general.registrationEnabled}
                    onChange={(value) => updateSetting('general', 'registrationEnabled', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">KYC Required</h3>
                    <p className="text-sm text-gray-500">Require KYC verification for all merchants</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.general.kycRequired}
                    onChange={(value) => updateSetting('general', 'kycRequired', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Auto-approve KYC</h3>
                    <p className="text-sm text-gray-500">Automatically approve KYC submissions (not recommended)</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.general.autoApproveKyc}
                    onChange={(value) => updateSetting('general', 'autoApproveKyc', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                <p className="text-sm text-gray-500">Configure available payment methods</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Card</h3>
                    <p className="text-sm text-gray-500">Enable card payments via Flutterwave</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payments.flutterwaveCardEnabled}
                    onChange={(value) => updateSetting('payments', 'flutterwaveCardEnabled', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Mobile Money</h3>
                    <p className="text-sm text-gray-500">Enable mobile money via Flutterwave</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payments.flutterwaveMobileMoneyEnabled}
                    onChange={(value) => updateSetting('payments', 'flutterwaveMobileMoneyEnabled', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">M‑Pesa</h3>
                    <p className="text-sm text-gray-500">Enable M‑Pesa via Flutterwave</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payments.flutterwaveMpesaEnabled}
                    onChange={(value) => updateSetting('payments', 'flutterwaveMpesaEnabled', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Bank Transfer</h3>
                    <p className="text-sm text-gray-500">Enable bank transfers via Flutterwave</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payments.flutterwaveBankTransferEnabled}
                    onChange={(value) => updateSetting('payments', 'flutterwaveBankTransferEnabled', value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Payment Limits</h2>
                <p className="text-sm text-gray-500">Set minimum and maximum payment amounts</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Minimum Payment Amount (SSP)</label>
                    <input
                      type="number"
                      value={settings.payments.minPaymentAmount}
                      onChange={(e) => updateSetting('payments', 'minPaymentAmount', parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {formatCurrency(settings.payments.minPaymentAmount)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label">Maximum Payment Amount (SSP)</label>
                    <input
                      type="number"
                      value={settings.payments.maxPaymentAmount}
                      onChange={(e) => updateSetting('payments', 'maxPaymentAmount', parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {formatCurrency(settings.payments.maxPaymentAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Transaction Fees</h2>
                <p className="text-sm text-gray-500">Configure platform transaction fees</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Fee Percentage (%)</label>
                    <input
                      type="number"
                      value={settings.payments.transactionFeePercentage}
                      onChange={(e) => updateSetting('payments', 'transactionFeePercentage', parseFloat(e.target.value))}
                      className="form-input"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Fixed Fee (SSP)</label>
                    <input
                      type="number"
                      value={settings.payments.fixedTransactionFee}
                      onChange={(e) => updateSetting('payments', 'fixedTransactionFee', parseInt(e.target.value))}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fee Calculation Example</h4>
                  <p className="text-sm text-gray-600">
                    For a payment of {formatCurrency(1000)}:
                  </p>
                  <p className="text-sm text-gray-600">
                    Fee = {formatCurrency(settings.payments.fixedTransactionFee)} + 
                    ({settings.payments.transactionFeePercentage}% × {formatCurrency(1000)}) = 
                    {formatCurrency(
                      settings.payments.fixedTransactionFee + 
                      (1000 * settings.payments.transactionFeePercentage / 100)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Payment Processing</h2>
                <p className="text-sm text-gray-500">Configure payment processing behavior</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Payment Timeout (seconds)</label>
                    <input
                      type="number"
                      value={settings.payments.paymentTimeout}
                      onChange={(e) => updateSetting('payments', 'paymentTimeout', parseInt(e.target.value))}
                      className="form-input"
                      min="60"
                      max="3600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long to wait for payment completion
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label">Auto Refund Timeout (hours)</label>
                    <input
                      type="number"
                      value={settings.payments.refundTimeout}
                      onChange={(e) => updateSetting('payments', 'refundTimeout', parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                      max="168"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto refund failed payments after this time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Auto Refund</h3>
                    <p className="text-sm text-gray-500">Automatically refund failed payments</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payments.autoRefundEnabled}
                    onChange={(value) => updateSetting('payments', 'autoRefundEnabled', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payout Settings */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Payout Limits</h2>
                <p className="text-sm text-gray-500">Set minimum and maximum payout amounts</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Minimum Payout Amount (SSP)</label>
                    <input
                      type="number"
                      value={settings.payouts.minPayoutAmount}
                      onChange={(e) => updateSetting('payouts', 'minPayoutAmount', parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {formatCurrency(settings.payouts.minPayoutAmount)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label">Maximum Payout Amount (SSP)</label>
                    <input
                      type="number"
                      value={settings.payouts.maxPayoutAmount}
                      onChange={(e) => updateSetting('payouts', 'maxPayoutAmount', parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {formatCurrency(settings.payouts.maxPayoutAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Payout Fees</h2>
                <p className="text-sm text-gray-500">Configure payout processing fees</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Fee Percentage (%)</label>
                    <input
                      type="number"
                      value={settings.payouts.payoutFeePercentage}
                      onChange={(e) => updateSetting('payouts', 'payoutFeePercentage', parseFloat(e.target.value))}
                      className="form-input"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Fixed Fee (SSP)</label>
                    <input
                      type="number"
                      value={settings.payouts.fixedPayoutFee}
                      onChange={(e) => updateSetting('payouts', 'fixedPayoutFee', parseInt(e.target.value))}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fee Calculation Example</h4>
                  <p className="text-sm text-gray-600">
                    For a payout of {formatCurrency(10000)}:
                  </p>
                  <p className="text-sm text-gray-600">
                    Fee = {formatCurrency(settings.payouts.fixedPayoutFee)} + 
                    ({settings.payouts.payoutFeePercentage}% × {formatCurrency(10000)}) = 
                    {formatCurrency(
                      settings.payouts.fixedPayoutFee + 
                      (10000 * settings.payouts.payoutFeePercentage / 100)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Payout Processing</h2>
                <p className="text-sm text-gray-500">Configure payout processing behavior</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Processing Time (business days)</label>
                    <input
                      type="number"
                      value={settings.payouts.payoutProcessingDays}
                      onChange={(e) => updateSetting('payouts', 'payoutProcessingDays', parseInt(e.target.value))}
                      className="form-input"
                      min="1"
                      max="14"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Expected processing time for payouts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Auto-approve Payouts</h3>
                    <p className="text-sm text-gray-500">Automatically approve payout requests (not recommended)</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payouts.autoApprovePayouts}
                    onChange={(value) => updateSetting('payouts', 'autoApprovePayouts', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Require Bank Verification</h3>
                    <p className="text-sm text-gray-500">Require bank account verification for payouts</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.payouts.requireBankVerification}
                    onChange={(value) => updateSetting('payouts', 'requireBankVerification', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Session Security</h2>
                <p className="text-sm text-gray-500">Configure user session and authentication settings</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="form-input"
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="form-input"
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.lockoutDuration}
                      onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                      className="form-input"
                      min="5"
                      max="1440"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Require Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.security.requireTwoFactor}
                    onChange={(value) => updateSetting('security', 'requireTwoFactor', value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Password Policy</h2>
                <p className="text-sm text-gray-500">Set password requirements for user accounts</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="form-label">Minimum Password Length</label>
                  <input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="form-input"
                    min="6"
                    max="32"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Require Special Characters</h3>
                      <p className="text-sm text-gray-500">Password must contain special characters (!@#$%^&*)</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.security.passwordRequireSpecial}
                      onChange={(value) => updateSetting('security', 'passwordRequireSpecial', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Require Numbers</h3>
                      <p className="text-sm text-gray-500">Password must contain at least one number</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.security.passwordRequireNumbers}
                      onChange={(value) => updateSetting('security', 'passwordRequireNumbers', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Require Uppercase Letters</h3>
                      <p className="text-sm text-gray-500">Password must contain uppercase letters</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.security.passwordRequireUppercase}
                      onChange={(value) => updateSetting('security', 'passwordRequireUppercase', value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">API Security</h2>
                <p className="text-sm text-gray-500">Configure API access and rate limiting</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="form-label">API Rate Limit (requests per minute)</label>
                  <input
                    type="number"
                    value={settings.security.apiRateLimit}
                    onChange={(e) => updateSetting('security', 'apiRateLimit', parseInt(e.target.value))}
                    className="form-input"
                    min="10"
                    max="1000"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">IP Whitelist</h3>
                    <p className="text-sm text-gray-500">Enable IP address whitelisting for admin access</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.security.ipWhitelistEnabled}
                    onChange={(value) => updateSetting('security', 'ipWhitelistEnabled', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Notification Channels</h2>
                <p className="text-sm text-gray-500">Enable or disable notification channels</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.emailNotificationsEnabled}
                    onChange={(value) => updateSetting('notifications', 'emailNotificationsEnabled', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Send notifications via SMS</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.smsNotificationsEnabled}
                    onChange={(value) => updateSetting('notifications', 'smsNotificationsEnabled', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Webhook Notifications</h3>
                    <p className="text-sm text-gray-500">Send notifications via webhooks</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.webhookNotificationsEnabled}
                    onChange={(value) => updateSetting('notifications', 'webhookNotificationsEnabled', value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Admin Alerts</h2>
                <p className="text-sm text-gray-500">Configure alerts for administrators</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Transaction Alerts</h3>
                    <p className="text-sm text-gray-500">Alert on high-value or suspicious transactions</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.transactionAlerts}
                    onChange={(value) => updateSetting('notifications', 'transactionAlerts', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Security Alerts</h3>
                    <p className="text-sm text-gray-500">Alert on security events and failed login attempts</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.securityAlerts}
                    onChange={(value) => updateSetting('notifications', 'securityAlerts', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">System Maintenance Alerts</h3>
                    <p className="text-sm text-gray-500">Alert on system maintenance and downtime</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.systemMaintenanceAlerts}
                    onChange={(value) => updateSetting('notifications', 'systemMaintenanceAlerts', value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
                <p className="text-sm text-gray-500">Configure automated report generation</p>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Daily Reports</h3>
                    <p className="text-sm text-gray-500">Generate and send daily transaction reports</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.dailyReports}
                    onChange={(value) => updateSetting('notifications', 'dailyReports', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                    <p className="text-sm text-gray-500">Generate and send weekly summary reports</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.weeklyReports}
                    onChange={(value) => updateSetting('notifications', 'weeklyReports', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Monthly Reports</h3>
                    <p className="text-sm text-gray-500">Generate and send monthly business reports</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.monthlyReports}
                    onChange={(value) => updateSetting('notifications', 'monthlyReports', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-warning-800">
                    Sensitive Information
                  </h3>
                  <div className="mt-2 text-sm text-warning-700">
                    <p>
                      API keys and secrets are sensitive information. Ensure they are kept secure and only shared with authorized personnel.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Flutterwave</h2>
                <p className="text-sm text-gray-500">Configure Flutterwave API integration (Sandbox)</p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Public Key</label>
                    <input
                      type="password"
                      value={settings.integrations.flutterwavePublicKey}
                      onChange={(e) => updateSetting('integrations', 'flutterwavePublicKey', e.target.value)}
                      className="form-input"
                      placeholder="Enter Flutterwave Public Key"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Secret Key</label>
                    <input
                      type="password"
                      value={settings.integrations.flutterwaveSecretKey}
                      onChange={(e) => updateSetting('integrations', 'flutterwaveSecretKey', e.target.value)}
                      className="form-input"
                      placeholder="Enter Flutterwave Secret Key"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Encryption Key</label>
                  <input
                    type="password"
                    value={settings.integrations.flutterwaveEncryptionKey}
                    onChange={(e) => updateSetting('integrations', 'flutterwaveEncryptionKey', e.target.value)}
                    className="form-input"
                    placeholder="Enter Flutterwave Encryption Key"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Sandbox Mode</h3>
                    <p className="text-sm text-gray-500">Use sandbox environment for testing</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.integrations.flutterwaveSandboxMode}
                    onChange={(value) => updateSetting('integrations', 'flutterwaveSandboxMode', value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Email Service</h2>
                <p className="text-sm text-gray-500">Configure email service provider</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="form-label">Email Service Provider</label>
                  <select
                    value={settings.integrations.emailServiceProvider}
                    onChange={(e) => updateSetting('integrations', 'emailServiceProvider', e.target.value)}
                    className="form-select"
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                    <option value="smtp">Custom SMTP</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">API Key</label>
                  <input
                    type="password"
                    value={settings.integrations.emailApiKey}
                    onChange={(e) => updateSetting('integrations', 'emailApiKey', e.target.value)}
                    className="form-input"
                    placeholder="Enter Email Service API Key"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">SMS Service</h2>
                <p className="text-sm text-gray-500">Configure SMS service provider</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="form-label">SMS Service Provider</label>
                  <select
                    value={settings.integrations.smsServiceProvider}
                    onChange={(e) => updateSetting('integrations', 'smsServiceProvider', e.target.value)}
                    className="form-select"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="nexmo">Vonage (Nexmo)</option>
                    <option value="africastalking">Africa's Talking</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">API Key</label>
                    <input
                      type="password"
                      value={settings.integrations.smsApiKey}
                      onChange={(e) => updateSetting('integrations', 'smsApiKey', e.target.value)}
                      className="form-input"
                      placeholder="Enter SMS API Key"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">API Secret</label>
                    <input
                      type="password"
                      value={settings.integrations.smsApiSecret}
                      onChange={(e) => updateSetting('integrations', 'smsApiSecret', e.target.value)}
                      className="form-input"
                      placeholder="Enter SMS API Secret"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SystemSettings;
