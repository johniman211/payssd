import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, TrendingUp, CreditCard, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  
  const texts = [
    'Secure Payment Processing',
    'Multi-Currency Support',
    'Real-time Analytics',
    'Global Reach'
  ];

  useEffect(() => {
    if (textIndex < texts.length) {
      if (charIndex < texts[textIndex].length) {
        const timeout = setTimeout(() => {
          setCurrentText(prev => prev + texts[textIndex][charIndex]);
          setCharIndex(prev => prev + 1);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentText('');
          setCharIndex(0);
          setTextIndex(prev => (prev + 1) % texts.length);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, textIndex, texts]);

  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'PCI DSS compliant with end-to-end encryption and fraud detection'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process payments in milliseconds with 99.9% uptime guarantee'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Accept payments from 150+ countries in multiple currencies'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Real-time insights and detailed reporting for better decisions'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart',
      content: 'PaySSD transformed our payment processing. The analytics are incredible!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Founder, E-Commerce Plus',
      content: 'Best payment gateway we\'ve used. Fast, secure, and reliable.',
      rating: 5
    },
    {
      name: 'Amanda Rodriguez',
      role: 'CFO, Global Retail',
      content: 'The multi-currency support has been game-changing for our international expansion.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₦9,999',
      period: 'month',
      features: ['Up to 100 transactions/month', 'Basic analytics', 'Email support', 'Standard security'],
      popular: false
    },
    {
      name: 'Professional',
      price: '₦24,999',
      period: 'month',
      features: ['Up to 1,000 transactions/month', 'Advanced analytics', 'Priority support', 'Advanced security', 'Multi-currency support'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₦49,999',
      period: 'month',
      features: ['Unlimited transactions', 'Custom analytics', '24/7 dedicated support', 'Enterprise security', 'Custom integrations', 'White-label options'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="block">Power Your Business with</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {currentText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The most secure, reliable, and feature-rich payment processing platform for businesses of all sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated particles background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Process Payments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technology and security standards to ensure your transactions are always safe and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about PaySSD
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl border-2 ${
                  plan.popular
                    ? 'border-indigo-500 bg-gray-800'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-indigo-500 text-white text-sm font-medium rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`w-full block text-center py-3 px-4 rounded-lg font-medium ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } transition-colors`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/pricing"
              className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all pricing details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Payment Processing?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of businesses that trust PaySSD for their payment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}