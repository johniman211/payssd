import React from 'react'
import logoSvg from '@/assets/logo.svg'
import Card from '../components/Card'

const Integration = () => {
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

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-secondary-900 tracking-tight">Integration Guide</h1>
            <p className="text-secondary-700">Step-by-step instructions to integrate Payssd into your website or application.</p>
          </div>

          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">1. Create an Account and Get API Keys</h2>
            <p className="text-secondary-700 mb-3">Sign up, complete onboarding, and generate sandbox API keys from your dashboard.</p>
            <div className="flex gap-3">
              <a href="/signup" className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">Create Account</a>
              <a href="/api-keys" className="px-4 py-2 rounded-xl bg-secondary-100 text-secondary-900 hover:bg-secondary-200 transition-colors">View API Keys</a>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">2. Create a Payment Link</h2>
            <p className="text-secondary-700 mb-3">Create links programmatically or via the dashboard. The link code can be used to redirect customers to hosted checkout.</p>
            <pre className="bg-secondary-50 rounded-xl p-4 overflow-auto text-sm"><code>{`curl -X POST \
  'https://sandbox.payssd.com/api/v1/payment_links' \
  -H 'Authorization: Bearer <YOUR_SECRET_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Order #1234",
    "amount": 1500.00,
    "currency": "SSP",
    "description": "Payment for Order #1234"
  }'`}</code></pre>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">3. Redirect Customers to Hosted Checkout</h2>
            <p className="text-secondary-700 mb-3">Use the generated link code to redirect customers to a secure hosted page.</p>
            <pre className="bg-secondary-50 rounded-xl p-4 overflow-auto text-sm"><code>{`<a href="${window.location.origin}/checkout/<link_code>" class="btn">Pay Now</a>`}</code></pre>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">4. Verify Payments via Webhooks</h2>
            <p className="text-secondary-700 mb-3">Configure a webhook endpoint to receive payment status updates and reconcile orders.</p>
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
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">5. Test in Sandbox, Then Go Live</h2>
            <p className="text-secondary-700 mb-3">Use sandbox keys for testing. After verification approval, generate live API keys and update your environment variables.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="text-sm text-secondary-600">Sandbox Base URL</p>
                <code className="text-secondary-900 text-sm">https://sandbox.payssd.com/api</code>
              </div>
              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="text-sm text-secondary-600">Live Base URL</p>
                <code className="text-secondary-900 text-sm">https://api.payssd.com</code>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Resources</h2>
            <div className="flex gap-3">
              <a href="/api-docs" className="px-4 py-2 rounded-xl bg-secondary-100 text-secondary-900 hover:bg-secondary-200 transition-colors">API Documentation</a>
              <a href="/privacy" className="px-4 py-2 rounded-xl bg-secondary-100 text-secondary-900 hover:bg-secondary-200 transition-colors">Privacy</a>
              <a href="/security" className="px-4 py-2 rounded-xl bg-secondary-100 text-secondary-900 hover:bg-secondary-200 transition-colors">Security</a>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Integration
