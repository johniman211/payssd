import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, TrendingDown } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import { publishNotification } from '@/services/notifications';

const Payouts = () => {
  const { profile } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    notes: '',
  });

  useEffect(() => {
    if (profile?.id) {
      loadPayouts();
    }
  }, [profile]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(formData.amount);
      if (amount > profile.balance) {
        alert('Insufficient balance');
        return;
      }

      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: { merchant_id: profile.id, amount }
      })
      if (error || !data?.ok) throw new Error(error?.message || 'Payout request failed')
      
      setShowModal(false);
      setFormData({ amount: '', notes: '' });
      loadPayouts();
      alert('Payout requested successfully!');
      try {
        await publishNotification('payout_requested', {
          merchant_id: profile.id,
          payload: { amount }
        })
      } catch {}
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Error requesting payout');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SSP',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600 bg-green-50',
      approved: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      rejected: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Payouts</h1>
            <p className="text-secondary-600">Request withdrawals to your bank or mobile money</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!profile?.balance || profile.balance <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            <span>Request Payout</span>
          </button>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-8 shadow-stripe-xl">
          <div className="absolute top-0 right-0 opacity-10">
            <DollarSign size={200} />
          </div>
          <div className="relative z-10">
            <div className="text-5xl font-bold text-white mb-2">
              {formatCurrency(profile?.balance || 0)}
            </div>
            <div className="text-white/90 text-lg font-medium mb-4">
              Available Balance
            </div>
            <div className="text-white/80 text-sm">
              Ready for withdrawal
            </div>
          </div>
        </div>

        {/* Payouts History */}
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Payout History</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-secondary-600 mb-2">No payouts yet</p>
              <p className="text-sm text-secondary-500">Request a payout to see your withdrawal history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Destination</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Requested</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-secondary-900">{formatCurrency(payout.amount)}</div>
                        {payout.notes && <div className="text-xs text-secondary-500">{payout.notes}</div>}
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600 capitalize">
                        {payout.destination_type?.replace('_', ' ')}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600">
                        {payout.processed_at ? new Date(payout.processed_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Request Payout</h2>
              
              <div className="mb-6 p-4 bg-secondary-50 rounded-xl">
                <p className="text-sm text-secondary-600">Available Balance</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(profile?.balance || 0)}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (SSP)</label>
                  <input
                    type="number"
                    step="0.01"
                    max={profile?.balance}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
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
                    Submit Request
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

export default Payouts;


