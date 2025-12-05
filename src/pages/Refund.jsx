import React from 'react'
import logoSvg from '@/assets/logo-ssd.svg'

const Refund = () => {
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
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Refund & Dispute Policy</h1>
          <p className="text-secondary-600">Effective Date: 2025-12-05</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">1. Merchant Responsibility</h2>
            <p className="text-secondary-700">Refunds are handled by Merchants. Payssd does not issue refunds unless related to system errors.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">2. Refund Types</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Full Refund – 100% returned</li>
              <li>Partial Refund – Portion returned</li>
              <li>Chargeback – Card issuer forces reversal</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">3. Refund Requirements</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Merchant confirms goods/services were not provided</li>
              <li>Customer provides receipt</li>
              <li>Refund initiated within 30 days</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">4. Chargebacks</h2>
            <p className="text-secondary-700">Card networks may issue chargebacks for fraud, disputes, or unauthorized transactions. Fees may apply.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Refund
