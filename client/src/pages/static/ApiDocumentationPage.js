import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const ApiDocumentationPage = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/payments/create-link',
      description: 'Create a new payment link',
      auth: true,
      body: {
        title: 'string',
        description: 'string',
        amount: 'number',
        currency: 'string',
        expiresAt: 'string (ISO date)'
      },
      response: {
        success: true,
        link: {
          id: 'string',
          title: 'string',
          amount: 'number',
          currency: 'string',
          url: 'string',
          status: 'active'
        }
      }
    },
    {
      method: 'GET',
      path: '/api/payments/links',
      description: 'Get all payment links',
      auth: true,
      response: {
        success: true,
        links: 'array',
        pagination: {
          current: 'number',
          pages: 'number',
          total: 'number'
        }
      }
    },
    {
      method: 'GET',
      path: '/api/payments/link/:id',
      description: 'Get a specific payment link',
      auth: true,
      response: {
        success: true,
        link: 'object'
      }
    },
    {
      method: 'POST',
      path: '/api/payments/process',
      description: 'Process a payment',
      auth: false,
      body: {
        linkId: 'string',
        customerEmail: 'string',
        customerName: 'string',
        paymentMethod: 'string'
      },
      response: {
        success: true,
        transaction: {
          id: 'string',
          status: 'completed',
          amount: 'number'
        }
      }
    }
  ];

  const codeExamples = {
    javascript: `// Create a payment link
const response = await fetch('/api/payments/create-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify({
    title: 'Product Purchase',
    description: 'Payment for premium subscription',
    amount: 2999,
    currency: 'USD',
    expiresAt: '2024-12-31T23:59:59Z'
  })
});

const data = await response.json();`,
    curl: `# Create a payment link
curl -X POST https://api.payssd.com/api/payments/create-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "title": "Product Purchase",
    "description": "Payment for premium subscription",
    "amount": 2999,
    "currency": "USD",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'`,
    python: `import requests

# Create a payment link
url = "https://api.payssd.com/api/payments/create-link"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
}
data = {
    "title": "Product Purchase",
    "description": "Payment for premium subscription",
    "amount": 2999,
    "currency": "USD",
    "expiresAt": "2024-12-31T23:59:59Z"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()`
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            API Documentation
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Complete guide to integrate PaySSD into your application
          </p>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              The PaySSD API uses REST principles with JSON payloads. All API requests must be made over HTTPS.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Base URL</h3>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">
              https://api.payssd.com
            </code>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">Authentication</h3>
            <p className="text-gray-600 mb-2">
              Include your API token in the Authorization header:
            </p>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">
              Authorization: Bearer YOUR_API_TOKEN
            </code>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                  {endpoint.auth && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Auth Required
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{endpoint.description}</p>
                
                {endpoint.body && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(endpoint.body, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>
          <div className="space-y-6">
            {Object.entries(codeExamples).map(([language, code]) => (
              <div key={language}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {language === 'javascript' ? 'JavaScript' : language.toUpperCase()}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(code, language)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {copiedCode === language ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                    {copiedCode === language ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                  <code>{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Error Codes */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Codes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">400</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Bad Request - Invalid parameters</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">401</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Unauthorized - Invalid API token</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">403</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Forbidden - Insufficient permissions</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">404</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Not Found - Resource doesn't exist</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">500</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Internal Server Error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentationPage;