import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import AnnouncementBanner from '../../components/AnnouncementBanner';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };
  
  const features = [
    {
      icon: CreditCardIcon,
      title: 'Multiple Payment Methods',
      description: 'Accept payments via MTN Mobile Money and Digicash - the most popular payment methods in South Sudan.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bank-Level Security',
      description: 'Your transactions are protected with enterprise-grade security and encryption protocols.'
    },
    {
      icon: ClockIcon,
      title: 'Instant Settlements',
      description: 'Get paid instantly with real-time transaction processing and immediate payment confirmations.'
    },
    {
      icon: ChartBarIcon,
      title: 'Detailed Analytics',
      description: 'Track your business performance with comprehensive analytics and reporting tools.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works perfectly on all devices - desktop, tablet, and mobile.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Local Support',
      description: 'Dedicated customer support team based in Juba, understanding your local business needs.'
    }
  ];

  const stats = [
    { label: 'Businesses Served', value: '500+' },
    { label: 'Transactions Processed', value: '50K+' },
    { label: 'Success Rate', value: '99.9%' },
    { label: 'Cities Covered', value: '10+' }
  ];

  const testimonials = [
    {
      name: 'Sarah Akech',
      business: 'Juba Fashion Store',
      location: 'Juba',
      quote: 'PaySSD has transformed how we accept payments. Our customers love the convenience of mobile money payments.',
      avatar: 'SA'
    },
    {
      name: 'John Garang',
      business: 'Tech Solutions SS',
      location: 'Wau',
      quote: 'The analytics dashboard helps us understand our business better. PaySSD is essential for any modern business.',
      avatar: 'JG'
    },
    {
      name: 'Mary Nyandeng',
      business: 'Malakal Market',
      location: 'Malakal',
      quote: 'Simple setup, reliable payments, and excellent support. PaySSD has made our business more efficient.',
      avatar: 'MN'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      monthlyFee: 'Free',
      transactionFee: '5%',
      description: 'Ideal for individuals and small sellers',
      features: [
        'Basic dashboard',
        'Standard payouts',
        'Email/SMS notifications',
        'Basic reporting'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      monthlyFee: '$10 USD/month',
      transactionFee: '1.5%',
      description: 'Ideal for small–medium merchants',
      features: [
        'Faster payouts',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
        'Team accounts'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Private Account',
      monthlyFee: 'Contact Us',
      transactionFee: 'Custom Rate',
      description: 'For large businesses & institutions',
      features: [
        'White-labeling',
        'API access',
        'Dedicated support',
        'SLA',
        'Custom payment flows'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-accent-500/5 to-primary-800/10 dark:from-primary-400/20 dark:via-accent-400/10 dark:to-primary-600/20"></div>
          <motion.div 
            style={{ y }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-accent-500/30 rounded-full blur-3xl"
          />
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) }}
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-accent-400/20 to-primary-500/20 rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700">
                  <SparklesIcon className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Trusted by 500+ businesses</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
                  Accept Payments
                  <span className="block bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 bg-clip-text text-transparent">
                    Anywhere in South Sudan
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  The most trusted payment gateway for businesses in Juba, Wau, Malakal, and across South Sudan. 
                  Accept MTN Mobile Money and Digicash payments with ease.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                  <PlayIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </motion.div>
              
              {/* Trust indicators */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-8">
                <div className="flex items-center space-x-2">
                  <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">Free integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">24/7 support</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative lg:flex lg:justify-center"
            >
              <motion.div 
                variants={itemVariants}
                className="relative max-w-md mx-auto lg:max-w-lg"
              >
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl shadow-lg flex items-center justify-center"
                >
                  <BoltIcon className="h-8 w-8 text-white" />
                </motion.div>
                
                <motion.div 
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <StarIcon className="h-6 w-6 text-white" />
                </motion.div>
                
                {/* Main card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <CreditCardIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <CheckCircleIconSolid className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Payment Dashboard</h3>
                      <p className="text-gray-600 dark:text-gray-300">Manage all your payments in one place</p>
                    </div>
                    
                    {/* Mock dashboard preview */}
                    <div className="space-y-3">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Today's Revenue</span>
                        <span className="font-bold text-green-600 dark:text-green-400">$45,230</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">127</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200 dark:border-primary-700"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">99.2%</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 bg-clip-text text-transparent mb-3"
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 mb-6">
                <SparklesIcon className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Powerful Features</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Everything You Need to
                <span className="block bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 bg-clip-text text-transparent">
                  Accept Payments
                </span>
              </h2>
              
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Built specifically for South Sudan businesses with features that matter most to local entrepreneurs.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-elevated hover:border-primary-200 dark:hover:border-primary-600 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-900/20 dark:to-accent-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-700 mb-6">
                <StarIcon className="h-4 w-4 text-accent-600 dark:text-accent-400 mr-2" />
                <span className="text-sm font-medium text-accent-700 dark:text-accent-300">Customer Stories</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Trusted by Businesses
                <span className="block bg-gradient-to-r from-accent-600 via-primary-500 to-accent-700 bg-clip-text text-transparent">
                  Across South Sudan
                </span>
              </h2>
              
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                See what our customers in Juba, Wau, and Malakal are saying about PaySSD.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-600 hover:shadow-elevated hover:border-accent-200 dark:hover:border-accent-600 transition-all duration-300 overflow-hidden"
              >
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-100/50 to-primary-100/50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Quote icon */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-6xl text-accent-200 dark:text-accent-700 font-serif leading-none">
                      "
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.business} • {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 mb-6">
                <BoltIcon className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Simple Pricing</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Simple, Transparent
                <span className="block bg-gradient-to-r from-green-600 via-primary-500 to-green-700 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h2>
              
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                No hidden fees. No setup costs. Pay only for successful transactions.
              </p>
            </motion.div>
          </motion.div>

          {/* Billing toggle (UI only) */}
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
              <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 text-white">
                Monthly
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300" disabled>
                Yearly
              </button>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                whileHover={{ y: -8, scale: plan.popular ? 1.02 : 1.05 }}
                className={`
                  group relative rounded-3xl p-8 transition-all duration-300 overflow-hidden
                  ${plan.popular 
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl border-2 border-primary-400 transform scale-105' 
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600 shadow-soft hover:shadow-elevated'
                  }
                `}
              >
                {/* Background effects */}
                {!plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-900/20 dark:to-accent-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {plan.popular && (
                  <>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-gradient-to-r from-accent-400 to-accent-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg"
                      >
                        Most Popular
                      </motion.div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  </>
                )}
                
                <div className="relative z-10 text-center">
                  <motion.h3 
                    whileHover={{ scale: 1.05 }}
                    className={`text-2xl font-bold mb-3 ${
                      plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {plan.name}
                  </motion.h3>
                  
                  <p className={`mb-6 ${plan.popular ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6 space-y-2">
                    <div className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.monthlyFee}
                    </div>
                    <div className={`${plan.popular ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>
                      Transaction fee: {plan.transactionFee}
                    </div>
                    {plan.volume && (
                      <div className={`${plan.popular ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>
                        {plan.volume}
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1 }}
                        className="flex items-center"
                      >
                        <CheckCircleIconSolid className={`h-5 w-5 mr-3 flex-shrink-0 ${
                          plan.popular ? 'text-primary-200' : 'text-green-500'
                        }`} />
                        <span className={`${
                          plan.popular ? 'text-primary-50' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/register"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        group w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 relative overflow-hidden
                        ${plan.popular
                          ? 'bg-white text-primary-600 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 shadow-soft hover:shadow-elevated'
                        }
                      `}
                    >
                      <span className="relative z-10">
                        {plan.cta}
                      </span>
                      {!plan.popular && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-600/20" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-accent-400/20 to-transparent rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <SparklesIcon className="h-5 w-5 text-white mr-3" />
                <span className="text-sm font-bold text-white">Ready to Get Started?</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Ready to Start
                <span className="block bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
                  Accepting Payments?
                </span>
              </h2>
              
              <p className="text-xl lg:text-2xl text-primary-100 max-w-4xl mx-auto leading-relaxed">
                Join hundreds of businesses across South Sudan who trust PaySSD for their payment processing needs.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-white text-primary-700 hover:text-primary-800 font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 text-lg">Create Free Account</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
              
              <a href="mailto:support@payssd.com">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 font-bold px-10 py-5 rounded-2xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 text-lg">Contact Sales</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </a>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center items-center gap-8 pt-12 opacity-80"
            >
              <div className="flex items-center text-white/80">
                <CheckCircleIconSolid className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium">No Setup Fees</span>
              </div>
              <div className="flex items-center text-white/80">
                <CheckCircleIconSolid className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center text-white/80">
                <CheckCircleIconSolid className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium">Instant Activation</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
