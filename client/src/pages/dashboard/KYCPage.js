import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle, Camera, User, Building } from 'lucide-react';
import axios from 'axios';
import { TokenStorage } from '../../utils/security';

const KYCPage = () => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    idType: '',
    idNumber: '',
    businessName: '',
    idDocument: null,
    businessLicense: null,
    proofOfAddress: null
  });
  const [previews, setPreviews] = useState({
    idDocument: null,
    businessLicense: null,
    proofOfAddress: null
  });
  const formRef = useRef(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/kyc/status');
      setKycStatus(response.data.kyc);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      // If no KYC record exists, that's fine - user needs to submit
      if (error.response?.status !== 404) {
        setError('Failed to load KYC status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload only JPEG, PNG, or PDF files');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, [fieldName]: file }));
      console.log(`File uploaded for ${fieldName}:`, file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({ ...prev, [fieldName]: e.target.result }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => ({ ...prev, [fieldName]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Client-side validation
    console.log('Form data before submission:', formData);
    console.log('ID Document:', formData.idDocument);
    console.log('Existing KYC status:', kycStatus);
    
    // Only require ID document if user doesn't have existing one and no new one is provided
    if (!kycStatus?.documents?.hasIdDocument && !formData.idDocument) {
      setError('ID document is required');
      setSubmitting(false);
      return;
    }

    if (!formData.idType) {
      setError('Please select an ID type');
      setSubmitting(false);
      return;
    }

    if (!formData.idNumber.trim()) {
      setError('ID number is required');
      setSubmitting(false);
      return;
    }

    if (!formData.businessName.trim()) {
      setError('Business name is required');
      setSubmitting(false);
      return;
    }

    try {
      const token = TokenStorage.getToken();
      const submitData = new FormData();
      
      // Append form fields
      submitData.append('idType', formData.idType);
      submitData.append('idNumber', formData.idNumber);
      submitData.append('businessName', formData.businessName);
      
      // Append files
      if (formData.idDocument) {
        submitData.append('idDocument', formData.idDocument);
      }
      if (formData.businessLicense) {
        submitData.append('businessLicense', formData.businessLicense);
      }
      if (formData.proofOfAddress) {
        submitData.append('proofOfAddress', formData.proofOfAddress);
      }

      await axios.post('/api/kyc/submit', submitData);


      setSuccess('KYC documents submitted successfully! We will review your submission within 2-3 business days.');
      fetchKYCStatus(); // Refresh status
    } catch (error) {
      console.error('Error submitting KYC:', error);
      setError(error.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircle },
      incomplete: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Incomplete', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.incomplete;
    const IconComponent = config.icon;
    
    return (
      <span className={`px-3 py-1 text-sm font-medium ${config.bg} ${config.text} rounded-full flex items-center gap-2`}>
        <IconComponent className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const FileUploadField = ({ label, name, accept, required, description, icon: Icon }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      <p className="text-xs text-gray-500">{description}</p>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
        <div className="space-y-1 text-center">
          {previews[name] ? (
            <div className="space-y-2">
              <img src={previews[name]} alt="Preview" className="mx-auto h-32 w-auto rounded" />
              <p className="text-xs text-gray-500">{formData[name]?.name}</p>
            </div>
          ) : formData[name] ? (
            <div className="space-y-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-xs text-gray-500">{formData[name].name}</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor={name} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input
                    id={name}
                    name={name}
                    type="file"
                    className="sr-only"
                    accept={accept}
                    onChange={(e) => handleFileChange(e, name)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-1">Complete your identity verification</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600 mt-1">Complete your identity verification to unlock all features</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Current Status */}
      {kycStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification Status</h2>
              <div className="flex items-center gap-4 mb-4">
                {getStatusBadge(kycStatus.status)}
                <span className="text-sm text-gray-500">
                  {kycStatus.submittedAt ? 
                    `Submitted on ${new Date(kycStatus.submittedAt).toLocaleDateString()}` :
                    'Not yet submitted'
                  }
                </span>
                {(kycStatus.status === 'incomplete' || kycStatus.status === 'not_submitted' || !kycStatus.status) && (
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="ml-2 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Start Verification
                  </button>
                )}
              </div>
              {kycStatus.status === 'rejected' && kycStatus.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {kycStatus.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Form */}
      {(!kycStatus || kycStatus.status === 'rejected' || kycStatus.status === 'incomplete' || kycStatus.status === 'not_submitted' || !kycStatus.status) && (
        <div ref={formRef} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {kycStatus?.status === 'rejected' ? 'Resubmit KYC Documents' : 'Submit KYC Documents'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ID Type *
                  </div>
                </label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select ID Type</option>
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driver's License</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ID Number *
                  </div>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your ID number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Business Name *
                </div>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your business name"
              />
            </div>

            {/* Document Uploads */}
            <div className="space-y-6">
              <h3 className="text-md font-medium text-gray-900">Required Documents</h3>
              
              <FileUploadField
                label="ID Document"
                name="idDocument"
                accept="image/*,application/pdf"
                required
                description="Clear photo or scan of your government-issued ID"
                icon={User}
              />
              
              <FileUploadField
                label="Business License"
                name="businessLicense"
                accept="image/*,application/pdf"
                required
                description="Official business registration or license document"
                icon={Building}
              />
              
              <FileUploadField
                label="Proof of Address"
                name="proofOfAddress"
                accept="image/*,application/pdf"
                required
                description="Utility bill, bank statement, or lease agreement (not older than 3 months)"
                icon={FileText}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Important Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All documents must be clear and legible</li>
                <li>• Documents should not be older than 3 months (except ID documents)</li>
                <li>• Processing time is typically 2-3 business days</li>
                <li>• You will be notified via email once verification is complete</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Approved Status */}
      {kycStatus?.status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-900">Verification Complete!</h3>
              <p className="text-green-700">Your account has been successfully verified. You now have access to all PaySSD features.</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Status */}
      {kycStatus?.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900">Under Review</h3>
              <p className="text-yellow-700">Your documents are being reviewed. We'll notify you via email once the verification is complete (typically 2-3 business days).</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCPage;