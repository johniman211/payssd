import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const PrivacyPolicyPage = () => {
  const lastUpdated = 'January 15, 2024';

  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: EyeIcon,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect personal information that you provide directly to us, such as when you create an account, make a payment, or contact us for support. This may include your name, email address, phone number, billing address, and payment information.'
        },
        {
          subtitle: 'Transaction Data',
          text: 'We collect information about your transactions, including payment amounts, merchant information, transaction dates and times, and payment methods used.'
        },
        {
          subtitle: 'Technical Information',
          text: 'We automatically collect certain technical information when you use our services, including your IP address, browser type, device information, operating system, and usage patterns.'
        },
        {
          subtitle: 'Cookies and Tracking',
          text: 'We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.'
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: 'Service Provision',
          text: 'We use your information to provide, maintain, and improve our payment processing services, including processing transactions, preventing fraud, and ensuring security.'
        },
        {
          subtitle: 'Communication',
          text: 'We may use your contact information to send you service-related notifications, updates about our services, and respond to your inquiries.'
        },
        {
          subtitle: 'Legal Compliance',
          text: 'We use your information to comply with applicable laws, regulations, and industry standards, including anti-money laundering (AML) and know your customer (KYC) requirements.'
        },
        {
          subtitle: 'Analytics and Improvement',
          text: 'We analyze usage patterns and feedback to improve our services, develop new features, and enhance user experience.'
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing and Disclosure',
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: 'Service Providers',
          text: 'We may share your information with trusted third-party service providers who assist us in operating our business, such as payment processors, cloud hosting providers, and customer support platforms.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information when required by law, court order, or government request, or when we believe disclosure is necessary to protect our rights, property, or safety.'
        },
        {
          subtitle: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction, subject to appropriate confidentiality protections.'
        },
        {
          subtitle: 'Consent',
          text: 'We may share your information with your explicit consent or at your direction, such as when you authorize us to share data with third-party applications.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: LockClosedIcon,
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We implement industry-standard security measures to protect your information, including encryption, secure data transmission, access controls, and regular security audits.'
        },
        {
          subtitle: 'PCI DSS Compliance',
          text: 'Our payment processing infrastructure is PCI DSS compliant, ensuring that payment card data is handled according to the highest security standards.'
        },
        {
          subtitle: 'Data Retention',
          text: 'We retain your information only as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.'
        },
        {
          subtitle: 'Incident Response',
          text: 'In the unlikely event of a data breach, we have procedures in place to respond quickly, assess the impact, and notify affected users and relevant authorities as required by law.'
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights and Choices',
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: 'Access and Correction',
          text: 'You have the right to access, update, or correct your personal information. You can do this through your account settings or by contacting our support team.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You have the right to request a copy of your personal information in a structured, machine-readable format.'
        },
        {
          subtitle: 'Deletion',
          text: 'You may request deletion of your personal information, subject to certain limitations such as legal retention requirements and legitimate business needs.'
        },
        {
          subtitle: 'Marketing Communications',
          text: 'You can opt out of marketing communications at any time by using the unsubscribe link in our emails or updating your communication preferences in your account.'
        }
      ]
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: 'Global Operations',
          text: 'PaySSD operates globally, and your information may be transferred to and processed in countries other than your country of residence.'
        },
        {
          subtitle: 'Adequate Protection',
          text: 'When we transfer your information internationally, we ensure appropriate safeguards are in place, such as standard contractual clauses or adequacy decisions.'
        },
        {
          subtitle: 'EU-US Data Transfers',
          text: 'For transfers from the European Union to the United States, we comply with applicable data protection frameworks and regulations.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="mt-2 text-blue-200">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              At PaySSD, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              payment processing services, website, and related applications.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              We encourage you to read this policy carefully and contact us if you have any questions.
            </p>
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
                  <IconComponent className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">
                    {index + 1}. {section.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Policy Sections */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <section key={section.id} id={section.id} className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <IconComponent className="h-8 w-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {index + 1}. {section.title}
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {item.subtitle}
                        </h3>
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

      {/* Additional Information */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Us About Privacy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Privacy Questions
                </h3>
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@payssd.com</p>
                  <p><strong>Address:</strong> 123 Payment Street, Tech City, TC 12345</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Data Protection Officer
                </h3>
                <p className="text-gray-700 mb-4">
                  For EU residents, you can contact our Data Protection Officer:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> dpo@payssd.com</p>
                  <p><strong>Address:</strong> PaySSD EU Office, Privacy Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Updates */}
      <div className="py-12 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Policy Updates
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-blue-200">
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;