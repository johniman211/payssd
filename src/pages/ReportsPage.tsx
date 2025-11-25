import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, Calendar, TrendingUp, DollarSign, CreditCard } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const dailyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, transactions: 0 };
      }
      if (transaction.status === 'successful') {
        acc[date].revenue += transaction.amount;
        acc[date].transactions += 1;
      }
      return acc;
    }, {} as Record<string, { date: string; revenue: number; transactions: number }>);

    return Object.values(dailyData).slice(-7);
  };

  const getStatusData = () => {
    const statusCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.status] = (acc[transaction.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      status
    }));
  };

  const getPaymentMethodData = () => {
    const methodCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.payment_method] = (acc[transaction.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method,
      value: count
    }));
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Amount', 'Currency', 'Status', 'Payment Method'];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.amount,
      t.currency,
      t.status,
      t.payment_method
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = {
    successful: '#10B981',
    failed: '#EF4444',
    pending: '#F59E0B',
    refunded: '#6B7280'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed insights into your payment processing</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Transaction Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getStatusData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {getStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {transactions.length} transactions found
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: transaction.currency || 'NGN'
                      }).format(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'successful' ? 'text-green-800 bg-green-100' :
                        transaction.status === 'failed' ? 'text-red-800 bg-red-100' :
                        transaction.status === 'pending' ? 'text-yellow-800 bg-yellow-100' :
                        'text-gray-800 bg-gray-100'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.payment_method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}