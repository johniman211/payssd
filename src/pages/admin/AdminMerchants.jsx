import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, Eye, Mail, Phone, Building, FileText } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../supabase/supabaseClient';

const AdminMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [rejectingMerchantId, setRejectingMerchantId] = useState(null);

  useEffect(() => {
    loadMerchants();
  }, [statusFilter]);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      let query = supabase.from('merchants').select('*').order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading merchants:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert('Error loading merchants: ' + error.message + '\n\nThis might be a database permission issue. Check the browser console for details.');
        throw error;
      }
      
      console.log('Loaded merchants:', data?.length || 0);
      console.log('Merchant statuses:', data?.map(m => ({ id: m.id, email: m.email, status: m.verification_status })));
      setMerchants(data || []);
    } catch (error) {
      console.error('Error loading merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (merchantId, status, notes = null) => {
    try {
      console.log('Updating merchant verification via function:', { merchantId, status, notes });

      const approve = status === 'approved';
      const { data: resp, error } = await supabase.functions.invoke('admin/approve-kyc', {
        body: { merchant_id: merchantId, approve, reviewer_admin_id: null }
      })
      if (error || !resp?.ok) throw new Error(error?.message || 'KYC decision failed')

      // Create notification for merchant
      try {
        const merchant = merchants.find(m => m.id === merchantId);
        if (merchant) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert([{
              merchant_id: merchantId,
              type: status === 'approved' ? 'success' : 'error',
              title: status === 'approved' ? 'Account Verified' : 'Verification Rejected',
              message: status === 'approved' 
                ? 'Congratulations! Your account has been verified. You can now use live API keys.'
                : `Your verification has been rejected. Reason: ${notes || 'Not specified'}`,
            }]);
          
          if (notifError) {
            console.error('Error creating notification:', notifError);
            // Don't throw - notification is not critical
          }
        }
      } catch (notifError) {
        console.error('Error in notification creation:', notifError);
      }

      // Verify the update worked by fetching the merchant again
      const { data: updatedMerchant, error: verifyError } = await supabase
        .from('merchants')
        .select('id, verification_status, verification_notes')
        .eq('id', merchantId)
        .single();

      if (verifyError) {
        console.error('Error verifying update:', verifyError);
      } else {
        console.log('✅ Verification successful! Updated merchant:', updatedMerchant);
        if (updatedMerchant.verification_status !== status) {
          console.error('❌ Status mismatch! Expected:', status, 'Got:', updatedMerchant.verification_status);
          alert('⚠️ Warning: Status update may not have been saved. Please refresh and check again.');
        }
      }

      // Reload merchants to get fresh data
      await loadMerchants();
      
      setShowModal(false);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectingMerchantId(null);
      
      alert(`Merchant ${status === 'approved' ? 'approved' : 'rejected'} successfully! The status has been updated.`);
    } catch (error) {
      console.error('❌ Error updating merchant:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // Check if it's an RLS policy error
      if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('policy')) {
        alert(
          '❌ Permission Denied!\n\n' +
          'The database policy is blocking the update.\n\n' +
          '🔧 FIX: Run the SQL script in FIX_ADMIN_UPDATE_MERCHANTS.sql\n' +
          '1. Go to Supabase SQL Editor\n' +
          '2. Copy the SQL from FIX_ADMIN_UPDATE_MERCHANTS.sql\n' +
          '3. Run it\n' +
          '4. Try again\n\n' +
          'Error: ' + error.message
        );
      } else {
        alert('Error updating merchant: ' + error.message + '\n\nCheck the browser console for details.');
      }
    }
  };

  const handleRejectClick = (merchantId) => {
    setRejectingMerchantId(merchantId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    if (rejectingMerchantId) {
      await handleVerification(rejectingMerchantId, 'rejected', rejectReason.trim());
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || styles.pending;
  };

  const filteredMerchants = merchants.filter(m =>
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout activePage="merchants">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Merchant Management</h1>
            <p className="text-white/60">Manage and verify merchant accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <span className="text-blue-400 font-semibold">{filteredMerchants.length} Merchants</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Merchants Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="text-white/60 mt-4">Loading merchants...</p>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60">No merchants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30 border-b border-white/10">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white/80">Merchant</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white/80">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white/80">Balance</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white/80">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white/80">Joined</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((merchant) => (
                    <tr
                      key={merchant.id}
                      className="border-b border-white/5 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white font-medium">
                            {merchant.business_name || `${merchant.first_name} ${merchant.last_name}`}
                          </p>
                          <p className="text-white/40 text-sm">{merchant.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm capitalize">
                          {merchant.account_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-cyan-400 font-semibold">
                          SSP {parseFloat(merchant.balance || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 border rounded-lg text-sm font-medium ${getStatusBadge(merchant.verification_status)}`}>
                          {merchant.verification_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white/60 text-sm">
                        {new Date(merchant.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setShowModal(true);
                            }}
                            className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {merchant.verification_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerification(merchant.id, 'approved')}
                                className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleRejectClick(merchant.id)}
                                className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Merchant Detail Modal */}
        {showModal && selectedMerchant && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-6">Merchant Details</h2>
              
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Full Name</p>
                      <p className="text-white font-medium">{selectedMerchant.first_name} {selectedMerchant.last_name}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Email</p>
                      <p className="text-white font-medium">{selectedMerchant.email}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Phone</p>
                      <p className="text-white font-medium">{selectedMerchant.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Account Type</p>
                      <p className="text-white font-medium capitalize">{selectedMerchant.account_type}</p>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                {selectedMerchant.account_type === 'business' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/60 text-sm">Business Name</p>
                        <p className="text-white font-medium">{selectedMerchant.business_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Registration Number</p>
                        <p className="text-white font-medium">{selectedMerchant.business_registration_number || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-white/60 text-sm">Address</p>
                        <p className="text-white font-medium">{selectedMerchant.business_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Financial Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Balance</p>
                      <p className="text-cyan-400 font-bold text-xl">SSP {parseFloat(selectedMerchant.balance || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Total Transactions</p>
                      <p className="text-white font-medium">{selectedMerchant.total_transactions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedMerchant.verification_status === 'rejected' && selectedMerchant.verification_notes && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <h4 className="text-red-400 font-semibold mb-2">Rejection Reason</h4>
                    <p className="text-white/80 text-sm">{selectedMerchant.verification_notes}</p>
                  </div>
                )}

                {/* Documents */}
                {selectedMerchant.documents && selectedMerchant.documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Uploaded Documents</h3>
                    <div className="space-y-2">
                      {selectedMerchant.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="text-cyan-400" size={20} />
                            <div>
                              <p className="text-white font-medium">{doc.name || `Document ${index + 1}`}</p>
                              <p className="text-white/60 text-xs">
                                {doc.type} • {doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60 mr-2">
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                            </span>
                            <button
                              onClick={() => { setViewingDoc(doc); setShowDocModal(true); }}
                              className="px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-all text-xs font-semibold"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedMerchant.verification_status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleVerification(selectedMerchant.id, 'approved')}
                      className="flex-1 px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all font-semibold"
                    >
                      Approve Merchant
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        handleRejectClick(selectedMerchant.id);
                      }}
                      className="flex-1 px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-semibold"
                    >
                      Reject Merchant
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => {
            setShowRejectModal(false);
            setRejectReason('');
            setRejectingMerchantId(null);
          }}>
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-4">Reject Merchant Verification</h2>
              
              <div className="space-y-4 mb-6">
                <p className="text-white/80">
                  Please provide a reason for rejecting this merchant's verification. This reason will be shown to the merchant.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Rejection Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Documents are unclear, Missing required documents, Information mismatch, etc."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    rows="4"
                    required
                  />
                  <p className="text-xs text-white/60 mt-1">
                    This reason will be visible to the merchant and they can resubmit after addressing the issues.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setRejectingMerchantId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  Reject Merchant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {showDocModal && viewingDoc && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowDocModal(false); setViewingDoc(null); }}>
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">{viewingDoc.name}</h2>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                {viewingDoc.type === 'application/pdf' ? (
                  <iframe title={viewingDoc.name} src={viewingDoc.data} className="w-full h-[70vh]" />
                ) : (
                  <img alt={viewingDoc.name} src={viewingDoc.data} className="max-h-[70vh] w-auto mx-auto" />
                )}
              </div>
              <button
                onClick={() => { setShowDocModal(false); setViewingDoc(null); }}
                className="mt-6 w-full px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMerchants;
