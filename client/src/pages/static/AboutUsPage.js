import React from 'react';
import { CheckCircleIcon, UserGroupIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AboutUsPage = () => {
  const values = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-blue-600" />,
      title: 'Security First',
      description: 'We prioritize the security of your transactions and data with enterprise-grade encryption and compliance standards.'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-blue-600" />,
      title: 'Customer Focused',
      description: 'Our customers are at the heart of everything we do. We build solutions that solve real problems for real businesses.'
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-blue-600" />,
      title: 'Global Reach',
      description: 'We enable businesses worldwide to accept payments seamlessly, breaking down geographical barriers to commerce.'
    },
    {
      icon: <CheckCircleIcon className="h-8 w-8 text-blue-600" />,
      title: 'Reliability',
      description: 'Our platform is built for 99.9% uptime, ensuring your payment processing never stops when you need it most.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former VP of Payments at a Fortune 500 company with 15+ years in fintech.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'Former Lead Engineer at major payment processors, expert in scalable payment infrastructure.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product leader with a passion for creating intuitive payment experiences for businesses of all sizes.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'David Kim',
      role: 'Head of Security',
      bio: 'Cybersecurity expert ensuring the highest standards of payment security and compliance.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'PaySSD was founded with a mission to simplify online payments for businesses worldwide.'
    },
    {
      year: '2021',
      title: 'First 1,000 Customers',
      description: 'Reached our first milestone of 1,000 active merchants processing payments through our platform.'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $10M in Series A funding to expand our platform and reach more businesses globally.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded to 25+ countries and processed over $100M in payment volume.'
    },
    {
      year: '2024',
      title: 'Enterprise Solutions',
      description: 'Launched enterprise-grade solutions serving Fortune 500 companies and processing $1B+ annually.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              About PaySSD
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              We're on a mission to make online payments simple, secure, and accessible for businesses of all sizes around the world.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              To democratize access to modern payment infrastructure and empower businesses to grow without the complexity of traditional payment systems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  PaySSD was born out of frustration with the complexity and high costs of existing payment solutions. Our founders, having worked at major financial institutions and tech companies, saw firsthand how difficult it was for businesses to implement reliable payment processing.
                </p>
                <p>
                  We set out to build a platform that would make accepting payments as simple as sending an email. Today, thousands of businesses trust PaySSD to handle their payment processing, from small startups to enterprise companies.
                </p>
                <p>
                  Our commitment to transparency, security, and developer-friendly tools has made us the preferred choice for businesses looking to scale their payment operations without the traditional barriers.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Team collaboration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Key milestones in our mission to transform online payments
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-300"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}>
                  <div className={`w-1/2 ${
                    index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'
                  }`}>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              The passionate people behind PaySSD
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Merchants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2B+</div>
              <div className="text-blue-100">Processed Volume</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-blue-100">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Ready to join thousands of businesses?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start accepting payments in minutes with PaySSD
          </p>
          <div className="space-x-4">
            <a
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;