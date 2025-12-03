import React, { useState } from 'react'
import logoSvg from '@/assets/logo-ssd.svg'

const PublicHeader = () => {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-gradient-to-b from-secondary-900/90 via-secondary-900/70 to-secondary-900/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <img src={logoSvg} alt="PaySSD" className="h-6 w-6 rounded-lg shadow-inner" />
              <span className="text-xl font-bold text-white tracking-tight">PaySSD</span>
            </a>
          </div>
          <button className="lg:hidden text-white/80 hover:text-white" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            ☰
          </button>
          <div className="hidden lg:flex items-center gap-6">
            <a href="/" className="text-white/80 hover:text-white font-medium transition-colors">Home</a>
            <a href="/#features" className="text-white/80 hover:text-white font-medium transition-colors">Features</a>
            <a href="/pricing" className="text-white/80 hover:text-white font-medium transition-colors">Pricing</a>
            <a href="/contact" className="text-white/80 hover:text-white font-medium transition-colors">Contact</a>
            <a href="/login" className="text-white/80 hover:text-white font-medium transition-colors">Sign In</a>
            <a href="/signup" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white shadow-stripe hover:shadow-stripe-lg transition-all duration-300 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-700 hover:via-primary-600 hover:to-accent-700">Get Started</a>
          </div>
        </div>
        {open && (
          <div className="lg:hidden pb-4 flex flex-col gap-3">
            <a href="/" className="text-white/80 hover:text-white font-medium">Home</a>
            <a href="/#features" className="text-white/80 hover:text-white font-medium">Features</a>
            <a href="/pricing" className="text-white/80 hover:text-white font-medium">Pricing</a>
            <a href="/contact" className="text-white/80 hover:text-white font-medium">Contact</a>
            <a href="/login" className="text-white/80 hover:text-white font-medium">Sign In</a>
            <a href="/signup" className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-semibold">Get Started</a>
          </div>
        )}
      </div>
    </nav>
  )
}

export default PublicHeader
