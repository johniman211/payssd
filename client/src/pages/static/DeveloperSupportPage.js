import React, { useState } from 'react';
import { CodeBracketIcon, BookOpenIcon, ChatBubbleLeftRightIcon, BugAntIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const DeveloperSupportPage = () => {
  const [selectedTab, setSelectedTab] = useState('documentation');

  const tabs = [
    { id: 'documentation', name: 'Documentation', icon: BookOpenIcon },
    { id: 'support', name: 'Support', icon: ChatBubbleLeftRightIcon },
    { id: 'tools', name: 'Developer Tools', icon: CodeBracketIcon },
    { id: 'status', name: 'API Status', icon: CheckCircleIcon }
  ];

  const documentationSections = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running with PaySSD API in minutes',
      items: [
        'Account Setup',
        'API Key Generation',
        'First API Call',
        'Testing Environment'
      ]
    },
    {
      title: 'API Reference',
      description: 'Complete API documentation with examples',
      items: [
        'Authentication',
        'Payment Links',
        'Webhooks',
        'Error Handling'
      ]
    },
    {
      title: 'SDKs & Libraries',
      description: 'Official SDKs for popular programming languages',
      items: [
        'JavaScript/Node.js',
        'Python',
        'PHP',
        'Java'
      ]
    },
    {
      title: 'Integration Guides',
      description: 'Step-by-step integration tutorials',
      items: [
        'E-commerce Platforms',
        'Mobile Applications',
        'Custom Integrations',
        'Webhook Setup'
      ]
    }
  ];

  const supportChannels = [
    {
      title: 'Developer Chat',
      description: 'Real-time chat with our developer support team',
      availability: '24/7',
      responseTime: 'Instant',
      icon: ChatBubbleLeftRightIcon,
      color: 'blue'
    },
    {
      title: 'GitHub Issues',
      description: 'Report bugs and request features on GitHub',
      availability: 'Always open',
      responseTime: '< 24 hours',
      icon: BugAntIcon,
      color: 'green'
    },
    {
      title: 'Developer Forum',
      description: 'Community-driven support and discussions',
      availability: '24/7',
      responseTime: 'Community driven',
      icon: BookOpenIcon,
      color: 'purple'
    },
    {
      title: 'Email Support',
      description: 'Direct email support for complex technical issues',
      availability: 'Business hours',
      responseTime: '< 4 hours',
      icon: ChatBubbleLeftRightIcon,
      color: 'orange'
    }
  ];

  const developerTools = [
    {
      name: 'API Explorer',
      description: 'Interactive API testing tool',
      features: ['Test endpoints', 'View responses', 'Generate code samples'],
      status: 'Available'
    },
    {
      name: 'Webhook Tester',
      description: 'Test and debug webhook integrations',
      features: ['Simulate events', 'Debug payloads', 'Monitor delivery'],
      status: 'Available'
    },
    {
      name: 'SDK Generator',
      description: 'Generate custom SDKs for your language',
      features: ['Multiple languages', 'Custom configurations', 'Auto-updates'],
      status: 'Beta'
    },
    {
      name: 'Postman Collection',
      description: 'Ready-to-use Postman collection',
      features: ['All endpoints', 'Example requests', 'Environment setup'],
      status: 'Available'
    }
  ];

  const apiStatus = {
    overall: 'Operational',
    uptime: '99.99%',
    services: [
      { name: 'Payment API', status: 'Operational', uptime: '99.99%' },
      { name: 'Webhook Delivery', status: 'Operational', uptime: '99.98%' },
      { name: 'Dashboard', status: 'Operational', uptime: '99.97%' },
      { name: 'Authentication', status: 'Operational', uptime: '100%' }
    ],
    incidents: [
      {
        date: '2024-01-10',
        title: 'Brief API latency increase',
        status: 'Resolved',
        duration: '15 minutes'
      },
      {
        date: '2024-01-05',
        title: 'Webhook delivery delays',
        status: 'Resolved',
        duration: '30 minutes'
      }
    ]
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'documentation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {documentationSections.map((section, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                  View Documentation →
                </button>
              </div>
            ))}
          </div>
        );

      case 'support':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportChannels.map((channel, index) => {
              const IconComponent = channel.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg bg-${channel.color}-100 mr-4`}>
                      <IconComponent className={`h-6 w-6 text-${channel.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {channel.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {channel.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Availability:</span>
                          <span className="font-medium">{channel.availability}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Response Time:</span>
                          <span className="font-medium">{channel.responseTime}</span>
                        </div>
                      </div>
                      <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Support
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'tools':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {developerTools.map((tool, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tool.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tool.status === 'Available' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {tool.description}
                </p>
                <ul className="space-y-1 mb-4">
                  {tool.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Access Tool
                </button>
              </div>
            ))}
          </div>
        );

      case 'status':
        return (
          <div className="space-y-8">
            {/* Overall Status */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Overall Status</h3>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-600 font-medium">{apiStatus.overall}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {apiStatus.uptime}
              </div>
              <p className="text-gray-600">Uptime over the last 30 days</p>
            </div>

            {/* Service Status */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h3>
              <div className="space-y-4">
                {apiStatus.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-medium">{service.status}</div>
                      <div className="text-sm text-gray-500">{service.uptime} uptime</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Incidents</h3>
              <div className="space-y-4">
                {apiStatus.incidents.map((incident, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{incident.title}</h4>
                        <p className="text-sm text-gray-600">{incident.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {incident.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{incident.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Developer Support
            </h1>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              Everything you need to build amazing payment experiences
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">99.99%</div>
              <div className="text-gray-600">API Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">&lt; 100ms</div>
              <div className="text-gray-600">Average Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Developer Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10k+</div>
              <div className="text-gray-600">Active Developers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderTabContent()}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start building?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust PaySSD for their payment processing needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Get API Keys
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSupportPage;