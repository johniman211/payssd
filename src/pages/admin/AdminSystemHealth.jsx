import React, { useState, useEffect } from 'react';
import { Server, Database, Cpu, HardDrive, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/AdminLayout';

const AdminSystemHealth = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    serverUptime: 99.98,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    databaseConnections: 12,
    transactionQueue: 3,
    errorRate: 0.02,
  });

  const [uptimeData, setUptimeData] = useState([]);
  const [cpuData, setCpuData] = useState([]);

  useEffect(() => {
    // Generate mock data
    generateMockData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        databaseConnections: Math.max(5, Math.min(20, prev.databaseConnections + Math.floor(Math.random() * 3 - 1))),
        transactionQueue: Math.max(0, Math.min(10, prev.transactionQueue + Math.floor(Math.random() * 3 - 1))),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateMockData = () => {
    // Generate uptime data for last 30 days
    const uptime = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      uptime.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uptime: 99.5 + Math.random() * 0.5,
      });
    }
    setUptimeData(uptime);

    // Generate CPU usage data for last 24 hours
    const cpu = [];
    for (let i = 23; i >= 0; i--) {
      cpu.push({
        hour: `${i}:00`,
        cpu: 30 + Math.random() * 40,
        memory: 50 + Math.random() * 30,
      });
    }
    setCpuData(cpu);
  };

  const getHealthStatus = (value, thresholds) => {
    if (value < thresholds.warning) {
      return { color: 'green', status: 'Healthy', icon: CheckCircle };
    } else if (value < thresholds.critical) {
      return { color: 'yellow', status: 'Warning', icon: AlertTriangle };
    } else {
      return { color: 'red', status: 'Critical', icon: AlertTriangle };
    }
  };

  const cpuHealth = getHealthStatus(systemMetrics.cpuUsage, { warning: 70, critical: 90 });
  const memoryHealth = getHealthStatus(systemMetrics.memoryUsage, { warning: 80, critical: 95 });
  const diskHealth = getHealthStatus(systemMetrics.diskUsage, { warning: 80, critical: 90 });

  return (
    <AdminLayout activePage="system-health">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Health</h1>
          <p className="text-gray-400 mt-1">Monitor system performance and uptime</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Server className="text-white" size={28} />
            <Activity className="text-white/60" size={20} />
          </div>
          <p className="text-white/80 text-sm mb-1">Server Uptime</p>
          <p className="text-3xl font-bold text-white">{systemMetrics.serverUptime}%</p>
          <p className="text-white/60 text-xs mt-2">Last 30 days</p>
        </div>

        <div className={`bg-gray-800 rounded-xl p-6 border ${cpuHealth.color === 'green' ? 'border-green-500/30' : cpuHealth.color === 'yellow' ? 'border-yellow-500/30' : 'border-red-500/30'} hover:border-${cpuHealth.color}-500 transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <Cpu className={`text-${cpuHealth.color}-400`} size={28} />
            <cpuHealth.icon className={`text-${cpuHealth.color}-400`} size={20} />
          </div>
          <p className="text-gray-400 text-sm mb-1">CPU Usage</p>
          <p className="text-3xl font-bold text-white">{systemMetrics.cpuUsage.toFixed(1)}%</p>
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-${cpuHealth.color}-400 h-2 rounded-full transition-all duration-500`}
              style={{ width: `${systemMetrics.cpuUsage}%` }}
            ></div>
          </div>
        </div>

        <div className={`bg-gray-800 rounded-xl p-6 border ${memoryHealth.color === 'green' ? 'border-green-500/30' : memoryHealth.color === 'yellow' ? 'border-yellow-500/30' : 'border-red-500/30'} hover:border-${memoryHealth.color}-500 transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <HardDrive className={`text-${memoryHealth.color}-400`} size={28} />
            <memoryHealth.icon className={`text-${memoryHealth.color}-400`} size={20} />
          </div>
          <p className="text-gray-400 text-sm mb-1">Memory Usage</p>
          <p className="text-3xl font-bold text-white">{systemMetrics.memoryUsage.toFixed(1)}%</p>
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-${memoryHealth.color}-400 h-2 rounded-full transition-all duration-500`}
              style={{ width: `${systemMetrics.memoryUsage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Database className="text-primary-400" size={28} />
            <Activity className="text-primary-400" size={20} />
          </div>
          <p className="text-gray-400 text-sm mb-1">DB Connections</p>
          <p className="text-3xl font-bold text-white">{systemMetrics.databaseConnections}</p>
          <p className="text-gray-400 text-xs mt-2">Active connections</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Disk Usage</span>
            <span className={`text-${diskHealth.color}-400 font-semibold`}>{systemMetrics.diskUsage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-${diskHealth.color}-400 h-2 rounded-full transition-all`}
              style={{ width: `${systemMetrics.diskUsage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Transaction Queue</p>
              <p className="text-2xl font-bold text-white mt-1">{systemMetrics.transactionQueue}</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${systemMetrics.transactionQueue < 5 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {systemMetrics.transactionQueue < 5 ? 'Normal' : 'High'}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Error Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{systemMetrics.errorRate}%</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
              Excellent
            </div>
          </div>
        </div>
      </div>

      {/* Uptime Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Uptime (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={uptimeData}>
            <defs>
              <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis domain={[99, 100]} stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Area type="monotone" dataKey="uptime" stroke="#10B981" fill="url(#uptimeGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CPU & Memory Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">CPU & Memory Usage (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={cpuData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Line type="monotone" dataKey="cpu" stroke="#6366F1" strokeWidth={2} name="CPU" />
            <Line type="monotone" dataKey="memory" stroke="#EC4899" strokeWidth={2} name="Memory" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* System Services Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'API Server', status: 'online', uptime: '99.99%' },
            { name: 'Database', status: 'online', uptime: '99.98%' },
            { name: 'Payment Gateway', status: 'online', uptime: '99.95%' },
            { name: 'Email Service', status: 'online', uptime: '99.90%' },
            { name: 'SMS Service', status: 'online', uptime: '99.85%' },
            { name: 'Webhook Delivery', status: 'online', uptime: '99.92%' },
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${service.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-white font-medium">{service.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Uptime</div>
                <div className="text-sm font-semibold text-white">{service.uptime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminSystemHealth;

