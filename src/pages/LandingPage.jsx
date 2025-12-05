import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Zap, Shield, Globe, BarChart3, Bell, Wallet, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import mtnLogo from '@/assets/partners/mtn.svg';
import airtelLogo from '@/assets/partners/airtel.svg';
import logoSvg from '@/assets/logo-ssd.svg';
import PublicHeader from '@/components/PublicHeader';

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Fast & Easy Integration',
      description: 'Integrate Payssd in minutes with sandbox and live API.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Industry-standard encryption keeps your payments safe.',
    },
    {
      icon: Globe,
      title: 'Local Payment Solutions',
      description: 'Accept mobile money, card payments, and bank transfers tailored for South Sudan.',
    },
    {
      icon: BarChart3,
      title: 'Merchant Dashboard',
      description: 'View transactions, API keys, and payouts in one place.',
    },
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Get notified of payments, withdrawals, and verification updates.',
    },
    {
      icon: Wallet,
      title: 'Withdraw to Bank',
      description: 'Easily access your funds with bank or mobile money.',
    },
  ];

  const steps = [
    { 
      number: '01', 
      title: 'Sign Up & Verify', 
      description: 'Create an account and complete verification.',
      icon: '🚀'
    },
    { 
      number: '02', 
      title: 'Integrate API', 
      description: 'Use sandbox for testing; live API unlocks after verification.',
      icon: '⚙️'
    },
    { 
      number: '03', 
      title: 'Start Receiving Payments', 
      description: 'Accept payments instantly and securely.',
      icon: '💰'
    },
  ];

  const testimonials = [
    { 
      quote: 'Payssd made it so easy for my business to start accepting payments online!', 
      author: 'Sarah M.', 
      business: 'Online Retailer',
      avatar: '👩‍💼'
    },
    { 
      quote: 'Fast, secure, and reliable – highly recommend!', 
      author: 'John K.', 
      business: 'Tech Startup',
      avatar: '👨‍💻'
    },
    { 
      quote: 'The best payment gateway for South Sudanese businesses!', 
      author: 'Mary A.', 
      business: 'E-commerce Store',
      avatar: '👩‍🔧'
    },
  ];

  const partners = [
    { name: 'MTN Mobile Money', logo: mtnLogo, type: 'mobile' },
    { name: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png', type: 'card' },
    { name: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png', type: 'card' },
    { name: 'M-Pesa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/2560px-M-PESA_LOGO-01.svg.png', type: 'mobile' },
    { name: 'Airtel Money', logo: airtelLogo, type: 'mobile' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-secondary-900">
        <div className="absolute inset-0 -z-10 dot-grid opacity-20" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-secondary-200">South Sudan's First Payment Gateway 🇸🇸</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Accept Payments<br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent animate-gradient">
              Anywhere in South Sudan
            </span>
          </h1>

          <p className="text-xl text-secondary-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Payssd is the first payment gateway built for South Sudanese businesses. Connect with your customers, accept payments online, and grow effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-stripe-xl hover:shadow-stripe transition-all duration-300 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-700 hover:via-primary-600 hover:to-accent-700"
            >
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white/10 text-white border border-white/20 rounded-xl hover:border-primary-400 transition-all duration-300 backdrop-blur-sm"
            >
              Request a Demo
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-secondary-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Sandbox for testing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Quick verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">Trusted Payment Partners</p>
            <h2 className="text-3xl font-bold text-white tracking-tight">Accept Payments Through</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 rounded-xl transition-all duration-300 group bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-stripe"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-lg font-semibold text-secondary-600">${partner.name}</span>`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-primary-50 via-primary-100 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">Why Payssd?</h2>
            <p className="text-xl text-secondary-600">Everything you need to accept payments online</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white/70 backdrop-blur-md border border-secondary-200 hover:border-indigo-300 hover:shadow-stripe-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-xl text-secondary-600">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center group">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-stripe bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-primary-600 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">{step.title}</h3>
                  <p className="text-secondary-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-10 -right-4 text-primary-300" size={32} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">What Our Merchants Say</h2>
            <p className="text-xl text-secondary-600">Join hundreds of satisfied businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-primary-50/60 border border-secondary-200 rounded-2xl p-8 hover:shadow-stripe-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-secondary-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900">{testimonial.author}</p>
                    <p className="text-sm text-secondary-600">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bring Your Business Online — Start Accepting Payments Today
          </h2>
          <p className="text-xl text-white mb-10">
            Join hundreds of South Sudanese businesses already using Payssd
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-secondary-900 rounded-xl hover:bg-gray-50 shadow-stripe-xl hover:shadow-stripe transition-all duration-300 hover:scale-105"
            >
              Create Merchant Account
              <ArrowRight className="ml-2" size={20} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white/10 text-white border-2 border-white/30 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
            >
              Learn More
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-medium">Free sandbox testing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-medium">Quick setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-medium">24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoSvg} alt="PaySSD" className="h-6 w-6 rounded-lg" />
                <span className="text-xl font-bold">PaySSD</span>
              </div>
              <p className="text-secondary-400">The first payment gateway for South Sudan</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/signup" className="hover:text-white transition-colors">Get Started</a></li>
                <li><a href="/api-docs" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="/integration" className="hover:text-white transition-colors">Integration Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="/refunds" className="hover:text-white transition-colors">Refund & Dispute</a></li>
                <li><a href="/kyc-aml" className="hover:text-white transition-colors">KYC / AML</a></li>
                <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 pt-8 text-center text-secondary-400">
            <p>&copy; 2025 Payssd. All rights reserved. Made with ❤️ in South Sudan 🇸🇸</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
        }
        .dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .shadow-stripe { box-shadow: 0 2px 8px rgba(99,102,241,.25); }
        .shadow-stripe-lg { box-shadow: 0 10px 30px rgba(99,102,241,.30); }
        .shadow-stripe-xl { box-shadow: 0 20px 60px rgba(99,102,241,.35); }
      `}</style>
    </div>
  );
};

export default LandingPage;
