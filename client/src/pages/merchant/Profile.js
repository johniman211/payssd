import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    city: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        businessType: user.businessType || '',
        city: user.city || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const southSudanCities = [
    'Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Kuacjok', 'Bentiu', 'Bor',
    'Torit', 'Rumbek', 'Yambio', 'Kapoeta', 'Renk', 'Gogrial', 'Pibor'
  ];

  const businessTypes = [
    'Retail Store', 'Restaurant/Food Service', 'Online Business', 'Services',
    'Manufacturing', 'Wholesale', 'Technology', 'Healthcare', 'Education',
    'Transportation', 'Real Estate', 'Agriculture', 'Construction', 'Other'
  ];

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!profileData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!profileData.businessType) {
      newErrors.businessType = 'Business type is required';
    }
    
    if (!profileData.city) {
      newErrors.city = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.put('/api/user/profile', profileData);
      updateUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.put('/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrors({});
    // Reset form data to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        businessType: user.businessType || '',
        city: user.city || '',
        address: user.address || ''
      });
    }
  };

  const getKYCStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'rejected':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-SS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'kyc', name: 'KYC Status', icon: ShieldCheckIcon }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and security settings
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

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-secondary"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={cancelEdit}
                  className="btn btn-secondary"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleUpdateProfile} className="card-body space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileInputChange}
                      disabled={!editing}
                      className={`form-input pl-10 ${!editing ? 'bg-gray-50' : ''} ${errors.firstName ? 'border-red-300' : ''}`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileInputChange}
                    disabled={!editing}
                    className={`form-input ${!editing ? 'bg-gray-50' : ''} ${errors.lastName ? 'border-red-300' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Email Address *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      disabled={!editing}
                      className={`form-input pl-10 ${!editing ? 'bg-gray-50' : ''} ${errors.email ? 'border-red-300' : ''}`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="form-label">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileInputChange}
                      disabled={!editing}
                      className={`form-input pl-10 ${!editing ? 'bg-gray-50' : ''} ${errors.phone ? 'border-red-300' : ''}`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Business Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="businessName"
                      value={profileData.businessName}
                      onChange={handleProfileInputChange}
                      disabled={!editing}
                      className={`form-input pl-10 ${!editing ? 'bg-gray-50' : ''} ${errors.businessName ? 'border-red-300' : ''}`}
                      placeholder="Enter your business name"
                    />
                  </div>
                  {errors.businessName && <p className="form-error">{errors.businessName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Business Type *</label>
                  <select
                    name="businessType"
                    value={profileData.businessType}
                    onChange={handleProfileInputChange}
                    disabled={!editing}
                    className={`form-select ${!editing ? 'bg-gray-50' : ''} ${errors.businessType ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && <p className="form-error">{errors.businessType}</p>}
                </div>
                
                <div>
                  <label className="form-label">City *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="city"
                      value={profileData.city}
                      onChange={handleProfileInputChange}
                      disabled={!editing}
                      className={`form-select pl-10 ${!editing ? 'bg-gray-50' : ''} ${errors.city ? 'border-red-300' : ''}`}
                    >
                      <option value="">Select your city</option>
                      {southSudanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileInputChange}
                    disabled={!editing}
                    className={`form-input ${!editing ? 'bg-gray-50' : ''}`}
                    placeholder="Enter your business address"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <div className="mt-1">
                    <span className="badge badge-success">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="card-body space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className={`form-input pr-10 ${errors.currentPassword ? 'border-red-300' : ''}`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
                </div>
                
                <div>
                  <label className="form-label">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className={`form-input pr-10 ${errors.newPassword ? 'border-red-300' : ''}`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
                  <p className="form-help">
                    Password must be at least 8 characters and contain uppercase, lowercase, and number
                  </p>
                </div>
                
                <div>
                  <label className="form-label">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* KYC Status Tab */}
      {activeTab === 'kyc' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">KYC Verification Status</h2>
          </div>
          
          <div className="card-body space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Verification Status</h3>
                <p className="text-sm text-gray-500">
                  Your account verification status and details
                </p>
              </div>
              <span className={getKYCStatusBadge(user?.kycStatus)}>
                {user?.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'Not Submitted'}
              </span>
            </div>
            
            {user?.kycStatus === 'pending' && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800">
                      Verification Under Review
                    </h3>
                    <div className="mt-2 text-sm text-warning-700">
                      <p>
                        Your KYC documents are currently being reviewed by our team. 
                        This process typically takes 1-3 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {user?.kycStatus === 'approved' && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-5 w-5 text-success-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-success-800">
                      Account Verified
                    </h3>
                    <div className="mt-2 text-sm text-success-700">
                      <p>
                        Your account has been successfully verified. You can now access all PaySSD features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {user?.kycStatus === 'rejected' && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="h-5 w-5 text-danger-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-danger-800">
                      Verification Rejected
                    </h3>
                    <div className="mt-2 text-sm text-danger-700">
                      <p>
                        Your KYC submission was rejected. Please review the feedback and resubmit your documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {(!user?.kycStatus || user?.kycStatus === 'required') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Verification Required
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Complete your KYC verification to unlock all PaySSD features and start accepting payments.
                      </p>
                    </div>
                    <div className="mt-4">
                      <a
                        href="/dashboard/kyc-verification"
                        className="btn btn-primary btn-sm"
                      >
                        Complete Verification
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {user?.kycSubmittedAt && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Submission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(user.kycSubmittedAt)}
                    </p>
                  </div>
                  
                  {user.kycReviewedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reviewed Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(user.kycReviewedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;