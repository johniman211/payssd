import React from 'react'
import PublicHeader from '@/components/PublicHeader'

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <h1 className="text-4xl font-bold text-secondary-900 tracking-tight">About Payssd</h1>
          <p className="text-secondary-700">Payssd is South Sudan’s payment gateway, focused on reliability, security, and developer-friendly integrations. We enable businesses to accept payments online, reconcile transactions, and manage payouts with confidence.</p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Mission</h2>
            <p className="text-secondary-700">Power the digital economy with secure, accessible payments for merchants and customers across South Sudan.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">What We Offer</h2>
            <ul className="list-disc ml-6 text-secondary-700 space-y-2">
              <li>Hosted checkout and payment links</li>
              <li>Real-time dashboards and notifications</li>
              <li>Compliant onboarding and verification</li>
              <li>API keys and developer documentation</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary-900">Reach Out To Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="text-sm text-secondary-600">Phone</p>
                <a href="tel:+211929385157" className="text-secondary-900 font-medium">+211 929 385 157</a>
              </div>
              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="text-sm text-secondary-600">Email</p>
                <a href="mailto:support@payssd.com" className="text-secondary-900 font-medium">support@payssd.com</a>
              </div>
              <div className="p-4 bg-secondary-50 rounded-xl">
                <p className="text-sm text-secondary-600">Location</p>
                <p className="text-secondary-900 font-medium">Gudele Two, Juba, South Sudan</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default About
