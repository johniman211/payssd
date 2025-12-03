 import React from 'react'
import Card from '../components/Card'
import logoSvg from '@/assets/logo.svg'

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full z-40 border-b border-white/10 bg-gradient-to-b from-secondary-900/90 via-secondary-900/70 to-secondary-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logoSvg} alt="Payssd" className="h-8 w-8 rounded-lg shadow-inner" />
            <span className="text-white font-bold tracking-tight">Payssd</span>
          </a>
          <a href="/signup" className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">Get Started</a>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-secondary-900 mb-2 tracking-tight">API Documentation</h1>
            <p className="text-secondary-600">Integrate Payssd into your website or application</p>
          </div>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Base URLs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary-50 rounded-xl">
              <p className="text-sm text-secondary-600 mb-1">Sandbox</p>
              <code className="text-secondary-900 text-sm">https://sandbox.payssd.com/api</code>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl">
              <p className="text-sm text-secondary-600 mb-1">Live</p>
              <code className="text-secondary-900 text-sm">https://api.payssd.com</code>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Authentication</h2>
          <p className="text-secondary-700 mb-4">Use your generated API keys with Bearer authorization headers.</p>
          <pre className="bg-secondary-50 rounded-xl p-4 overflow-auto text-sm"><code>{`curl -X GET \
 'https://sandbox.payssd.com/api/v1/transactions' \
 -H 'Authorization: Bearer <YOUR_SECRET_KEY>'`}</code></pre>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Create Payment Link</h2>
          <p className="text-secondary-700 mb-4">Create payment links programmatically to accept payments via hosted checkout.</p>
          <pre className="bg-secondary-50 rounded-xl p-4 overflow-auto text-sm"><code>{`POST /api/v1/payment_links
Content-Type: application/json
Authorization: Bearer <YOUR_SECRET_KEY>

{
  "title": "Order #1234",
  "amount": 1500.00,
  "currency": "SSP",
  "description": "Payment for Order #1234"
}`}</code></pre>
          <div className="mt-3 text-sm text-secondary-700">
            <p>Response includes a `link_code` field. Direct customers to:</p>
            <code className="block mt-1 text-secondary-900">{`${window.location.origin}/checkout/<link_code>`}</code>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Webhooks</h2>
          <p className="text-secondary-700 mb-4">Receive asynchronous notifications for transaction status updates.</p>
          <pre className="bg-secondary-50 rounded-xl p-4 overflow-auto text-sm"><code>{`Event: payment.succeeded
{
  "event": "payment.succeeded",
  "data": {
    "transaction_reference": "TXN_ABC123",
    "amount": 1500.00,
    "currency": "SSP",
    "status": "completed"
  }
}`}</code></pre>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Hosted Checkout</h2>
          <p className="text-secondary-700 mb-4">Use the hosted page for quick integration. Customers are sent to:</p>
          <code className="text-secondary-900 text-sm">{`${window.location.origin}/checkout/<link_code>`}</code>
          <p className="text-secondary-700 mt-3">Use the sandbox environment until your account is verified for live API keys.</p>
        </Card>
        </div>
      </main>
    </div>
  )
}

export default ApiDocs
