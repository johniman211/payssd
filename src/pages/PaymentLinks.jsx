import React, { useState, useEffect } from 'react';
import { Plus, Copy, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import { publishNotification } from '@/services/notifications';

const PaymentLinks = () => {
  const { profile, loading: authLoading, user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [merchantId, setMerchantId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
  });

  // Try to get merchant ID from profile or fetch it directly
  useEffect(() => {
    const fetchMerchantId = async () => {
      if (profile?.id) {
        setMerchantId(profile.id);
        loadPaymentLinks(profile.id);
      } else if (user?.id && !authLoading) {
        // Fallback: try to fetch merchant profile directly
        try {
          console.log('Profile not loaded, fetching merchant directly...');
          const { data: merchant, error } = await supabase
            .from('merchants')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching merchant:', error);
            if (error.code === 'PGRST116') {
              console.error('No merchant record found for this user. Please complete your merchant profile.');
            }
          } else if (merchant) {
            console.log('Merchant ID found:', merchant.id);
            setMerchantId(merchant.id);
            loadPaymentLinks(merchant.id);
          }
        } catch (error) {
          console.error('Error in fetchMerchantId:', error);
        }
      }
    };

    fetchMerchantId();
  }, [profile, user, authLoading]);

  const loadPaymentLinks = async (merchantIdToUse = null) => {
    const idToUse = merchantIdToUse || merchantId || profile?.id;
    if (!idToUse) {
      console.warn('No merchant ID available to load payment links');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('merchant_id', idToUse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading payment links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Get merchant ID from profile or state
    const idToUse = merchantId || profile?.id;
    
    // Validation
    if (!idToUse) {
      // Try one more time to fetch merchant ID
      if (user?.id) {
        try {
          const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (merchant) {
            setMerchantId(merchant.id);
            // Retry with the fetched ID
            setTimeout(() => {
              document.querySelector('form').requestSubmit();
            }, 100);
            return;
          }
        } catch (error) {
          console.error('Error fetching merchant:', error);
        }
      }
      
      alert('Error: Merchant profile not found. Please ensure you have completed your merchant registration. If this persists, please contact support.');
      return;
    }

    if (!formData.title || !formData.amount) {
      alert('Please fill in all required fields (Title and Amount).');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      // Generate unique link code
      const linkCode = 'PL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      console.log('Creating payment link with:', {
        merchant_id: idToUse,
        title: formData.title,
        description: formData.description,
        amount: amount,
        link_code: linkCode,
      });

      const { data, error } = await supabase
        .from('payment_links')
        .insert([{
          merchant_id: idToUse,
          title: formData.title.trim(),
          description: formData.description?.trim() || null,
          amount: amount,
          link_code: linkCode,
          is_active: true,
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Payment link created successfully:', data);
      
      setShowModal(false);
      setFormData({ title: '', description: '', amount: '' });
      loadPaymentLinks();
      alert('Payment link created successfully!');

      try {
        await publishNotification('payment_link_created', {
          merchant_id: idToUse,
          payload: { title: formData.title, amount }
        })
      } catch {}
    } catch (error) {
      console.error('Error creating payment link:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error creating payment link: ${errorMessage}\n\nPlease check the browser console for more details.`);
    }
  };

  const handleCopy = (linkCode) => {
    const url = `${window.location.origin}/checkout/${linkCode}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment link?')) return;
    
    try {
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPaymentLinks();
    } catch (error) {
      console.error('Error deleting payment link:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SSP',
    }).format(amount);
  };

  // Show diagnostic info if merchant ID not found
  const showDiagnostic = !merchantId && !profile?.id && !authLoading && user?.id;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Payment Links</h1>
            <p className="text-secondary-600">Create and manage payment links</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!merchantId && !profile?.id}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            <span>Create Link</span>
          </button>
        </div>

        {/* Diagnostic Card */}
        {showDiagnostic && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Merchant Profile Not Found</h3>
            <p className="text-yellow-800 mb-4">
              Your merchant profile is not loaded. This might happen if:
            </p>
            <ul className="list-disc list-inside text-yellow-800 mb-4 space-y-1">
              <li>You haven't completed your merchant registration</li>
              <li>Your merchant account wasn't created during signup</li>
              <li>There's a connection issue with the database</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    // Check if merchant exists
                    const { data: merchant, error } = await supabase
                      .from('merchants')
                      .select('id, email, account_type')
                      .eq('user_id', user.id)
                      .single();
                    
                    if (error && error.code === 'PGRST116') {
                      // No merchant found - create one automatically
                      console.log('Creating merchant record for user:', user.id);
                      
                      // Get user metadata for name
                      const firstName = user.user_metadata?.first_name || '';
                      const lastName = user.user_metadata?.last_name || '';
                      const phone = user.user_metadata?.phone || '';
                      
                      const { data: newMerchant, error: createError } = await supabase
                        .from('merchants')
                        .insert([{
                          user_id: user.id,
                          email: user.email || '',
                          account_type: 'personal',
                          first_name: firstName,
                          last_name: lastName,
                          phone: phone,
                          verification_status: 'pending',
                          balance: 0.00,
                        }])
                        .select()
                        .single();
                      
                      if (createError) {
                        console.error('Error creating merchant:', createError);
                        alert('Error creating merchant: ' + createError.message + '\n\nPlease try again or contact support.');
                      } else {
                        console.log('Merchant created successfully:', newMerchant);
                        
                        // Generate sandbox API keys
                        try {
                          await supabase.rpc('generate_api_keys', {
                            p_merchant_id: newMerchant.id,
                            p_key_type: 'sandbox'
                          });
                          console.log('API keys generated');
                        } catch (keyError) {
                          console.warn('Could not generate API keys:', keyError);
                          // Continue anyway - keys can be generated later
                        }
                        
                        setMerchantId(newMerchant.id);
                        alert('✅ Merchant profile created successfully!\n\nYou can now create payment links. The page will refresh in 2 seconds...');
                        setTimeout(() => {
                          window.location.reload();
                        }, 2000);
                      }
                    } else if (merchant) {
                      console.log('Merchant found:', merchant);
                      setMerchantId(merchant.id);
                      alert('✅ Merchant profile found! Refreshing page...');
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    } else if (error) {
                      console.error('Error checking merchant:', error);
                      alert('Error checking merchant status: ' + error.message);
                    }
                  } catch (error) {
                    console.error('Diagnostic error:', error);
                    alert('Error: ' + error.message + '\n\nPlease check the browser console for details.');
                  }
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                🔧 Create Merchant Profile Now
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* Payment Links Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : links.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <p className="text-secondary-600 mb-4">No payment links yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Create Your First Link
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <Card key={link.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <LinkIcon className="text-primary-600" size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    link.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {link.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {link.title}
                </h3>
                <p className="text-sm text-secondary-600 mb-4">
                  {link.description || 'No description'}
                </p>

                <div className="space-y-2 mb-4 pb-4 border-b border-secondary-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Amount:</span>
                    <span className="font-medium text-secondary-900">{formatCurrency(link.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Uses:</span>
                    <span className="font-medium text-secondary-900">{link.current_uses || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(link.link_code)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Copy size={16} />
                    <span className="text-sm font-medium">Copy</span>
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Create Payment Link</h2>
              {!merchantId && !profile?.id && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  <p className="font-semibold mb-2">⚠️ Merchant profile not found</p>
                  <p className="mb-2">This could mean:</p>
                  <ul className="list-disc list-inside mb-2 space-y-1 text-xs">
                    <li>You haven't completed your merchant registration</li>
                    <li>Your merchant account hasn't been created yet</li>
                    <li>There's an issue with your account</li>
                  </ul>
                  <button
                    type="button"
                    onClick={async () => {
                      if (user?.id) {
                        try {
                          const { data: merchant } = await supabase
                            .from('merchants')
                            .select('id')
                            .eq('user_id', user.id)
                            .single();
                          if (merchant) {
                            setMerchantId(merchant.id);
                            alert('Merchant profile found! You can now create payment links.');
                          } else {
                            alert('No merchant record found. Please complete your merchant registration first.');
                          }
                        } catch (error) {
                          alert('Error checking merchant status. Please contact support.');
                        }
                      }
                    }}
                    className="text-xs underline hover:no-underline"
                  >
                    Check merchant status
                  </button>
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (SSP)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentLinks;


