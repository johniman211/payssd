import React from 'react'
import logoSvg from '@/assets/logo-ssd.svg'

const Privacy = () => {
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
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Privacy Policy</h1>
          <p className="text-secondary-600">Effective Date: 2025-12-05</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Information We Collect</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Personal: full name, email, phone, national ID, DOB, address</li>
              <li>Business: business name/type, registration docs, tax ID, bank/mobile money accounts</li>
              <li>Technical & Usage: IP, browser, device, logs, API usage</li>
              <li>Financial: transactions, payment methods, settlement history</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">How We Use Information</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Provide merchant services and process transactions</li>
              <li>Verify identity (KYC) and prevent fraud (AML)</li>
              <li>Send notifications and improve platform performance</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Data Sharing</h2>
            <p className="text-secondary-700">We share data only with payment processors, verification partners, law enforcement when required, and service providers. We never sell personal data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Data Retention</h2>
            <p className="text-secondary-700">We keep records for legal compliance, auditing, and fraud prevention. You may request deletion for non‑transactional data where permitted.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Your Rights</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Access, update, or delete your information, subject to legal exceptions.</li>
              <li>Object to certain processing and request portability where applicable.</li>
              <li>Manage communication preferences and cookies.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Cookies</h2>
            <p className="text-secondary-700">We use cookies and similar technologies for authentication, security, and analytics. You can adjust cookie settings in your browser; disabling some cookies may affect functionality.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">International Transfers</h2>
            <p className="text-secondary-700">If data is transferred across borders, we use appropriate safeguards and partner with providers that meet recognized standards.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Contact</h2>
            <p className="text-secondary-700">For privacy requests or questions, contact support via the website or your merchant portal.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Privacy
