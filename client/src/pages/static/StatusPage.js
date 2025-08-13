import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const StatusPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const overallStatus = {
    status: 'operational',
    message: 'All systems operational',
    lastUpdated: new Date().toISOString()
  };

  const services = [
    {
      name: 'Payment Processing API',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '95ms',
      description: 'Core payment processing functionality'
    },
    {
      name: 'Webhook Delivery',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '120ms',
      description: 'Real-time event notifications'
    },
    {
      name: 'Dashboard & Portal',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '200ms',
      description: 'Merchant dashboard and admin portal'
    },
    {
      name: 'Authentication Service',
      status: 'operational',
      uptime: '100%',
      responseTime: '50ms',
      description: 'User authentication and authorization'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '25ms',
      description: 'Primary database infrastructure'
    },
    {
      name: 'CDN & Static Assets',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '30ms',
      description: 'Content delivery network'
    }
  ];

  const incidents = [
    {
      id: 1,
      title: 'Brief API latency increase',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-10T14:30:00Z',
      endTime: '2024-01-10T14:45:00Z',
      duration: '15 minutes',
      description: 'We experienced a brief increase in API response times due to increased traffic. The issue has been resolved.',
      updates: [
        {
          time: '2024-01-10T14:45:00Z',
          message: 'Issue resolved. API response times have returned to normal.'
        },
        {
          time: '2024-01-10T14:35:00Z',
          message: 'We are investigating increased API response times.'
        },
        {
          time: '2024-01-10T14:30:00Z',
          message: 'We are aware of increased API latency and are investigating.'
        }
      ]
    },
    {
      id: 2,
      title: 'Webhook delivery delays',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-05T09:15:00Z',
      endTime: '2024-01-05T09:45:00Z',
      duration: '30 minutes',
      description: 'Some webhooks experienced delivery delays. All delayed webhooks have been successfully delivered.',
      updates: [
        {
          time: '2024-01-05T09:45:00Z',
          message: 'All delayed webhooks have been delivered. Service is fully operational.'
        },
        {
          time: '2024-01-05T09:20:00Z',
          message: 'We are working to deliver delayed webhooks and prevent further delays.'
        },
        {
          time: '2024-01-05T09:15:00Z',
          message: 'We are investigating reports of webhook delivery delays.'
        }
      ]
    },
    {
      id: 3,
      title: 'Scheduled maintenance completed',
      status: 'resolved',
      severity: 'maintenance',
      startTime: '2024-01-01T02:00:00Z',
      endTime: '2024-01-01T04:00:00Z',
      duration: '2 hours',
      description: 'Scheduled maintenance to upgrade our infrastructure was completed successfully.',
      updates: [
        {
          time: '2024-01-01T04:00:00Z',
          message: 'Maintenance completed successfully. All services are operational.'
        },
        {
          time: '2024-01-01T02:00:00Z',
          message: 'Scheduled maintenance has begun. Some services may be temporarily unavailable.'
        }
      ]
    }
  ];

  const metrics = {
    uptime: {
      '24h': '100%',
      '7d': '99.98%',
      '30d': '99.97%',
      '90d': '99.96%'
    },
    responseTime: {
      current: '95ms',
      average: '102ms',
      p95: '180ms',
      p99: '250ms'
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'outage':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PaySSD Status</h1>
              <p className="text-gray-600 mt-1">Real-time status and performance metrics</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-lg font-medium text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              {getStatusIcon(overallStatus.status)}
              <div className="ml-3">
                <h2 className={`text-xl font-semibold ${getStatusColor(overallStatus.status)}`}>
                  {overallStatus.message}
                </h2>
                <p className="text-gray-600">
                  All systems are currently operational
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Status</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(service.status)}
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{service.uptime}</div>
                        <div className="text-gray-500">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{service.responseTime}</div>
                        <div className="text-gray-500">Response</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Uptime Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uptime</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 24 hours</span>
                  <span className="font-medium">{metrics.uptime['24h']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 7 days</span>
                  <span className="font-medium">{metrics.uptime['7d']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 30 days</span>
                  <span className="font-medium">{metrics.uptime['30d']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 90 days</span>
                  <span className="font-medium">{metrics.uptime['90d']}</span>
                </div>
              </div>
            </div>

            {/* Response Time Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current</span>
                  <span className="font-medium">{metrics.responseTime.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average</span>
                  <span className="font-medium">{metrics.responseTime.average}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">95th percentile</span>
                  <span className="font-medium">{metrics.responseTime.p95}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">99th percentile</span>
                  <span className="font-medium">{metrics.responseTime.p99}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident History */}
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Incidents</h2>
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {incident.title}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {incident.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Resolved
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Duration:</span> {incident.duration} • 
                  <span className="font-medium">Started:</span> {new Date(incident.startTime).toLocaleString()}
                </div>

                <div className="border-l-2 border-gray-200 pl-4">
                  <h4 className="font-medium text-gray-900 mb-2">Updates</h4>
                  <div className="space-y-2">
                    {incident.updates.map((update, updateIndex) => (
                      <div key={updateIndex} className="text-sm">
                        <div className="text-gray-500">
                          {new Date(update.time).toLocaleString()}
                        </div>
                        <div className="text-gray-700">
                          {update.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscribe to Updates */}
      <div className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Informed
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to status updates and get notified about incidents and maintenance
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;