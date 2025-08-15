import React, { useState } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const RealtimeStatus = () => {
  const { isConnected, connectionStatus, refreshUserData } = useRealtime();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUserData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Real-time updates active',
          description: 'Your account status will update automatically across all devices'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Using backup sync',
          description: 'Updates may take a few seconds to appear'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Connection issues',
          description: 'Click refresh to update your account status'
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Connecting...',
          description: 'Establishing real-time connection'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${config.bgColor} ${config.borderColor} mb-4`}>
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <div>
          <p className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </p>
          <p className="text-xs text-gray-600">
            {config.description}
          </p>
        </div>
      </div>
      
      {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      )}
    </div>
  );
};

export default RealtimeStatus;