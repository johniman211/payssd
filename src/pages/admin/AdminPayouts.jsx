import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { DollarSign, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payouts')
        .select('*, merchants(business_name, email, phone)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPayouts(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(p => p.status === 'pending').length,
      completed: data.filter(p => p.status === 'completed').length,
      failed: data.filter(p => p.status === 'failed').length,
      totalAmount: data.reduce((sum, p) => sum + (p.amount || 0), 0),
    };
    setStats(stats);
  };

  const handlePayoutAction = async (payoutId, action) => {
    setProcessingId(payoutId);
    try {
      const newStatus = action === 'approve' ? 'completed' : 'failed';
      
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: newStatus,
          processed_at: new Date().toISOString(),
          notes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
        })
        .eq('id', payoutId);

      if (error) throw error;

      // If approved, update merchant balance
      if (action === 'approve') {
        const payout = payouts.find(p => p.id === payoutId);
        if (payout) {
          await supabase.rpc('update_merchant_balance', {
            p_merchant_id: payout.merchant_id,
            p_amount: -payout.amount
          });
        }
      }

      // Refresh data
      await fetchPayouts();
      alert(`Payout ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const icons = {
      completed: <CheckCircle size={14} />,
      pending: <Clock size={14} />,
      failed: <XCircle size={14} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout activePage="payouts">
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Payouts</h1>
        <p className="text-gray-400 mt-1">Manage merchant withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Payouts</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl p-6">
          <div>
            <p className="text-white/80 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-white mt-1">SSP {stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <DollarSign size={48} className="mb-4 opacity-50" />
            <p>No payout requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Merchant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{payout.merchants?.business_name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{payout.merchants?.email}</p>
                        <p className="text-xs text-gray-400">{payout.merchants?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-white">SSP {payout.amount?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300 capitalize">{payout.payout_method?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{payout.account_number || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">{new Date(payout.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePayoutAction(payout.id, 'approve')}
                            disabled={processingId === payout.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            {processingId === payout.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handlePayoutAction(payout.id, 'reject')}
                            disabled={processingId === payout.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {payout.status !== 'pending' && (
                        <span className="text-sm text-gray-500">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminPayouts;

