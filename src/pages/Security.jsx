import React from 'react'
import logoSvg from '@/assets/logo.svg'

const Security = () => {
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
          <h1 className="text-4xl font-bold text-secondary-900 tracking-tight">Security</h1>
          <p className="text-secondary-700">We design Payssd with defense-in-depth. Our security program follows recognized standards and focuses on protecting data, infrastructure, and financial operations.</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Encryption</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Transport encryption with TLS for all network traffic.</li>
              <li>At-rest encryption for databases and storage.</li>
              <li>Key management aligned with best practices.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Access Controls</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Least-privilege roles, MFA for internal access, and audit logging.</li>
              <li>Scoped API keys with revocation and rotation guidance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Compliance</h2>
            <p className="text-secondary-700">We align with PCI DSS principles for payment security and maintain AML/KYC procedures for regulatory compliance.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Monitoring & Incident Response</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Continuous monitoring of availability, integrity, and risk signals.</li>
              <li>Formal incident response to assess, contain, and notify as required.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Vulnerability Management</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Regular patching and dependency updates.</li>
              <li>Secure development lifecycle with code review and testing.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Responsible Disclosure</h2>
            <p className="text-secondary-700">If you discover a vulnerability, please contact us via the website. We appreciate responsible security research and will work promptly to remediate issues.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Security
