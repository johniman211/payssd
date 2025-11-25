import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const PricingPage = () => {
  const [billing] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      monthlyFee: 'SSP 0',
      transactionFee: '5%',
      volume: 'Monthly volume limit: SSP 300,000',
      description: 'Perfect for getting started',
      features: [
        'Basic dashboard',
        'Standard payouts',
        'Email/SMS notifications',
        'Limited support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Growth',
      monthlyFee: 'SSP 10,000/month',
      transactionFee: '3.5%',
      volume: 'Monthly volume: up to SSP 5,000,000',
      description: 'For growing businesses',
      features: [
        'Faster payouts',
        'Branded receipts',
        'Team accounts',
        'Advanced analytics',
        'Priority support'
      ],
      cta: 'Upgrade',
      popular: true
    },
    {
      name: 'Business Pro',
      monthlyFee: 'SSP 45,000/month',
      transactionFee: '2.2%',
      volume: 'Unlimited volume',
      description: 'For established businesses',
      features: [
        'Custom payment flows',
        'SLA',
        'Advanced reporting',
        'Dedicated account manager'
      ],
      cta: 'Upgrade',
      popular: false
    },
    {
      name: 'Enterprise',
      monthlyFee: 'Custom pricing',
      transactionFee: '1%–2%',
      volume: 'Unlimited volume',
      description: 'For large organizations',
      features: [
        'White-labeling',
        'API access',
        'Bulk payout automation',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that's right for your business
          </p>
        </div>

        {/* Billing toggle (UI only) */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white">
              Monthly
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300" disabled>
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: plan.popular ? 1.02 : 1.05 }}
              className={`relative rounded-3xl border ${
                plan.popular
                  ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-soft hover:shadow-elevated'
              } p-8 transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-accent-400 to-accent-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`mt-2 ${plan.popular ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>{plan.description}</p>
                <div className="mt-4 space-y-2">
                  <div className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.monthlyFee}</div>
                  <div className={`${plan.popular ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>Transaction fee: {plan.transactionFee}</div>
                  <div className={`${plan.popular ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>{plan.volume}</div>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className={`h-5 w-5 ${plan.popular ? 'text-primary-200' : 'text-green-500'} mt-0.5 mr-3 flex-shrink-0`} />
                    <span className={`${plan.popular ? 'text-primary-50' : 'text-gray-700 dark:text-gray-300'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  className={`w-full py-3 px-4 rounded-2xl font-bold ${
                    plan.popular
                      ? 'bg-white text-primary-600 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 shadow-soft'
                  } transition-all`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No, there are no setup fees. You only pay the monthly subscription and transaction fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and bank transfers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee for all paid plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
