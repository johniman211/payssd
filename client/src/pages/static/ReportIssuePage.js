import React, { useState } from 'react';
import { ExclamationTriangleIcon, BugAntIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ReportIssuePage = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    priority: '',
    subject: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: '',
    apiEndpoint: '',
    errorMessage: '',
    contactEmail: '',
    attachments: []
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const issueTypes = [
    { id: 'bug', name: 'Bug Report', icon: BugAntIcon, description: 'Something is not working as expected' },
    { id: 'feature', name: 'Feature Request', icon: QuestionMarkCircleIcon, description: 'Suggest a new feature or improvement' },
    { id: 'api', name: 'API Issue', icon: ExclamationTriangleIcon, description: 'Problems with API endpoints or responses' },
    { id: 'security', name: 'Security Concern', icon: ExclamationTriangleIcon, description: 'Report a security vulnerability' },
    { id: 'performance', name: 'Performance Issue', icon: ExclamationTriangleIcon, description: 'Slow response times or timeouts' },
    { id: 'other', name: 'Other', icon: ChatBubbleLeftRightIcon, description: 'General questions or other issues' }
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800', description: 'Minor issue, no immediate impact' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Moderate impact on functionality' },
    { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-800', description: 'Significant impact on operations' },
    { id: 'critical', name: 'Critical', color: 'bg-red-100 text-red-800', description: 'Service is down or severely impacted' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Issue Reported Successfully
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for reporting this issue. We've received your report and will investigate it promptly.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              <strong>Ticket ID:</strong> #ISS-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
            <p className="text-sm text-gray-600">
              You'll receive updates at: {formData.contactEmail}
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                issueType: '',
                priority: '',
                subject: '',
                description: '',
                stepsToReproduce: '',
                expectedBehavior: '',
                actualBehavior: '',
                browserInfo: '',
                apiEndpoint: '',
                errorMessage: '',
                contactEmail: '',
                attachments: []
              });
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Report an Issue
            </h1>
            <p className="mt-4 text-xl text-red-100 max-w-2xl mx-auto">
              Help us improve PaySSD by reporting bugs, issues, or suggesting improvements
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Before you report an issue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <QuestionMarkCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Documentation</h3>
              <p className="text-gray-600 mb-4">Review our documentation and FAQ for common solutions</p>
              <button className="text-blue-600 font-medium hover:text-blue-700">
                View Docs →
              </button>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Status Page</h3>
              <p className="text-gray-600 mb-4">See if there are any known issues or outages</p>
              <button className="text-green-600 font-medium hover:text-green-700">
                View Status →
              </button>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">Get immediate help from our support team</p>
              <button className="text-purple-600 font-medium hover:text-purple-700">
                Live Chat →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Report Form */}
      <div className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Report an Issue</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Issue Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  What type of issue are you reporting? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {issueTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                          formData.issueType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, issueType: type.id }))}
                      >
                        <div className="flex items-start">
                          <IconComponent className="h-6 w-6 text-gray-600 mt-1" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">
                              {type.name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {type.description}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="issueType"
                          value={type.id}
                          checked={formData.issueType === type.id}
                          onChange={handleInputChange}
                          className="absolute top-4 right-4"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Priority Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {priorities.map((priority) => (
                    <div
                      key={priority.id}
                      className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                        formData.priority === priority.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.id }))}
                    >
                      <div className="text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priority.color} mb-2`}>
                          {priority.name}
                        </span>
                        <p className="text-xs text-gray-600">
                          {priority.description}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="priority"
                        value={priority.id}
                        checked={formData.priority === priority.id}
                        onChange={handleInputChange}
                        className="absolute top-2 right-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the issue"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a detailed description of the issue..."
                />
              </div>

              {/* Conditional fields based on issue type */}
              {(formData.issueType === 'bug' || formData.issueType === 'performance') && (
                <>
                  <div>
                    <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-gray-700 mb-2">
                      Steps to Reproduce
                    </label>
                    <textarea
                      id="stepsToReproduce"
                      name="stepsToReproduce"
                      value={formData.stepsToReproduce}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1. Go to...\n2. Click on...\n3. See error"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Behavior
                      </label>
                      <textarea
                        id="expectedBehavior"
                        name="expectedBehavior"
                        value={formData.expectedBehavior}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What should happen?"
                      />
                    </div>

                    <div>
                      <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Behavior
                      </label>
                      <textarea
                        id="actualBehavior"
                        name="actualBehavior"
                        value={formData.actualBehavior}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What actually happens?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="browserInfo" className="block text-sm font-medium text-gray-700 mb-2">
                      Browser/Environment Information
                    </label>
                    <input
                      type="text"
                      id="browserInfo"
                      name="browserInfo"
                      value={formData.browserInfo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Chrome 120.0, Windows 11, Node.js 18.x"
                    />
                  </div>
                </>
              )}

              {formData.issueType === 'api' && (
                <>
                  <div>
                    <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700 mb-2">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      id="apiEndpoint"
                      name="apiEndpoint"
                      value={formData.apiEndpoint}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., POST /api/payments/create-link"
                    />
                  </div>

                  <div>
                    <label htmlFor="errorMessage" className="block text-sm font-medium text-gray-700 mb-2">
                      Error Message/Response
                    </label>
                    <textarea
                      id="errorMessage"
                      name="errorMessage"
                      value={formData.errorMessage}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paste the error message or response here..."
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!formData.issueType || !formData.priority || !formData.subject || !formData.description || !formData.contactEmail}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit Issue Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Additional Help */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-gray-600 mb-8">
              For urgent issues or if you need immediate assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Live Chat Support
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Call Support: +211929385157
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;