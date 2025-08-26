import React, { useState } from 'react'

import { useLazyQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'

const TEST_EMAIL_DELIVERY = gql`
  query TestEmailDelivery($recipientEmail: String!) {
    testEmailDelivery(recipientEmail: $recipientEmail) {
      success
      message
      error
      messageId
      provider
      timestamp
    }
  }
`

const SEND_OUTLOOK_TEST_EMAIL = gql`
  mutation SendOutlookTestEmail($recipientEmail: String!) {
    sendOutlookTestEmail(recipientEmail: $recipientEmail) {
      success
      message
      error
      messageId
      provider
      timestamp
    }
  }
`

const SEND_CUSTOM_DOMAIN_TEST = gql`
  mutation SendCustomDomainTest($recipientEmail: String!) {
    sendCustomDomainTest(recipientEmail: $recipientEmail) {
      success
      message
      error
      messageId
      provider
      timestamp
      deliveryTips
      domainInfo
    }
  }
`

const VALIDATE_EMAIL_PROVIDER = gql`
  mutation ValidateEmailProvider($email: String!) {
    validateEmailProvider(email: $email) {
      success
      message
      error
      provider
      timestamp
      deliveryTips
      domainInfo
    }
  }
`

const OutlookEmailTestComponent = () => {
  const [testEmail, setTestEmail] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [testEmailDelivery] = useLazyQuery(TEST_EMAIL_DELIVERY, {
    onCompleted: (data) => {
      setTestResult(data.testEmailDelivery)
      setIsLoading(false)
    },
    onError: (error) => {
      setTestResult({ success: false, error: error.message })
      setIsLoading(false)
    },
  })

  const [sendOutlookTestEmail] = useMutation(SEND_OUTLOOK_TEST_EMAIL, {
    onCompleted: (data) => {
      setTestResult(data.sendOutlookTestEmail)
      setIsLoading(false)
    },
    onError: (error) => {
      setTestResult({ success: false, error: error.message })
      setIsLoading(false)
    },
  })

  const [sendCustomDomainTest] = useMutation(SEND_CUSTOM_DOMAIN_TEST, {
    onCompleted: (data) => {
      setTestResult(data.sendCustomDomainTest)
      setIsLoading(false)
    },
    onError: (error) => {
      setTestResult({ success: false, error: error.message })
      setIsLoading(false)
    },
  })

  const [validateEmailProvider] = useMutation(VALIDATE_EMAIL_PROVIDER, {
    onCompleted: (data) => {
      setValidationResult(data.validateEmailProvider)
    },
    onError: (error) => {
      setValidationResult({ success: false, error: error.message })
    },
  })

  const handleTestDelivery = async () => {
    if (!testEmail) return

    setIsLoading(true)
    setTestResult(null)
    testEmailDelivery({ variables: { recipientEmail: testEmail } })
  }

  const handleOutlookTest = async () => {
    if (!testEmail) return

    setIsLoading(true)
    setTestResult(null)
    sendOutlookTestEmail({ variables: { recipientEmail: testEmail } })
  }

  const handleCustomDomainTest = async () => {
    if (!testEmail) return

    setIsLoading(true)
    setTestResult(null)
    sendCustomDomainTest({ variables: { recipientEmail: testEmail } })
  }

  const handleValidateProvider = async () => {
    if (!testEmail) return

    setValidationResult(null)
    validateEmailProvider({ variables: { email: testEmail } })
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'outlook':
        return '📧'
      case 'gmail':
        return '📮'
      case 'yahoo':
        return '📬'
      case '2creative':
        return '🏢'
      case 'educational':
        return '📚'
      case 'government':
        return '🏛️'
      case 'custom-domain':
        return '🌐'
      default:
        return '✉️'
    }
  }

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'outlook':
        return 'text-blue-600 bg-blue-50'
      case 'gmail':
        return 'text-red-600 bg-red-50'
      case 'yahoo':
        return 'text-purple-600 bg-purple-50'
      case '2creative':
        return 'text-green-600 bg-green-50'
      case 'educational':
        return 'text-indigo-600 bg-indigo-50'
      case 'government':
        return 'text-gray-600 bg-gray-50'
      case 'custom-domain':
        return 'text-teal-600 bg-teal-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          📧 Multi-Domain Email Testing System
        </h1>
        <p className="text-gray-600">
          Test email notifications with support for Outlook, Gmail, 2Creative,
          and custom business domains
        </p>
      </div>

      {/* Email Input Section */}
      <div className="mb-6 rounded-lg bg-gray-50 p-6">
        <label
          htmlFor="testEmail"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Test Email Address
        </label>
        <div className="flex gap-3">
          <input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address (Gmail, Outlook,  2Creative, or custom domain)"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleValidateProvider}
            className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            disabled={!testEmail}
          >
            🔍 Validate Provider
          </button>
        </div>
      </div>

      {/* Provider Validation Result */}
      {validationResult && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            validationResult.success
              ? 'border border-blue-200 bg-blue-50'
              : 'border border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getProviderIcon(validationResult.provider)}
            </span>
            <span
              className={`rounded px-2 py-1 text-sm font-medium ${getProviderColor(validationResult.provider)}`}
            >
              {validationResult.provider?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <p className="mt-2 text-gray-700">{validationResult.message}</p>
          {validationResult.deliveryTips && (
            <p className="mt-2 text-sm text-gray-600">
              <strong>Delivery Tips:</strong> {validationResult.deliveryTips}
            </p>
          )}
          {validationResult.domainInfo && (
            <p className="mt-2 text-sm text-gray-600">
              <strong>Domain Info:</strong> {validationResult.domainInfo}
            </p>
          )}
        </div>
      )}

      {/* Test Action Buttons */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={handleTestDelivery}
          disabled={!testEmail || isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? '⏳' : '📧'}
          {isLoading ? 'Sending...' : 'General Test'}
        </button>

        <button
          onClick={handleOutlookTest}
          disabled={!testEmail || isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? '⏳' : '🔥'}
          {isLoading ? 'Sending...' : 'Outlook Test'}
        </button>

        <button
          onClick={handleCustomDomainTest}
          disabled={!testEmail || isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? '⏳' : '🌐'}
          {isLoading ? 'Sending...' : 'Custom Domain Test'}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div
          className={`mb-6 rounded-lg p-6 ${
            testResult.success
              ? 'border border-green-200 bg-green-50'
              : 'border border-red-200 bg-red-50'
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{testResult.success ? '✅' : '❌'}</span>
            <h3 className="text-lg font-semibold">
              {testResult.success
                ? 'Test Email Sent Successfully!'
                : 'Test Email Failed'}
            </h3>
          </div>

          {testResult.success ? (
            <div className="space-y-2">
              <p className="text-green-700">{testResult.message}</p>

              {testResult.messageId && (
                <p className="text-sm text-green-600">
                  <strong>Message ID:</strong> {testResult.messageId}
                </p>
              )}

              {testResult.provider && (
                <div className="flex items-center gap-2">
                  <span>Email Provider:</span>
                  <span
                    className={`rounded px-2 py-1 text-sm font-medium ${getProviderColor(testResult.provider)}`}
                  >
                    {getProviderIcon(testResult.provider)}{' '}
                    {testResult.provider?.toUpperCase()}
                  </span>
                </div>
              )}

              {testResult.timestamp && (
                <p className="text-sm text-green-600">
                  <strong>Sent at:</strong>{' '}
                  {new Date(testResult.timestamp).toLocaleString()}
                </p>
              )}

              {/* Display domain-specific information */}
              {testResult.domainInfo && (
                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Domain Analysis:</strong> {testResult.domainInfo}
                  </p>
                </div>
              )}

              {/* Display delivery tips */}
              {testResult.deliveryTips && (
                <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Delivery Tips:</strong> {testResult.deliveryTips}
                  </p>
                </div>
              )}

              {/* Provider-specific instructions */}
              {testResult.provider === 'outlook' && (
                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-800">
                    📧 Outlook Users - Important:
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>
                      • Check your <strong>Spam/Junk</strong> folder if email
                      doesn't appear in inbox
                    </li>
                    <li>
                      • Add{' '}
                      <strong>{process.env.SMTP_USER || 'the sender'}</strong>{' '}
                      to your safe contacts
                    </li>
                    <li>
                      • Email delivery may take 2-5 minutes for Outlook/Hotmail
                      accounts
                    </li>
                    <li>• Mark as "Not Junk" if found in spam folder</li>
                  </ul>
                </div>
              )}

              {/* 2Creative domain specific */}
              {testResult.provider === '2creative' && (
                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                  <h4 className="mb-2 font-medium text-green-800">
                    🏢 2Creative Email - Important:
                  </h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• This is your company's internal email system</li>
                    <li>• Check company spam filtering policies</li>
                    <li>
                      • Contact IT administrator if emails are not delivered
                    </li>
                    <li>
                      • Ensure sender domain is whitelisted in company security
                    </li>
                  </ul>
                </div>
              )}

              {/* Custom domain specific */}
              {testResult.provider === 'custom-domain' && (
                <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 p-4">
                  <h4 className="mb-2 font-medium text-teal-800">
                    🌐 Custom Domain - Important:
                  </h4>
                  <ul className="space-y-1 text-sm text-teal-700">
                    <li>
                      • Custom business domains have varying email
                      configurations
                    </li>
                    <li>
                      • Check spam/junk folder as business domains often have
                      strict filtering
                    </li>
                    <li>
                      • Contact your domain administrator if emails are not
                      received
                    </li>
                    <li>
                      • May require sender authentication (SPF/DKIM/DMARC) setup
                    </li>
                    <li>
                      • Some business domains block external emails by default
                    </li>
                  </ul>
                </div>
              )}

              {/* Educational domain specific */}
              {testResult.provider === 'educational' && (
                <div className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-4">
                  <h4 className="mb-2 font-medium text-indigo-800">
                    📚 Educational Domain - Important:
                  </h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>
                      • Educational institutions have{' '}
                      <strong>extremely strict</strong> email security
                    </li>
                    <li>• Check spam folder and quarantine folder</li>
                    <li>
                      • Contact institution IT support for sender domain
                      whitelisting
                    </li>
                    <li>
                      • May require formal approval process for external senders
                    </li>
                    <li>
                      • Consider using student's personal email as alternative
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium text-red-700">
                Error: {testResult.error}
              </p>

              {testResult.provider === 'outlook' && (
                <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
                  <h4 className="mb-2 font-medium text-yellow-800">
                    🔧 Outlook Troubleshooting:
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>
                      • Verify SMTP settings are configured for Outlook/Hotmail
                    </li>
                    <li>• Check if less secure app access is enabled</li>
                    <li>
                      • Try using App Password instead of regular password
                    </li>
                    <li>• Verify sender email domain reputation</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Information Panel */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">
          ℹ️ Multi-Domain Email Testing
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p>
              <strong>🎯 Supported Email Types:</strong>
            </p>
            <ul className="ml-6 mt-2 space-y-1">
              <li>
                📧 <strong>Outlook/Hotmail/Live:</strong> Enhanced compatibility
                with Microsoft email services
              </li>
              <li>
                📮 <strong>Gmail:</strong> Optimized for Google's email system
              </li>
              <li>
                🏢 <strong>2Creative Company:</strong> Internal company email
                with IT admin guidance
              </li>
              <li>
                📚 <strong>Educational Domains:</strong> Universities and
                schools with enhanced security
              </li>
              <li>
                🌐 <strong>Custom Business Domains:</strong> Any business email
                with domain-specific guidance
              </li>
            </ul>
          </div>

          <div>
            <p>
              <strong>🧪 Testing Options:</strong>
            </p>
            <ul className="ml-6 mt-2 space-y-1">
              <li>
                <strong>General Test:</strong> Standard compatibility for all
                email providers
              </li>
              <li>
                <strong>Outlook Test:</strong> Microsoft-optimized with enhanced
                headers and TLS settings
              </li>
              <li>
                <strong>Custom Domain Test:</strong> Specialized testing with
                domain-specific diagnostics and troubleshooting
              </li>
            </ul>
          </div>

          <div>
            <p>
              <strong>🔧 Advanced Features:</strong>
            </p>
            <ul className="ml-6 mt-2 space-y-1">
              <li>• Automatic email provider detection and classification</li>
              <li>
                • Domain-specific delivery guidance and troubleshooting tips
              </li>
              <li>
                • Enhanced SMTP headers for better email client compatibility
              </li>
              <li>• Plain text versions for strict security environments</li>
              <li>• Real-time delivery status with message ID tracking</li>
              <li>
                • Provider-specific spam folder and security policy guidance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutlookEmailTestComponent
