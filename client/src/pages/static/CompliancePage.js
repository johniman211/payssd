import React, { useState } from 'react';
import { ShieldCheckIcon, DocumentTextIcon, GlobeAltIcon, CreditCardIcon, LockClosedIcon, CheckCircleIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const CompliancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const certifications = [
    {
      name: 'PCI DSS Level 1',
      description: 'Payment Card Industry Data Security Standard compliance for secure payment processing.',
      icon: CreditCardIcon,
      status: 'Certified',
      validUntil: 'December 2024',
      details: [
        'Secure network architecture',
        'Regular security testing',
        'Strong access controls',
        'Encrypted data transmission'
      ]
    },
    {
      name: 'SOC 2 Type II',
      description: 'Service Organization Control 2 certification for security, availability, and confidentiality.',
      icon: ShieldCheckIcon,
      status: 'Certified',
      validUntil: 'March 2025',
      details: [
        'Security controls audit',
        'Availability monitoring',
        'Confidentiality measures',
        'Processing integrity'
      ]
    },
    {
      name: 'ISO 27001',
      description: 'International standard for information security management systems.',
      icon: LockClosedIcon,
      status: 'In Progress',
      validUntil: 'Expected Q2 2024',
      details: [
        'Information security policies',
        'Risk management framework',
        'Continuous improvement',
        'Regular audits'
      ]
    },
    {
      name: 'GDPR Compliance',
      description: 'General Data Protection Regulation compliance for EU data protection.',
      icon: UserGroupIcon,
      status: 'Compliant',
      validUntil: 'Ongoing',
      details: [
        'Data protection by design',
        'User consent management',
        'Right to be forgotten',
        'Data breach notification'
      ]
    }
  ];

  const regulations = [
    {
      name: 'PCI DSS',
      region: 'Global',
      description: 'Payment Card Industry Data Security Standard for protecting cardholder data.',
      requirements: [
        'Maintain secure network',
        'Protect cardholder data',
        'Maintain vulnerability management',
        'Implement strong access controls',
        'Monitor and test networks',
        'Maintain information security policy'
      ]
    },
    {
      name: 'GDPR',
      region: 'European Union',
      description: 'General Data Protection Regulation for data protection and privacy.',
      requirements: [
        'Lawful basis for processing',
        'Data subject rights',
        'Privacy by design',
        'Data protection officer',
        'Breach notification',
        'International transfers'
      ]
    },
    {
      name: 'CCPA',
      region: 'California, USA',
      description: 'California Consumer Privacy Act for consumer privacy rights.',
      requirements: [
        'Right to know',
        'Right to delete',
        'Right to opt-out',
        'Non-discrimination',
        'Privacy policy disclosure',
        'Data minimization'
      ]
    },
    {
      name: 'PSD2',
      region: 'European Union',
      description: 'Payment Services Directive 2 for payment services regulation.',
      requirements: [
        'Strong customer authentication',
        'Open banking APIs',
        'Enhanced security measures',
        'Consumer protection',
        'Regulatory oversight',
        'Incident reporting'
      ]
    }
  ];

  const securityMeasures = [
    {
      category: 'Data Encryption',
      icon: LockClosedIcon,
      measures: [
        'AES-256 encryption for data at rest',
        'TLS 1.3 for data in transit',
        'End-to-end encryption for sensitive data',
        'Hardware security modules (HSMs)'
      ]
    },
    {
      category: 'Access Controls',
      icon: UserGroupIcon,
      measures: [
        'Multi-factor authentication (MFA)',
        'Role-based access control (RBAC)',
        'Principle of least privilege',
        'Regular access reviews'
      ]
    },
    {
      category: 'Network Security',
      icon: ShieldCheckIcon,
      measures: [
        'Web application firewalls (WAF)',
        'DDoS protection',
        'Network segmentation',
        'Intrusion detection systems'
      ]
    },
    {
      category: 'Monitoring & Auditing',
      icon: DocumentTextIcon,
      measures: [
        '24/7 security monitoring',
        'Comprehensive audit logs',
        'Real-time threat detection',
        'Regular security assessments'
      ]
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
    { id: 'certifications', name: 'Certifications', icon: CheckCircleIcon },
    { id: 'regulations', name: 'Regulations', icon: DocumentTextIcon },
    { id: 'security', name: 'Security', icon: LockClosedIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Compliance & Security
            </h1>
            <p className="mt-4 text-xl text-green-200 max-w-2xl mx-auto">
              We maintain the highest standards of security and compliance to protect your business and customers.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Commitment to Compliance</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    At PaySSD, security and compliance are not just requirements—they're fundamental to our mission 
                    of providing trusted payment processing services. We maintain rigorous standards and undergo 
                    regular audits to ensure we meet or exceed industry requirements.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Our comprehensive compliance program covers data protection, financial regulations, and security 
                    standards across multiple jurisdictions. We work with leading auditors and security experts to 
                    continuously improve our security posture.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <CreditCardIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">PCI DSS Level 1</h3>
                  <p className="text-gray-600">Highest level of payment security certification</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SOC 2 Type II</h3>
                  <p className="text-gray-600">Comprehensive security controls audit</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <GlobeAltIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">GDPR Compliant</h3>
                  <p className="text-gray-600">EU data protection regulation compliance</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <LockClosedIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank-Grade Security</h3>
                  <p className="text-gray-600">Enterprise-level security infrastructure</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Continuous Monitoring</h3>
                    <p className="text-green-700">
                      Our compliance program includes continuous monitoring, regular audits, and proactive 
                      security measures to ensure we maintain the highest standards at all times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              {certifications.map((cert, index) => {
                const IconComponent = cert.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <IconComponent className="h-8 w-8 text-gray-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">{cert.name}</h2>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        cert.status === 'Certified' || cert.status === 'Compliant'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-6">{cert.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Areas</h3>
                        <ul className="space-y-2">
                          {cert.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center text-gray-700">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Certification Details</h3>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <strong>Status:</strong> {cert.status}
                          </p>
                          <p className="text-gray-700">
                            <strong>Valid Until:</strong> {cert.validUntil}
                          </p>
                          <p className="text-gray-700">
                            <strong>Audit Frequency:</strong> Annual
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Regulations Tab */}
          {activeTab === 'regulations' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Regulatory Compliance</h2>
                <p className="text-gray-700 mb-8">
                  We comply with financial and data protection regulations across multiple jurisdictions 
                  to ensure our services meet local requirements wherever you operate.
                </p>
              </div>
              
              {regulations.map((regulation, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{regulation.name}</h3>
                      <p className="text-gray-600 mt-1">{regulation.region}</p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Compliant
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6">{regulation.description}</p>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {regulation.requirements.map((requirement, reqIndex) => (
                        <div key={reqIndex} className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Security Infrastructure</h2>
                <p className="text-gray-700 mb-8">
                  Our multi-layered security approach protects your data and transactions at every level, 
                  from network infrastructure to application security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {securityMeasures.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-lg p-8">
                      <div className="flex items-center mb-6">
                        <IconComponent className="h-8 w-8 text-gray-600 mr-3" />
                        <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                      </div>
                      <ul className="space-y-3">
                        {category.measures.map((measure, measureIndex) => (
                          <li key={measureIndex} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Incident Response</h3>
                    <p className="text-blue-700">
                      We maintain a comprehensive incident response plan with 24/7 monitoring and rapid 
                      response capabilities. Our security team is trained to handle various types of 
                      security incidents and maintain business continuity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Compliance Questions?
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Our compliance team is here to help with any questions about our security and regulatory standards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Compliance Team</h3>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Email:</strong> compliance@payssd.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Security Team</h3>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Email:</strong> security@payssd.com</p>
                  <p><strong>Emergency:</strong> +1 (555) 987-6543</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;