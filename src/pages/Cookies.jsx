import React from 'react'
import logoSvg from '@/assets/logo-ssd.svg'

const Cookies = () => {
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
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Cookie Policy</h1>
          <p className="text-secondary-600">Effective Date: 2025-12-05</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">1. What Are Cookies?</h2>
            <p className="text-secondary-700">Cookies are small files stored on your browser to enhance your experience.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">2. Types of Cookies We Use</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Essential – for login and security</li>
              <li>Analytics – performance and usage</li>
              <li>Preference – save settings</li>
              <li>Marketing – optional, for ads</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">3. Managing Cookies</h2>
            <p className="text-secondary-700">You may disable cookies in browser settings, but some features may stop working.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Cookies
