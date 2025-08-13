import React, { useState } from 'react';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon, BookOpenIcon, ChatBubbleLeftRightIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpenIcon },
    { id: 'getting-started', name: 'Getting Started', icon: QuestionMarkCircleIcon },
    { id: 'payments', name: 'Payments', icon: BookOpenIcon },
    { id: 'api', name: 'API & Integration', icon: BookOpenIcon },
    { id: 'security', name: 'Security', icon: BookOpenIcon },
    { id: 'billing', name: 'Billing', icon: BookOpenIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: BookOpenIcon }
  ];

  const articles = [
    {
      id: 1,
      title: 'How to create your first payment link',
      category: 'getting-started',
      description: 'Step-by-step guide to creating and sharing payment links with your customers.',
      readTime: '3 min read',
      helpful: 245,
      content: 'Learn how to create payment links in just a few clicks...'
    },
    {
      id: 2,
      title: 'Setting up webhooks for payment notifications',
      category: 'api',
      description: 'Configure webhooks to receive real-time payment status updates.',
      readTime: '5 min read',
      helpful: 189,
      content: 'Webhooks allow you to receive instant notifications...'
    },
    {
      id: 3,
      title: 'Understanding payment statuses',
      category: 'payments',
      description: 'Learn about different payment statuses and what they mean.',
      readTime: '4 min read',
      helpful: 156,
      content: 'Payment statuses help you track the lifecycle of transactions...'
    },
    {
      id: 4,
      title: 'API authentication and security',
      category: 'security',
      description: 'Best practices for securing your API keys and implementing authentication.',
      readTime: '6 min read',
      helpful: 203,
      content: 'Security is paramount when handling payment data...'
    },
    {
      id: 5,
      title: 'Managing your billing and invoices',
      category: 'billing',
      description: 'How to view, download, and manage your PaySSD billing information.',
      readTime: '3 min read',
      helpful: 134,
      content: 'Access your billing information from the dashboard...'
    },
    {
      id: 6,
      title: 'Troubleshooting failed payments',
      category: 'troubleshooting',
      description: 'Common reasons why payments fail and how to resolve them.',
      readTime: '7 min read',
      helpful: 298,
      content: 'Payment failures can occur for various reasons...'
    },
    {
      id: 7,
      title: 'Integrating PaySSD with your website',
      category: 'api',
      description: 'Complete guide to integrating PaySSD payment processing into your website.',
      readTime: '10 min read',
      helpful: 267,
      content: 'Integration can be done using our REST API or SDKs...'
    },
    {
      id: 8,
      title: 'Setting up your merchant account',
      category: 'getting-started',
      description: 'Everything you need to know about setting up and verifying your merchant account.',
      readTime: '5 min read',
      helpful: 178,
      content: 'Your merchant account is the foundation of your payment processing...'
    }
  ];

  const faqs = [
    {
      question: 'How long does it take to process payments?',
      answer: 'Most payments are processed instantly. Bank transfers may take 1-3 business days depending on your bank.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support all major credit cards, debit cards, bank transfers, and digital wallets including PayPal and Apple Pay.'
    },
    {
      question: 'Are there any setup fees?',
      answer: 'No, there are no setup fees. You only pay transaction fees when you process payments.'
    },
    {
      question: 'How do I get my API keys?',
      answer: 'You can find your API keys in the Developer section of your dashboard. Make sure to keep them secure.'
    },
    {
      question: 'Can I customize the payment page?',
      answer: 'Yes, you can customize the payment page with your branding, colors, and logo through the dashboard settings.'
    },
    {
      question: 'What happens if a payment fails?',
      answer: 'Failed payments are automatically logged in your dashboard. You can retry the payment or contact the customer for alternative payment methods.'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Help Center
            </h1>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              Find answers to your questions and get the help you need
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How can we help you today?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center hover:bg-blue-100 transition-colors cursor-pointer">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Get instant help from our support team</p>
              <button className="text-blue-600 font-medium hover:text-blue-700">
                Start Chat →
              </button>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-colors cursor-pointer">
              <EnvelopeIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us a detailed message</p>
              <button className="text-green-600 font-medium hover:text-green-700">
                Send Email →
              </button>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center hover:bg-purple-100 transition-colors cursor-pointer">
              <PhoneIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Speak directly with our team</p>
              <button className="text-purple-600 font-medium hover:text-purple-700">
                Call Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {article.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.readTime}</span>
                  <span>{article.helpful} people found this helpful</span>
                </div>
                <div className="mt-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;