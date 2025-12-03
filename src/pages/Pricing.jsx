import React from 'react'
import PublicHeader from '@/components/PublicHeader'

const Pricing = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="pt-28">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">Simple Pricing. No Hidden Fees. Only 5% Per Transaction.</h1>
            <p className="text-lg text-secondary-600 mb-10">Get paid easily, transparently, and securely—only pay when you earn.</p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm p-8 text-center">
              <p className="text-secondary-600 mb-2">Transaction Fee</p>
              <p className="text-5xl font-bold text-secondary-900">5%</p>
              <p className="text-secondary-600 mt-2">per payment</p>
              <div className="mt-8 grid grid-cols-1 gap-3 text-left">
                <div className="flex items-start gap-3"><span className="text-green-600">✓</span><span>Instant payments from all major credit/debit cards and digital wallets</span></div>
                <div className="flex items-start gap-3"><span className="text-green-600">✓</span><span>Secure and encrypted transactions</span></div>
                <div className="flex items-start gap-3"><span className="text-green-600">✓</span><span>Easy integration with your website or app</span></div>
                <div className="flex items-start gap-3"><span className="text-green-600">✓</span><span>Real-time reporting and analytics</span></div>
                <div className="flex items-start gap-3"><span className="text-green-600">✓</span><span>24/7 customer support</span></div>
              </div>
              <div className="mt-10 flex items-center justify-center gap-4">
                <a href="/signup" className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">Start Accepting Payments Today</a>
                <a href="/signup" className="px-6 py-3 rounded-xl bg-secondary-900 text-white hover:bg-secondary-800 transition-colors">Sign Up & Go Live in Minutes</a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Why Payssd?</h2>
            <p className="text-secondary-700">No monthly fees. No hidden costs. Only pay 5% when you receive money—simple, predictable, and fair.</p>
          </div>
        </section>
      </main>

      <footer className="mt-20 py-12 border-t border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-secondary-500">
          © 2024 Payssd. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Pricing
