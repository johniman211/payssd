import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const Transactions = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile?.id) {
      loadTransactions();
    }
  }, [profile, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SSP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      failed: 'text-red-600 bg-red-50',
      cancelled: 'text-gray-600 bg-gray-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Transactions</h1>
          <p className="text-secondary-600">View and manage all your transactions</p>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search by reference, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors">
              <Download size={20} />
              <span>Export</span>
            </button>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-secondary-600 mb-2">No transactions found</p>
              <p className="text-sm text-secondary-500">
                {searchTerm ? 'Try adjusting your search' : 'Your transactions will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-secondary-900">{tx.transaction_reference}</div>
                        <div className="text-xs text-secondary-500">{tx.environment}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-secondary-900">{tx.customer_name || 'N/A'}</div>
                        <div className="text-xs text-secondary-500">{tx.customer_email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-secondary-900">{formatCurrency(tx.amount)}</div>
                        <div className="text-xs text-secondary-500">Fee: {formatCurrency(tx.platform_fee)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-secondary-600 capitalize">
                          {tx.payment_method?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary-600">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                          <Eye size={16} className="text-secondary-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;


