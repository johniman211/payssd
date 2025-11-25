import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD'>('NGN');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: { NGN: 9999, USD: 25 }, annual: { NGN: 99990, USD: 250 } },
      features: [
        'Up to 100 transactions/month',
        'Basic analytics dashboard',
        'Email support',
        'Standard security',
        '1 payment method',
        'Basic reporting'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: { monthly: { NGN: 24999, USD: 65 }, annual: { NGN: 249990, USD: 650 } },
      features: [
        'Up to 1,000 transactions/month',
        'Advanced analytics dashboard',
        'Priority support',
        'Advanced security features',
        'Multiple payment methods',
        'Advanced reporting',
        'Multi-currency support',
        'API access',
        'Webhook support'
      ],
      popular: true,
      cta: 'Get Started'
    },
    {
      name: 'Enterprise',
      price: { monthly: { NGN: 49999, USD: 130 }, annual: { NGN: 499990, USD: 1300 } },
      features: [
        'Unlimited transactions',
        'Custom analytics dashboard',
        '24/7 dedicated support',
        'Enterprise security',
        'All payment methods',
        'Custom reporting',
        'Multi-currency support',
        'Full API access',
        'Advanced webhooks',
        'White-label options',
        'Custom integrations',
        'Dedicated account manager'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const handlePayment = async (plan: typeof plans[0]) => {
    try {
      const amount = billingCycle === 'monthly' 
        ? plan.price.monthly[selectedCurrency] 
        : plan.price.annual[selectedCurrency];

      console.log(`Processing payment for ${plan.name} plan: ${amount} ${selectedCurrency}`);
      alert(`Redirecting to Flutterwave payment for ${plan.name} plan...`);
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Select the perfect plan for your business needs</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                billingCycle === 'annual' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-indigo-600 text-white text-center py-2 rounded-t-xl">
                  <span className="text-sm font-medium">Most Popular</span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedCurrency === 'NGN' ? '₦' : '$'}
                      {billingCycle === 'monthly' 
                        ? plan.price.monthly[selectedCurrency].toLocaleString()
                        : plan.price.annual[selectedCurrency].toLocaleString()}
                    </span>
                    <span className="text-gray-500 ml-1">/{billingCycle}</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-green-600 mt-2">Save 20% with annual billing</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}