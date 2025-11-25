import React from 'react';
import { DocumentTextIcon, ScaleIcon, ShieldCheckIcon, ExclamationTriangleIcon, CreditCardIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const TermsOfServicePage = () => {
  const lastUpdated = 'January 15, 2024';
  const effectiveDate = 'January 15, 2024';

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: DocumentTextIcon,
      content: [
        {
          text: 'By accessing or using PaySSD\'s services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our services.'
        },
        {
          text: 'These Terms constitute a legally binding agreement between you and PaySSD Inc. ("PaySSD", "we", "us", or "our").'
        },
        {
          text: 'We may modify these Terms at any time. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.'
        }
      ]
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: CreditCardIcon,
      content: [
        {
          subtitle: 'Payment Processing',
          text: 'PaySSD provides payment processing services that enable merchants to accept and process electronic payments from customers through various payment methods.'
        },
        {
          subtitle: 'API and Integration Tools',
          text: 'We offer APIs, SDKs, and other integration tools to help merchants integrate our payment processing capabilities into their websites and applications.'
        },
        {
          subtitle: 'Dashboard and Reporting',
          text: 'Our platform includes a merchant dashboard for managing transactions, viewing reports, and accessing account information.'
        },
        {
          subtitle: 'Additional Services',
          text: 'We may offer additional services such as fraud protection, analytics, and customer support tools as part of our platform.'
        }
      ]
    },
    {
      id: 'eligibility',
      title: 'Eligibility and Account Registration',
      icon: UserGroupIcon,
      content: [
        {
          subtitle: 'Eligibility Requirements',
          text: 'You must be at least 18 years old and have the legal capacity to enter into contracts. Businesses must be legally established and authorized to conduct business in their jurisdiction.'
        },
        {
          subtitle: 'Account Information',
          text: 'You must provide accurate, complete, and current information when creating your account. You are responsible for maintaining the confidentiality of your account credentials.'
        },
        {
          subtitle: 'Verification Process',
          text: 'We may require you to complete a verification process, including providing documentation to verify your identity and business information (KYC/KYB procedures).'
        },
        {
          subtitle: 'Account Responsibility',
          text: 'You are responsible for all activities that occur under your account and must notify us immediately of any unauthorized use.'
        }
      ]
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: 'Permitted Uses',
          text: 'You may use our services only for lawful purposes and in accordance with these Terms. You must comply with all applicable laws and regulations.'
        },
        {
          subtitle: 'Prohibited Activities',
          text: 'You may not use our services for illegal activities, fraud, money laundering, terrorist financing, or any other prohibited purposes as defined in our Acceptable Use Policy.'
        },
        {
          subtitle: 'High-Risk Industries',
          text: 'Certain high-risk industries may be subject to additional restrictions or may be prohibited from using our services. Please contact us for clarification.'
        },
        {
          subtitle: 'Compliance Obligations',
          text: 'You must comply with all applicable payment card industry standards, data protection laws, and other relevant regulations.'
        }
      ]
    },
    {
      id: 'fees-payments',
      title: 'Fees and Payments',
      icon: CreditCardIcon,
      content: [
        {
          subtitle: 'Transaction Fees',
          text: 'We charge fees for processing transactions as outlined in our pricing schedule. Fees may vary based on transaction type, volume, and other factors.'
        },
        {
          subtitle: 'Additional Fees',
          text: 'Additional fees may apply for certain services, such as chargebacks, refunds, international transactions, or premium features.'
        },
        {
          subtitle: 'Fee Changes',
          text: 'We may change our fees with appropriate notice. Continued use of our services after fee changes constitutes acceptance of the new fees.'
        },
        {
          subtitle: 'Payment Terms',
          text: 'Fees are automatically deducted from your transaction proceeds or charged to your designated payment method. All fees are non-refundable unless otherwise specified.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security and Privacy',
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: 'Data Protection',
          text: 'We implement industry-standard security measures to protect your data and maintain PCI DSS compliance for payment card data.'
        },
        {
          subtitle: 'Privacy Policy',
          text: 'Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.'
        },
        {
          subtitle: 'Data Sharing',
          text: 'You authorize us to share transaction data with relevant parties (banks, card networks, etc.) as necessary to process payments and comply with legal requirements.'
        },
        {
          subtitle: 'Data Retention',
          text: 'We retain transaction and account data as required by law and our business needs, typically for a period of 7 years or as otherwise required.'
        }
      ]
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: ExclamationTriangleIcon,
      content: [
        {
          subtitle: 'Service Availability',
          text: 'While we strive for high availability, we do not guarantee uninterrupted service. We are not liable for service interruptions or downtime.'
        },
        {
          subtitle: 'Limitation of Damages',
          text: 'Our liability is limited to the fees paid by you in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.'
        },
        {
          subtitle: 'Third-Party Services',
          text: 'We are not responsible for the actions or services of third parties, including banks, card networks, or other service providers.'
        },
        {
          subtitle: 'Force Majeure',
          text: 'We are not liable for delays or failures due to circumstances beyond our reasonable control, including natural disasters, government actions, or technical failures.'
        }
      ]
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: ExclamationTriangleIcon,
      content: [
        {
          subtitle: 'Termination by You',
          text: 'You may terminate your account at any time by providing written notice. You remain liable for all fees and obligations incurred before termination.'
        },
        {
          subtitle: 'Termination by Us',
          text: 'We may terminate or suspend your account immediately for violation of these Terms, suspected fraud, or other reasons outlined in our policies.'
        },
        {
          subtitle: 'Effect of Termination',
          text: 'Upon termination, your right to use our services ceases immediately. We may retain your data as required by law or our business needs.'
        },
        {
          subtitle: 'Survival',
          text: 'Certain provisions of these Terms will survive termination, including payment obligations, liability limitations, and dispute resolution procedures.'
        }
      ]
    },
    {
      id: 'dispute-resolution',
      title: 'Dispute Resolution',
      icon: ScaleIcon,
      content: [
        {
          subtitle: 'Governing Law',
          text: 'These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.'
        },
        {
          subtitle: 'Arbitration',
          text: 'Most disputes will be resolved through binding arbitration rather than court proceedings, except for certain types of claims as specified.'
        },
        {
          subtitle: 'Class Action Waiver',
          text: 'You agree to resolve disputes individually and waive the right to participate in class actions or collective proceedings.'
        },
        {
          subtitle: 'Informal Resolution',
          text: 'Before initiating formal proceedings, you agree to attempt to resolve disputes through informal negotiation by contacting our support team.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our payment processing services.
            </p>
            <div className="mt-6 text-gray-400">
              <p>Last updated: {lastUpdated}</p>
              <p>Effective date: {effectiveDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to PaySSD. These Terms of Service ("Terms") govern your use of our payment processing 
              services, website, APIs, and related services (collectively, the "Services"). Please read these 
              Terms carefully as they contain important information about your rights and obligations.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
                  <p className="text-yellow-700">
                    By using our services, you agree to these Terms. If you do not agree, please do not use our services. 
                    These Terms include important provisions such as limitation of liability and dispute resolution procedures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <IconComponent className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-medium text-gray-900">
                    {index + 1}. {section.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <section key={section.id} id={section.id} className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <IconComponent className="h-8 w-8 text-gray-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        {item.subtitle && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {item.subtitle}
                          </h3>
                        )}
                        <p className="text-gray-700 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Legal Information */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Additional Legal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Intellectual Property
                </h3>
                <p className="text-gray-700 mb-4">
                  All content, features, and functionality of our services are owned by PaySSD and are protected 
                  by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Indemnification
                </h3>
                <p className="text-gray-700 mb-4">
                  You agree to indemnify and hold PaySSD harmless from any claims, damages, or expenses arising 
                  from your use of our services or violation of these Terms.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Severability
                </h3>
                <p className="text-gray-700 mb-4">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will 
                  continue to be valid and enforceable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Entire Agreement
                </h3>
                <p className="text-gray-700 mb-4">
                  These Terms, together with our Privacy Policy and other referenced policies, constitute the 
                  entire agreement between you and PaySSD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions About These Terms?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Legal Department
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> legal@payssd.com</p>
                  <p><strong>Address:</strong> Juba, South Sudan</p>
                  <p><strong>Phone:</strong> +211929385157</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Customer Support
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> support@payssd.com</p>
                  <p><strong>Live Chat:</strong> Available 24/7</p>
                  <p><strong>Help Center:</strong> help.payssd.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Updates Notice */}
      <div className="py-12 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Terms Updates
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              We may update these Terms from time to time. We will notify you of material changes 
              and your continued use constitutes acceptance of the updated Terms.
            </p>
            <p className="text-gray-400">
              We recommend reviewing these Terms periodically to stay informed of any changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
