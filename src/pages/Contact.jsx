import React from 'react'
import PublicHeader from '@/components/PublicHeader'

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <h1 className="text-4xl font-bold text-secondary-900 tracking-tight">Contact Us</h1>
          <p className="text-secondary-700">Reach out to the Payssd team for support, onboarding, or partnerships.</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary-900">Contact Details</h2>
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

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Support</h2>
            <p className="text-secondary-700">Use the merchant portal for ticketing or email our support channel.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-secondary-900">Business</h2>
            <p className="text-secondary-700">For partnerships and enterprise inquiries, contact us via the website.</p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Contact
