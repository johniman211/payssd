import React from 'react'
import logoSvg from '@/assets/logo-ssd.svg'

const KycAml = () => {
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
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">KYC / AML Compliance Policy</h1>
          <p className="text-secondary-600">Effective Date: 2025-12-05</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">1. Purpose</h2>
            <p className="text-secondary-700">We comply with Anti–Money Laundering (AML), Counter‑Terrorist Financing (CTF), and Know Your Customer (KYC) requirements.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">2. KYC Requirements</h2>
            <div className="space-y-2">
              <p className="text-secondary-800 font-medium">Personal Accounts</p>
              <ul className="list-disc ml-6 text-secondary-700 space-y-2">
                <li>National ID</li>
                <li>Phone number</li>
                <li>Selfie verification</li>
                <li>Bank or mobile money account</li>
              </ul>
              <p className="text-secondary-800 font-medium mt-4">Business Accounts</p>
              <ul className="list-disc ml-6 text-secondary-700 space-y-2">
                <li>Certificate of incorporation</li>
                <li>Business license (optional)</li>
                <li>Director ID</li>
                <li>Company bank account</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">3. AML Monitoring</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Suspicious transaction patterns</li>
              <li>High‑risk behaviors</li>
              <li>Repeated failed payments</li>
              <li>Unusual withdrawals</li>
              <li>Structuring</li>
            </ul>
            <p className="text-secondary-700">Suspicious activity may result in account freeze.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">4. Reporting</h2>
            <p className="text-secondary-700">We may report suspicious activity to banks, mobile money partners, and government authorities.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default KycAml
