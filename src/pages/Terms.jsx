import React from 'react'
import logoSvg from '@/assets/logo.svg'

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
          <h1 className="text-4xl font-bold text-secondary-900 tracking-tight">Terms of Service</h1>
          <p className="text-secondary-700">These Terms govern your use of Payssd’s services. By creating an account or using our products, you agree to these Terms.</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Accounts and Eligibility</h2>
            <p className="text-secondary-700">You must provide accurate information and keep credentials secure. Business accounts must be authorized to operate and comply with applicable regulations.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Acceptable Use</h2>
            <p className="text-secondary-700">You may not use Payssd for prohibited activities including fraud, money laundering, illegal goods, or violations of card network and mobile money rules.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Fees and Payouts</h2>
            <p className="text-secondary-700">We disclose fees in your dashboard. Payout timelines depend on compliance status, partner networks, and risk assessment.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Verification and Compliance</h2>
            <p className="text-secondary-700">We may request identity, business, and ownership documents to meet AML/KYC obligations. Failure to complete verification may limit or suspend services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Security</h2>
            <p className="text-secondary-700">You must safeguard API keys and access tokens. Notify us immediately of suspected compromise or unauthorized activity.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Service Changes</h2>
            <p className="text-secondary-700">We may update features, limits, or policies to improve performance, security, and compliance. Material changes will be communicated.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Liability</h2>
            <p className="text-secondary-700">To the maximum extent permitted by law, Payssd is not liable for indirect or consequential damages. Regulatory and network limitations may affect service availability.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Termination</h2>
            <p className="text-secondary-700">We may suspend or terminate accounts for violations of these Terms or legal requirements. You may close your account at any time.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Terms
