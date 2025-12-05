import React from 'react'
import logoSvg from '@/assets/logo-ssd.svg'

const Terms = () => {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-secondary-600">Effective Date: 2025-12-05 • Last Updated: 2025-12-05</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">1. Introduction</h2>
            <p className="text-secondary-700">These Terms govern your use of the Payssd platform including website, APIs, merchant dashboard, checkout, and related services. By using Payssd you agree to these Terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">2. Definitions</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Merchant: a business or individual registered to accept payments</li>
              <li>Customer: end‑user making a payment to a Merchant</li>
              <li>Transaction: payment made through Payssd</li>
              <li>Settlement: funds transferred to Merchant bank/mobile money</li>
              <li>Sandbox Mode: non‑live test environment</li>
              <li>Live Mode: production environment for real transactions</li>
              <li>API Keys: credentials for API access</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">3. Eligibility</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>At least 18 years old</li>
              <li>Accurate personal or business information</li>
              <li>Legal authority to operate a business</li>
              <li>Complete identity verification when required</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">4. Merchant Responsibilities</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Maintain accurate account information</li>
              <li>Use Payssd only for lawful transactions</li>
              <li>Comply with all KYC/AML requirements</li>
              <li>Protect API keys and credentials</li>
              <li>Deliver goods/services and handle refunds responsibly</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">5. Prohibited Activities</h2>
            <p className="text-secondary-700">We do not allow fraud, money laundering, terrorist financing, illegal gambling, sale of prohibited goods, fake businesses, or identity misuse. We may suspend or terminate accounts that violate these rules.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">6. Verification & Account Review</h2>
            <p className="text-secondary-700">We may require national ID, business certificate, statements, selfie verification, and ownership proof. Unverified accounts remain in sandbox mode.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">7. API Usage</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Keep API keys secure and never expose secrets in frontend</li>
              <li>Comply with rate limits and validate webhooks</li>
              <li>Use sandbox for testing before live</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">8. Transactions & Fees</h2>
            <p className="text-secondary-700">Fees vary by method and are deducted automatically. Failed or reversed transactions may incur fees. Chargebacks from card issuers are passed to the Merchant. Fees may be adjusted with notice.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">9. Settlements & Withdrawals</h2>
            <p className="text-secondary-700">Settlement schedules may be daily, weekly, or custom with minimums and network fees. Incorrect settlement details may cause delays.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">10. Refunds & Disputes</h2>
            <p className="text-secondary-700">Refunds are initiated by the Merchant. Payssd may intervene for fraud or disputes. Refund fees may apply.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">11. Limitation of Liability</h2>
            <p className="text-secondary-700">Payssd is not liable for customer disputes, lost profits, downtime, incorrect integrations, or network delays. Maximum liability is limited to fees paid within the past 90 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">12. Termination</h2>
            <p className="text-secondary-700">We may suspend accounts for fraud, non‑compliance, chargeback abuse, false information, or illegal activity.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">13. Governing Law</h2>
            <p className="text-secondary-700">These Terms are governed by the laws of South Sudan.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Terms
