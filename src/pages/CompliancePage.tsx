import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Shield, Lock, CheckCircle, FileText, Award, Users, Eye, CreditCard } from 'lucide-react';

export const CompliancePage: React.FC = () => {
  const certifications = [
    {
      name: 'PCI DSS Level 1',
      description: 'Payment Card Industry Data Security Standard compliance',
      icon: CreditCard,
      status: 'Certified'
    },
    {
      name: 'ISO 27001',
      description: 'Information Security Management System certification',
      icon: Shield,
      status: 'Certified'
    },
    {
      name: 'SOC 2 Type II',
      description: 'Service Organization Control audit compliance',
      icon: CheckCircle,
      status: 'Certified'
    },
    {
      name: 'GDPR Compliant',
      description: 'General Data Protection Regulation compliance',
      icon: Eye,
      status: 'Compliant'
    }
  ];

  const securityFeatures = [
    {
      title: 'End-to-End Encryption',
      description: 'All data is encrypted in transit and at rest using AES-256 encryption',
      icon: Lock
    },
    {
      title: 'Tokenization',
      description: 'Sensitive payment data is replaced with secure tokens',
      icon: Shield
    },
    {
      title: 'Multi-Factor Authentication',
      description: 'Advanced authentication methods to protect user accounts',
      icon: Users
    },
    {
      title: 'Regular Security Audits',
      description: 'Continuous security assessments and vulnerability testing',
      icon: Award
    }
  ];

  const privacyPrinciples = [
    {
      title: 'Data Minimization',
      description: 'We only collect data that is necessary for our services'
    },
    {
      title: 'Purpose Limitation',
      description: 'Your data is used only for specified, explicit purposes'
    },
    {
      title: 'Transparency',
      description: 'Clear information about how we collect and use your data'
    },
    {
      title: 'User Control',
      description: 'You have control over your personal data and preferences'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Security & Compliance
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              PaySSD is built with enterprise-grade security and compliance at its core. 
              We maintain the highest standards to protect your data and ensure regulatory compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Certifications Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Certifications</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We maintain industry-leading certifications to ensure the highest security standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {cert.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced security measures to protect your data and transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to protecting your privacy and personal information
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {privacyPrinciples.map((principle, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{principle.title}</h3>
                    <p className="text-gray-600">{principle.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Collection & Usage</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  We collect personal information that you provide to us when you register for our services, 
                  make payments, or contact our support team. This may include your name, email address, 
                  phone number, and payment information.
                </p>
                <p>
                  We use this information to provide and improve our services, process transactions, 
                  communicate with you, and comply with legal obligations. We do not sell your personal 
                  information to third parties.
                </p>
                <p>
                  You have the right to access, correct, or delete your personal information. 
                  Please contact us at privacy@payssd.com for any privacy-related requests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please read our terms and conditions carefully before using our services
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Service Agreement
                </h3>
                <p className="text-gray-600 mb-4">
                  By using PaySSD services, you agree to comply with our terms of service. 
                  Our services are provided on an "as is" and "as available" basis.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>You must be 18 years or older to use our services</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You agree to provide accurate and complete information</li>
                  <li>You will not use our services for illegal activities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Payment Terms
                </h3>
                <p className="text-gray-600 mb-4">
                  Payment processing fees are clearly displayed before transaction completion. 
                  All fees are non-refundable unless otherwise specified.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Transaction fees vary by payment method and currency</li>
                  <li>Settlement periods may vary based on your subscription plan</li>
                  <li>Chargebacks may incur additional fees</li>
                  <li>We reserve the right to hold funds for security purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Liability & Disclaimers
                </h3>
                <p className="text-gray-600 mb-4">
                  We strive to provide reliable and secure services, but we cannot guarantee 
                  uninterrupted access or complete security.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>We are not liable for indirect or consequential damages</li>
                  <li>Our total liability is limited to fees paid in the past 12 months</li>
                  <li>We are not responsible for third-party service failures</li>
                  <li>You indemnify us against claims arising from your use of services</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions about Compliance?</h2>
          <p className="text-gray-600 mb-6">
            Contact our compliance team for any security or regulatory inquiries
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="mailto:compliance@payssd.com" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              <Mail className="h-5 w-5 mr-2" />
              compliance@payssd.com
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};