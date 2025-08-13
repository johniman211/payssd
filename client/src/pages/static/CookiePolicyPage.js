import React, { useState } from 'react';
import { CakeIcon, CogIcon, ShieldCheckIcon, EyeIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const CookiePolicyPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const lastUpdated = 'January 15, 2024';

  const cookieTypes = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      icon: ShieldCheckIcon,
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      examples: [
        'Authentication tokens',
        'Security cookies',
        'Load balancing cookies',
        'Session management'
      ],
      retention: 'Session or up to 1 year',
      canDisable: false
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      icon: CogIcon,
      description: 'These cookies enable enhanced functionality and personalization.',
      examples: [
        'Language preferences',
        'Theme settings',
        'Dashboard customization',
        'Form data retention'
      ],
      retention: 'Up to 2 years',
      canDisable: true
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      icon: ChartBarIcon,
      description: 'These cookies help us understand how visitors interact with our website.',
      examples: [
        'Google Analytics',
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring'
      ],
      retention: 'Up to 2 years',
      canDisable: true
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      icon: UserGroupIcon,
      description: 'These cookies are used to deliver relevant advertisements and track campaign effectiveness.',
      examples: [
        'Ad targeting cookies',
        'Social media pixels',
        'Conversion tracking',
        'Retargeting cookies'
      ],
      retention: 'Up to 1 year',
      canDisable: true
    }
  ];

  const thirdPartyServices = [
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and user behavior tracking',
      cookies: ['_ga', '_gid', '_gat'],
      retention: '2 years',
      optOut: 'https://tools.google.com/dlpage/gaoptout'
    },
    {
      name: 'Stripe',
      purpose: 'Payment processing and fraud prevention',
      cookies: ['__stripe_mid', '__stripe_sid'],
      retention: '1 year',
      optOut: 'Contact Stripe directly'
    },
    {
      name: 'Intercom',
      purpose: 'Customer support and live chat',
      cookies: ['intercom-*'],
      retention: '10 months',
      optOut: 'Disable in chat widget settings'
    },
    {
      name: 'Hotjar',
      purpose: 'User experience analytics and heatmaps',
      cookies: ['_hjid', '_hjSessionUser_*'],
      retention: '1 year',
      optOut: 'https://www.hotjar.com/legal/compliance/opt-out'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: EyeIcon },
    { id: 'types', name: 'Cookie Types', icon: CakeIcon },
    { id: 'third-party', name: 'Third-Party Services', icon: UserGroupIcon },
    { id: 'manage', name: 'Manage Cookies', icon: CogIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CakeIcon className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Cookie Policy
            </h1>
            <p className="mt-4 text-xl text-blue-200 max-w-2xl mx-auto">
              Learn about how we use cookies and similar technologies to improve your experience.
            </p>
            <div className="mt-6 text-blue-300">
              <p>Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
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

      {/* Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Cookies are small text files that are stored on your device when you visit our website. 
                    They help us provide you with a better experience by remembering your preferences, 
                    keeping you logged in, and helping us understand how you use our services.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    We use cookies and similar technologies (such as web beacons, pixels, and local storage) 
                    to enhance your experience, provide our services, and improve our platform.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Use Cookies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <ShieldCheckIcon className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Security & Authentication</h3>
                    <p className="text-gray-700">
                      Keep your account secure and maintain your login session across pages.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <CogIcon className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Functionality</h3>
                    <p className="text-gray-700">
                      Remember your preferences and settings to provide a personalized experience.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                    <p className="text-gray-700">
                      Understand how our website is used to improve performance and user experience.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-6">
                    <UserGroupIcon className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing</h3>
                    <p className="text-gray-700">
                      Deliver relevant content and measure the effectiveness of our campaigns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start">
                  <CakeIcon className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Your Control</h3>
                    <p className="text-yellow-700">
                      You can control and manage cookies through your browser settings or our cookie preference center. 
                      However, disabling certain cookies may affect the functionality of our website.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cookie Types Tab */}
          {activeTab === 'types' && (
            <div className="space-y-6">
              {cookieTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.id} className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center mb-6">
                      <IconComponent className="h-8 w-8 text-gray-600 mr-3" />
                      <h2 className="text-2xl font-bold text-gray-900">{type.name}</h2>
                      {!type.canDisable && (
                        <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-6">{type.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
                        <ul className="space-y-2">
                          {type.examples.map((example, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <strong>Retention:</strong> {type.retention}
                          </p>
                          <p className="text-gray-700">
                            <strong>Can be disabled:</strong> {type.canDisable ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Third-Party Services Tab */}
          {activeTab === 'third-party' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
                <p className="text-gray-700 mb-8">
                  We use third-party services that may set their own cookies. Here's information about 
                  the main services we use and how you can opt out if desired.
                </p>
                <div className="space-y-6">
                  {thirdPartyServices.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          Third-party
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{service.purpose}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cookies Set</h4>
                          <div className="space-y-1">
                            {service.cookies.map((cookie, cookieIndex) => (
                              <code key={cookieIndex} className="block text-sm bg-gray-100 px-2 py-1 rounded">
                                {cookie}
                              </code>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Retention</h4>
                          <p className="text-gray-700">{service.retention}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Opt Out</h4>
                          {service.optOut.startsWith('http') ? (
                            <a
                              href={service.optOut}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Opt-out page
                            </a>
                          ) : (
                            <p className="text-gray-700">{service.optOut}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manage Cookies Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Manage Your Cookie Preferences</h2>
                <p className="text-gray-700 mb-8">
                  You have several options to control how cookies are used on our website. Choose the method 
                  that works best for you.
                </p>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie Preference Center</h3>
                    <p className="text-gray-700 mb-4">
                      Use our cookie preference center to enable or disable specific types of cookies.
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Open Cookie Settings
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Browser Settings</h3>
                    <p className="text-gray-700 mb-4">
                      You can also manage cookies through your browser settings. Here are links to cookie 
                      management pages for popular browsers:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">Chrome</a>
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">Firefox</a>
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">Safari</a>
                      <a href="#" className="text-blue-600 hover:text-blue-800 underline">Edge</a>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Notes</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Disabling essential cookies may prevent you from using certain features of our website.
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Your cookie preferences are stored locally and may need to be reset if you clear your browser data.
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Some third-party cookies require separate opt-out procedures through the service provider.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Do Not Track</h2>
                <p className="text-gray-700 mb-4">
                  Some browsers include a "Do Not Track" feature that lets you tell websites you don't want 
                  to be tracked. Currently, there is no standard for how websites should respond to these signals.
                </p>
                <p className="text-gray-700">
                  We respect your privacy choices and provide clear options for managing your cookie preferences 
                  through our cookie preference center and this policy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Questions About Cookies?
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              If you have any questions about our use of cookies, please contact us.
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> privacy@payssd.com</p>
              <p><strong>Address:</strong> 123 Payment Street, Tech City, TC 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;