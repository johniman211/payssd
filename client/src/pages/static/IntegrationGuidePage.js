import React, { useState } from 'react';
import { ChevronRightIcon, CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const IntegrationGuidePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const steps = [
    {
      title: 'Create Your Account',
      description: 'Sign up for a PaySSD account and complete KYC verification',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Before you can start accepting payments, you'll need to create a PaySSD account and complete the verification process.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Sign up at PaySSD.com</li>
            <li>Verify your email address</li>
            <li>Complete KYC verification by uploading required documents</li>
            <li>Wait for approval (usually takes 1-2 business days)</li>
          </ol>
        </div>
      )
    },
    {
      title: 'Get Your API Keys',
      description: 'Obtain your API credentials from the dashboard',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Once your account is approved, you can access your API keys from the dashboard.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Log in to your PaySSD dashboard</li>
            <li>Navigate to Settings → API Keys</li>
            <li>Generate a new API key for your application</li>
            <li>Store your API key securely (never expose it in client-side code)</li>
          </ol>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800 text-sm">
              <strong>Security Note:</strong> Keep your API keys secure and never commit them to version control.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Install SDK (Optional)',
      description: 'Use our official SDKs for easier integration',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            While you can use our REST API directly, we provide SDKs for popular programming languages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Node.js</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                  <code>npm install @payssd/node-sdk</code>
                </pre>
                <button
                  onClick={() => copyToClipboard('npm install @payssd/node-sdk', 'nodejs')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                  <code>pip install payssd-python</code>
                </pre>
                <button
                  onClick={() => copyToClipboard('pip install payssd-python', 'python')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Create Payment Links',
      description: 'Generate payment links for your customers',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Create payment links programmatically using our API.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Example: Create a Payment Link</h4>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                <code>{`const response = await fetch('https://api.payssd.com/api/payments/create-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    title: 'Premium Subscription',
    description: 'Monthly subscription fee',
    amount: 2999, // Amount in cents
    currency: 'USD',
    expiresAt: '2024-12-31T23:59:59Z'
  })
});

const { link } = await response.json();
console.log('Payment URL:', link.url);`}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(`const response = await fetch('https://api.payssd.com/api/payments/create-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    title: 'Premium Subscription',
    description: 'Monthly subscription fee',
    amount: 2999, // Amount in cents
    currency: 'USD',
    expiresAt: '2024-12-31T23:59:59Z'
  })
});

const { link } = await response.json();
console.log('Payment URL:', link.url);`, 'create-link')}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Handle Webhooks',
      description: 'Set up webhooks to receive payment notifications',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Configure webhooks to receive real-time notifications about payment events.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Webhook Endpoint Example</h4>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                <code>{`app.post('/webhooks/payssd', (req, res) => {
  const event = req.body;
  
  // Verify webhook signature (recommended)
  const signature = req.headers['x-payssd-signature'];
  if (!verifySignature(signature, req.body)) {
    return res.status(400).send('Invalid signature');
  }
  
  switch (event.type) {
    case 'payment.completed':
      // Handle successful payment
      console.log('Payment completed:', event.data);
      break;
    case 'payment.failed':
      // Handle failed payment
      console.log('Payment failed:', event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  res.status(200).send('OK');
});`}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(`app.post('/webhooks/payssd', (req, res) => {
  const event = req.body;
  
  // Verify webhook signature (recommended)
  const signature = req.headers['x-payssd-signature'];
  if (!verifySignature(signature, req.body)) {
    return res.status(400).send('Invalid signature');
  }
  
  switch (event.type) {
    case 'payment.completed':
      // Handle successful payment
      console.log('Payment completed:', event.data);
      break;
    case 'payment.failed':
      // Handle failed payment
      console.log('Payment failed:', event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  res.status(200).send('OK');
});`, 'webhook')}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Test Integration',
      description: 'Test your integration using our sandbox environment',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Use our sandbox environment to test your integration before going live.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Sandbox Environment</h4>
            <p className="text-blue-800 text-sm mb-2">
              Base URL: <code className="bg-blue-100 px-2 py-1 rounded">https://sandbox-api.payssd.com</code>
            </p>
            <p className="text-blue-800 text-sm">
              Use test API keys from your dashboard's sandbox section.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Test Card Numbers</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><code>4242424242424242</code> - Visa (Success)</li>
              <li><code>4000000000000002</code> - Visa (Declined)</li>
              <li><code>5555555555554444</code> - Mastercard (Success)</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Integration Guide
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Step-by-step guide to integrate PaySSD into your application
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
              <nav className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeStep === index
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                        activeStep === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  {activeStep + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{steps[activeStep].title}</h2>
                  <p className="text-gray-600">{steps[activeStep].description}</p>
                </div>
              </div>
              
              <div className="mb-8">
                {steps[activeStep].content}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/api-documentation" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">API Documentation</h3>
              <p className="text-gray-600 text-sm">Complete API reference and examples</p>
            </a>
            <a href="/help" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Help Center</h3>
              <p className="text-gray-600 text-sm">FAQs and troubleshooting guides</p>
            </a>
            <a href="/developer-support" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Developer Support</h3>
              <p className="text-gray-600 text-sm">Get help from our technical team</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuidePage;