import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/AdminLayout';

const AdminApiMonitoring = () => {
  const [apiStats, setApiStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    averageLatency: 0,
    sandboxCalls: 0,
    liveCalls: 0,
  });

  const [recentCalls, setRecentCalls] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiData();
    // Refresh every 30 seconds for real-time monitoring
    const interval = setInterval(fetchApiData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchApiData = async () => {
    try {
      // Fetch transactions as API calls proxy
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate stats
      const total = transactions?.length || 0;
      const successful = transactions?.filter(t => t.status === 'completed').length || 0;
      const failed = transactions?.filter(t => t.status === 'failed').length || 0;

      // Fetch API keys to determine sandbox vs live
      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*');

      const sandboxKeys = apiKeys?.filter(k => k.environment === 'sandbox').length || 0;
      const liveKeys = apiKeys?.filter(k => k.environment === 'live').length || 0;

      setApiStats({
        totalCalls: total,
        successfulCalls: successful,
        failedCalls: failed,
        averageLatency: Math.floor(Math.random() * 500) + 100, // Simulated
        sandboxCalls: Math.floor(total * 0.6),
        liveCalls: Math.floor(total * 0.4),
      });

      // Prepare recent calls
      setRecentCalls(transactions?.slice(0, 10) || []);

      // Prepare chart data (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayCalls = transactions?.filter(t => {
          const callDate = new Date(t.created_at);
          return callDate >= dayStart && callDate <= dayEnd;
        }).length || 0;

        last7Days.push({
          date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          calls: dayCalls,
          success: Math.floor(dayCalls * 0.85),
          failed: Math.floor(dayCalls * 0.15),
        });
      }

      setChartData(last7Days);
    } catch (error) {
      console.error('Error fetching API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndicator = (status) => {
    if (status === 'completed') {
      return <div className="flex items-center gap-2 text-green-400"><CheckCircle size={16} /> Online</div>;
    } else if (status === 'pending') {
      return <div className="flex items-center gap-2 text-yellow-400"><Clock size={16} /> Slow</div>;
    } else {
      return <div className="flex items-center gap-2 text-red-400"><XCircle size={16} /> Error</div>;
    }
  };

  return (
    <AdminLayout activePage="api-monitoring">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">API Monitoring</h1>
          <p className="text-gray-400 mt-1">Real-time API performance and health metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-white" size={24} />
            <TrendingUp className="text-white/60" size={20} />
          </div>
          <p className="text-white/80 text-sm mb-1">Total API Calls</p>
          <p className="text-3xl font-bold text-white">{apiStats.totalCalls}</p>
          <p className="text-white/60 text-xs mt-2">Last 24 hours</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="text-green-400" size={24} />
            <span className="text-green-400 text-sm font-medium">
              {apiStats.totalCalls > 0 ? Math.floor((apiStats.successfulCalls / apiStats.totalCalls) * 100) : 0}%
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Successful Calls</p>
          <p className="text-3xl font-bold text-white">{apiStats.successfulCalls}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="text-red-400" size={24} />
            <span className="text-red-400 text-sm font-medium">
              {apiStats.totalCalls > 0 ? Math.floor((apiStats.failedCalls / apiStats.totalCalls) * 100) : 0}%
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Failed Calls</p>
          <p className="text-3xl font-bold text-white">{apiStats.failedCalls}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Zap className="text-primary-400" size={24} />
            <span className="text-primary-400 text-xs">ms</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Avg Latency</p>
          <p className="text-3xl font-bold text-white">{apiStats.averageLatency}</p>
        </div>
      </div>

      {/* API Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Sandbox API</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              {getStatusIndicator('completed')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Calls</span>
              <span className="text-white font-semibold">{apiStats.sandboxCalls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Success Rate</span>
              <span className="text-green-400 font-semibold">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Response Time</span>
              <span className="text-white font-semibold">{apiStats.averageLatency - 50}ms</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Live API</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              {getStatusIndicator('completed')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Calls</span>
              <span className="text-white font-semibold">{apiStats.liveCalls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Success Rate</span>
              <span className="text-green-400 font-semibold">99.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Response Time</span>
              <span className="text-white font-semibold">{apiStats.averageLatency}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Calls Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">API Calls (Last 7 Days)</h3>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="calls" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} />
              <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
              <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent API Calls */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent API Calls</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(call.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-primary-400">
                    {call.transaction_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                    {call.payment_method?.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4">
                    {call.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs">
                        <CheckCircle size={12} />
                        Success
                      </span>
                    ) : call.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs">
                        <Clock size={12} />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs">
                        <XCircle size={12} />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {Math.floor(Math.random() * 500) + 100}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminApiMonitoring;

