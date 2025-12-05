import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Upload, FileText, AlertCircle, X, Send, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const Verification = () => {
  const { profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [kycPaths, setKycPaths] = useState({});
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    dob: '',
    gender: '',
    nationality: 'South Sudan',
    phone: '',
    email: ''
  });
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    businessAddress: ''
  });
  const [withdrawalInfo, setWithdrawalInfo] = useState({
    method: 'bank',
    bankAccountName: '',
    bankAccountNumber: '',
    bankCode: '',
    momoProvider: '',
    momoNumber: ''
  });

  useEffect(() => {
    if (profile?.documents) {
      setDocuments(profile.documents);
    }
  }, [profile]);

  // Poll for verification status updates (every 5 seconds if pending)
  useEffect(() => {
    if (profile?.verification_status === 'pending') {
      const interval = setInterval(async () => {
        console.log('Polling for verification status update...');
        if (refreshProfile) {
          await refreshProfile();
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [profile?.verification_status, refreshProfile]);

  // Remove aggressive auto-refresh to prevent clearing form inputs while editing

  const [initializedFromProfile, setInitializedFromProfile] = useState(false);
  useEffect(() => {
    if (!initializedFromProfile && profile) {
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        phone: profile?.phone || prev.phone,
        email: profile?.email || prev.email,
      }));
      setBusinessInfo((prev) => ({
        ...prev,
        businessName: profile?.business_name || prev.businessName,
        businessType: profile?.business_type || prev.businessType,
        registrationNumber: profile?.business_registration_number || prev.registrationNumber,
        taxId: profile?.tax_id || prev.taxId,
        businessAddress: profile?.business_address || prev.businessAddress,
      }));
      setWithdrawalInfo((prev) => ({
        ...prev,
        bankAccountName: profile?.account_name || prev.bankAccountName,
        bankAccountNumber: profile?.account_number || prev.bankAccountNumber,
        bankCode: profile?.bank_name || prev.bankCode,
      }));
      setInitializedFromProfile(true);
    }
  }, [profile, initializedFromProfile]);

  const requiredDocuments = [
    { id: 'national_id', name: 'National ID or Passport', required: true },
    { id: 'proof_of_address', name: 'Proof of Address', required: false },
    ...(profile?.account_type === 'business' ? [
      { id: 'business_registration', name: 'Business Registration Certificate', required: true },
      { id: 'tax_id', name: 'Tax ID Number (TIN)', required: true },
    ] : [])
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      failed: 'bg-red-500',
      skipped: 'bg-gray-300',
    };
    return colors[status] || 'bg-gray-300';
  };

  const handleFileUpload = async (e, docId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setUploading(true);
    try {
      const { data: signed, error } = await supabase.functions.invoke('create-upload-url', {
        body: { merchant_id: profile.id, filename: file.name }
      })
      if (error || !signed?.ok) throw new Error(error?.message || 'Failed to get upload URL')
      const res = await fetch(signed.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!res.ok) throw new Error('Upload failed')
      const updatedDocuments = documents.filter(d => d.id !== docId)
      updatedDocuments.push({ id: docId, name: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString() })
      setDocuments(updatedDocuments)
      setUploadedFiles({ ...uploadedFiles, [docId]: file.name })
      setKycPaths({ ...kycPaths, [docId]: signed.path })
      alert('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error uploading document: ' + error.message)
    } finally {
      setUploading(false)
    }
  };

  const removeDocument = async (docId) => {
    try {
      const updatedDocuments = documents.filter(d => d.id !== docId);
      setDocuments(updatedDocuments);
      setUploadedFiles({ ...uploadedFiles, [docId]: null });

      const { error } = await supabase
        .from('merchants')
        .update({ documents: updatedDocuments })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Error removing document: ' + error.message);
    }
  };

  const handleSubmitForVerification = async () => {
    // Check if all required documents are uploaded
    const missingRequired = requiredDocuments
      .filter(doc => doc.required && !documents.find(d => d.id === doc.id));

    if (missingRequired.length > 0) {
      alert(`Please upload all required documents:\n${missingRequired.map(d => `- ${d.name}`).join('\n')}`);
      return;
    }

    if (documents.length === 0) {
      alert('Please upload at least one document before submitting for verification.');
      return;
    }

    if (!window.confirm('Are you sure you want to submit your documents for verification? You will not be able to edit them until the review is complete.')) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        registration_doc_url: kycPaths['business_registration'] || null,
        id_doc_url: kycPaths['national_id'] || null,
        address_proof_url: kycPaths['proof_of_address'] || null,
        bank_account_name: withdrawalInfo.method === 'bank' ? (withdrawalInfo.bankAccountName || null) : null,
        bank_account_number: withdrawalInfo.method === 'bank' ? (withdrawalInfo.bankAccountNumber || null) : null,
        bank_code: withdrawalInfo.method === 'bank' ? (withdrawalInfo.bankCode || null) : null,
        momo_provider: withdrawalInfo.method === 'momo' ? (withdrawalInfo.momoProvider || null) : null,
        momo_number: withdrawalInfo.method === 'momo' ? (withdrawalInfo.momoNumber || null) : null,
        personal: {
          full_name: personalInfo.fullName || null,
          dob: personalInfo.dob || null,
          gender: personalInfo.gender || null,
          nationality: personalInfo.nationality || null,
          phone: personalInfo.phone || null,
          email: personalInfo.email || null
        },
        business: profile?.account_type === 'business' ? {
          name: businessInfo.businessName || null,
          type: businessInfo.businessType || null,
          registration_number: businessInfo.registrationNumber || null,
          tax_id: businessInfo.taxId || null,
          address: businessInfo.businessAddress || null
        } : null
      }
      const { data, error } = await supabase.functions.invoke('submit-kyc', {
        body: { merchant_id: profile.id, kyc: payload }
      })
      if (error || !data?.ok) throw new Error(error?.message || 'KYC submission failed')
      const { error: upErr } = await supabase.from('merchants').update({ verification_status: 'pending', verification_notes: null }).eq('id', profile.id)
      if (upErr) throw upErr
      alert('Documents submitted successfully! Your account is now under review.')
      await refreshProfile()
    } catch (error) {
      console.error('Error submitting for verification:', error)
      alert('Error submitting for verification: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm('Resubmit your documents for verification? This will clear the previous rejection and submit a new verification request.')) {
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          verification_status: 'pending',
          verification_notes: null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      alert('Verification resubmitted! Your account is now under review again.');
      await refreshProfile();
    } catch (error) {
      console.error('Error resubmitting:', error);
      alert('Error resubmitting: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { title: 'Personal Information', status: 'completed', icon: CheckCircle },
    { title: 'Business Details', status: profile?.account_type === 'business' ? 'completed' : 'skipped', icon: CheckCircle },
    { title: 'Document Upload', status: documents.length > 0 ? 'completed' : 'pending', icon: Clock },
    { title: 'Admin Review', status: profile?.verification_status === 'approved' ? 'completed' : profile?.verification_status === 'rejected' ? 'failed' : 'pending', icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Account Verification</h1>
          <p className="text-secondary-600">Complete verification to unlock live API keys</p>
        </div>

        {/* Linked Onboarding Information (read-only) */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Merchant</h3>
              <p className="text-secondary-700">
                {(profile?.business_name) || `${profile?.first_name || ''} ${profile?.last_name || ''}`}
              </p>
              <p className="text-secondary-600 text-sm">{profile?.email}</p>
              <p className="text-secondary-600 text-sm capitalize">{profile?.account_type} account</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Onboarding Details</h3>
              {profile?.account_type === 'business' ? (
                <div className="text-sm text-secondary-700 space-y-1">
                  <p>Registration: {profile?.business_registration_number || '—'}</p>
                  <p>Address: {profile?.business_address || '—'}</p>
                  <p>Type: {profile?.business_type || '—'}</p>
                </div>
              ) : (
                <p className="text-sm text-secondary-700">Personal account</p>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs text-secondary-500">
            Onboarding information is linked here for context only. Verification is a separate process and requires document submission.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Full Name" value={personalInfo.fullName} onChange={(e)=>setPersonalInfo({...personalInfo, fullName: e.target.value})} />
            <input type="date" className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Date of Birth" value={personalInfo.dob} onChange={(e)=>setPersonalInfo({...personalInfo, dob: e.target.value})} />
            <select className="px-4 py-3 border border-secondary-200 rounded-xl" value={personalInfo.gender} onChange={(e)=>setPersonalInfo({...personalInfo, gender: e.target.value})}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Nationality" value={personalInfo.nationality} onChange={(e)=>setPersonalInfo({...personalInfo, nationality: e.target.value})} />
            <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Phone" value={personalInfo.phone} onChange={(e)=>setPersonalInfo({...personalInfo, phone: e.target.value})} />
            <input type="email" className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Email" value={personalInfo.email} onChange={(e)=>setPersonalInfo({...personalInfo, email: e.target.value})} />
          </div>
        </Card>

        {profile?.account_type === 'business' && (
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Business Name" value={businessInfo.businessName} onChange={(e)=>setBusinessInfo({...businessInfo, businessName: e.target.value})} />
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Business Type" value={businessInfo.businessType} onChange={(e)=>setBusinessInfo({...businessInfo, businessType: e.target.value})} />
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Registration Number" value={businessInfo.registrationNumber} onChange={(e)=>setBusinessInfo({...businessInfo, registrationNumber: e.target.value})} />
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Tax ID (TIN)" value={businessInfo.taxId} onChange={(e)=>setBusinessInfo({...businessInfo, taxId: e.target.value})} />
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Business Address" value={businessInfo.businessAddress} onChange={(e)=>setBusinessInfo({...businessInfo, businessAddress: e.target.value})} />
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Withdrawal Information</h2>
          <div className="mb-4">
            <div className="inline-flex rounded-xl overflow-hidden border border-secondary-200">
              <button className={`px-4 py-2 ${withdrawalInfo.method==='bank'?'bg-primary-600 text-white':'bg-white'}`} onClick={()=>setWithdrawalInfo({...withdrawalInfo, method:'bank'})}>Bank Account</button>
              <button className={`px-4 py-2 ${withdrawalInfo.method==='momo'?'bg-primary-600 text-white':'bg-white'}`} onClick={()=>setWithdrawalInfo({...withdrawalInfo, method:'momo'})}>Mobile Money</button>
            </div>
          </div>
          {withdrawalInfo.method === 'bank' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Account Name" value={withdrawalInfo.bankAccountName} onChange={(e)=>setWithdrawalInfo({...withdrawalInfo, bankAccountName: e.target.value})} />
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Account Number" value={withdrawalInfo.bankAccountNumber} onChange={(e)=>setWithdrawalInfo({...withdrawalInfo, bankAccountNumber: e.target.value})} />
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Bank Code" value={withdrawalInfo.bankCode} onChange={(e)=>setWithdrawalInfo({...withdrawalInfo, bankCode: e.target.value})} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="px-4 py-3 border border-secondary-200 rounded-xl" value={withdrawalInfo.momoProvider} onChange={(e)=>setWithdrawalInfo({...withdrawalInfo, momoProvider: e.target.value})}>
                <option value="">Select Provider</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="Zain">Zain</option>
              </select>
              <input className="px-4 py-3 border border-secondary-200 rounded-xl" placeholder="Mobile Money Number" value={withdrawalInfo.momoNumber} onChange={(e)=>setWithdrawalInfo({...withdrawalInfo, momoNumber: e.target.value})} />
            </div>
          )}
        </Card>

        {/* Current Status */}
        <Card className={`${
          profile?.verification_status === 'approved' ? 'bg-green-50 border-green-200' :
          profile?.verification_status === 'rejected' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${
              profile?.verification_status === 'approved' ? 'bg-green-100' :
              profile?.verification_status === 'rejected' ? 'bg-red-100' :
              'bg-yellow-100'
            }`}>
              {profile?.verification_status === 'approved' ? (
                <CheckCircle className="text-green-600" size={32} />
              ) : profile?.verification_status === 'rejected' ? (
                <AlertCircle className="text-red-600" size={32} />
              ) : (
                <Clock className="text-yellow-600" size={32} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                {profile?.verification_status === 'approved' && 'Account Verified! 🎉'}
                {profile?.verification_status === 'rejected' && 'Verification Rejected'}
                {profile?.verification_status === 'pending' && 'Verification Pending'}
                {!profile?.verification_status && 'Not Submitted'}
              </h3>
              <p className="text-sm text-secondary-600">
                {profile?.verification_status === 'approved' && 'Your account is fully verified. Live API keys are active!'}
                {profile?.verification_status === 'rejected' && (
                  <span>
                    <strong>Rejection Reason:</strong> {profile?.verification_notes || 'No reason provided'}
                  </span>
                )}
                {profile?.verification_status === 'pending' && 'Your account is under review. This usually takes 1-2 business days.'}
                {!profile?.verification_status && 'Please upload your documents and submit for verification.'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              profile?.verification_status === 'approved' ? 'bg-green-600 text-white' :
              profile?.verification_status === 'rejected' ? 'bg-red-600 text-white' :
              profile?.verification_status === 'pending' ? 'bg-yellow-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {profile?.verification_status?.toUpperCase() || 'NOT SUBMITTED'}
            </span>
          </div>
        </Card>

        {/* Progress Steps */}
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Verification Progress</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${getStatusColor(step.status)} flex items-center justify-center text-white flex-shrink-0`}>
                  <step.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900">{step.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  step.status === 'completed' ? 'bg-green-50 text-green-600' :
                  step.status === 'failed' ? 'bg-red-50 text-red-600' :
                  step.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Document Upload */}
        {(profile?.verification_status !== 'approved' && profile?.verification_status !== 'pending') && (
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Upload Documents</h2>
            <div className="space-y-4 mb-6">
              {requiredDocuments.map((doc) => {
                const uploadedDoc = documents.find(d => d.id === doc.id);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="text-primary-600" size={20} />
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{doc.name}</p>
                        <p className="text-xs text-secondary-500">
                          {doc.required ? 'Required' : 'Optional'}
                          {uploadedDoc && ` • Uploaded: ${uploadedDoc.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedDoc && (
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove document"
                        >
                          <X size={18} />
                        </button>
                      )}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, doc.id)}
                          className="hidden"
                          disabled={uploading}
                        />
                        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          uploadedDoc
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}>
                          {uploadedDoc ? 'Replace' : 'Upload'}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-secondary-200">
              <button
                onClick={handleSubmitForVerification}
                disabled={submitting || uploading || documents.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {submitting ? (
                  <>
                    <Clock className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </Card>
        )}

        {/* Resubmit Section (if rejected) */}
        {profile?.verification_status === 'rejected' && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Verification Rejected</h3>
                <p className="text-red-800 mb-4">
                  <strong>Reason:</strong> {profile?.verification_notes || 'No reason provided'}
                </p>
                <p className="text-sm text-red-700 mb-4">
                  Please review the rejection reason above, update your documents if needed, and resubmit for verification.
                </p>
                <button
                  onClick={handleResubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {submitting ? (
                    <>
                      <Clock className="animate-spin" size={20} />
                      Resubmitting...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={20} />
                      Resubmit for Verification
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Review Message */}
        {profile?.verification_status === 'pending' && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-4">
              <Clock className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Under Review</h3>
                <p className="text-yellow-800">
                  Your documents have been submitted and are currently under review by our team. 
                  This process usually takes 1-2 business days. You will be notified once the review is complete.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Verification;
