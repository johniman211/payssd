import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const KYCVerification = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phoneNumber: '',
    businessType: '',
    businessAddress: '',
    city: '',
    idType: 'national_id',
    idNumber: ''
  });
  const [idDocument, setIdDocument] = useState(null);
  const [businessDocument, setBusinessDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [errors, setErrors] = useState({});

  const businessTypes = [
    'Retail Store',
    'Restaurant/Food Service',
    'Online Business',
    'Professional Services',
    'Technology/Software',
    'Healthcare',
    'Education',
    'Transportation',
    'Agriculture',
    'Manufacturing',
    'Construction',
    'Other'
  ];

  const southSudanCities = [
    'Juba',
    'Wau',
    'Malakal',
    'Yei',
    'Aweil',
    'Kuacjok',
    'Bentiu',
    'Bor',
    'Torit',
    'Rumbek'
  ];

  useEffect(() => {
    // Pre-fill form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        businessName: user.businessName || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        city: user.city || ''
      }));
    }
    
    fetchKYCData();
  }, [user]);

  const fetchKYCData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/kyc/status');
      setKycData(response.data);
      
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          ...response.data,
          fullName: response.data.fullName || `${user?.firstName} ${user?.lastName}`,
          email: response.data.email || user?.email
        }));
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error fetching KYC data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      
      if (type === 'id') {
        setIdDocument(file);
      } else {
        setBusinessDocument(file);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    
    // Only require ID document if backend indicates no existing document
    const hasExistingIdDoc = kycData?.kyc?.documents?.hasIdDocument || kycData?.idDocument;
    if (!hasExistingIdDoc && !idDocument) {
      newErrors.idDocument = 'ID document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append files
      if (idDocument) {
        submitData.append('idDocument', idDocument);
      }
      // Update: send to backend expected fields
      if (businessDocument) {
        submitData.append('businessLicense', businessDocument);
      }
      // If there's a separate proof of address in this form later, append as 'proofOfAddress'
      
      const response = await axios.post('/api/kyc/submit', submitData);
      
      setKycData(response.data);
      
      // Update user context
      await updateUser();
      
      toast.success('KYC documents submitted successfully!');
    } catch (err) {
      console.error('Error submitting KYC:', err);
      toast.error(err.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-6 w-6 text-success-600" />;
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-warning-600" />;
      case 'rejected':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'approved':
        return {
          title: 'KYC Verified',
          message: 'Your account has been verified. You can now accept payments.',
          className: 'alert-success'
        };
      case 'pending':
        return {
          title: 'KYC Under Review',
          message: 'Your documents are being reviewed. This usually takes 1-2 business days.',
          className: 'alert-warning'
        };
      case 'rejected':
        return {
          title: 'KYC Rejected',
          message: kycData?.rejectionReason || 'Your KYC submission was rejected. Please resubmit with correct documents.',
          className: 'alert-danger'
        };
      default:
        return {
          title: 'KYC Required',
          message: 'Complete your KYC verification to start accepting payments.',
          className: 'alert-info'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading KYC information..." />
      </div>
    );
  }

  const statusInfo = getStatusMessage(user?.kycStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
        <p className="mt-2 text-gray-600">
          Verify your identity to start accepting payments in South Sudan
        </p>
      </div>

      {/* Status Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`alert ${statusInfo.className}`}
      >
        <div className="flex items-center">
          {getStatusIcon(user?.kycStatus)}
          <div className="ml-3">
            <h3 className="font-medium">{statusInfo.title}</h3>
            <p className="text-sm mt-1">{statusInfo.message}</p>
          </div>
        </div>
      </motion.div>

      {/* KYC Form */}
      {(user?.kycStatus === 'rejected' || !user?.kycStatus || user?.kycStatus === 'incomplete') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Verification Documents</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please provide accurate information and clear document images
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'border-red-300' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phoneNumber ? 'border-red-300' : ''}`}
                    placeholder="+211 XXX XXX XXX"
                  />
                  {errors.phoneNumber && <p className="form-error">{errors.phoneNumber}</p>}
                </div>
                
                <div>
                  <label className="form-label">City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`form-select ${errors.city ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select your city</option>
                    {southSudanCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.businessName ? 'border-red-300' : ''}`}
                    placeholder="Enter your business name"
                  />
                  {errors.businessName && <p className="form-error">{errors.businessName}</p>}
                </div>
                
                <div>
                  <label className="form-label">Business Type *</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className={`form-select ${errors.businessType ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && <p className="form-error">{errors.businessType}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Business Address *</label>
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className={`form-textarea ${errors.businessAddress ? 'border-red-300' : ''}`}
                    placeholder="Enter your business address"
                  />
                  {errors.businessAddress && <p className="form-error">{errors.businessAddress}</p>}
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Identity Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">ID Type *</label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driver's License</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">ID Number *</label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.idNumber ? 'border-red-300' : ''}`}
                    placeholder="Enter your ID number"
                  />
                  {errors.idNumber && <p className="form-error">{errors.idNumber}</p>}
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Document Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Document */}
                <div>
                  <label className="form-label">ID Document * (JPEG, PNG, PDF - Max 5MB)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload ID document</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, 'id')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                      {idDocument && (
                        <p className="text-sm text-success-600 font-medium">
                          ✓ {idDocument.name}
                        </p>
                      )}
                      {kycData?.idDocument && !idDocument && (
                        <p className="text-sm text-success-600 font-medium">
                          ✓ Document uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.idDocument && <p className="form-error">{errors.idDocument}</p>}
                </div>

                {/* Business Document (Optional) */}
                <div>
                  <label className="form-label">Business License (Optional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload business document</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, 'business')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                      {businessDocument && (
                        <p className="text-sm text-success-600 font-medium">
                          ✓ {businessDocument.name}
                        </p>
                      )}
                      {kycData?.businessDocument && !businessDocument && (
                        <p className="text-sm text-success-600 font-medium">
                          ✓ Document uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Submitted KYC Info */}
      {kycData && user?.kycStatus !== 'rejected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Submitted Information</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Full Name:</span>
                <span className="ml-2 text-gray-900">{kycData.fullName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Business Name:</span>
                <span className="ml-2 text-gray-900">{kycData.businessName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{kycData.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{kycData.phoneNumber}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">City:</span>
                <span className="ml-2 text-gray-900">{kycData.city}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Business Type:</span>
                <span className="ml-2 text-gray-900">{kycData.businessType}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Submitted:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(kycData.createdAt).toLocaleDateString('en-SS', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-body">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-warning-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Ensure all documents are clear and readable</li>
                <li>Information must match your official documents</li>
                <li>Verification typically takes 1-2 business days</li>
                <li>You'll receive an email notification once reviewed</li>
                <li>Only businesses operating in South Sudan are eligible</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KYCVerification;