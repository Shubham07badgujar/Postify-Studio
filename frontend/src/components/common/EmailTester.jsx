import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const EmailTester = () => {
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');

  const checkEmailConfiguration = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/test/email-config');
      setEmailStatus({
        type: 'success',
        message: 'Email configuration is working properly',
        details: response.data
      });
    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: 'Email configuration failed',
        details: error.response?.data || { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironmentVariables = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/test/email-env');
      setEmailStatus({
        type: response.data.configured ? 'success' : 'warning',
        message: response.data.message,
        details: response.data
      });
    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: 'Failed to check environment variables',
        details: error.response?.data || { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testName) {
      setEmailStatus({
        type: 'warning',
        message: 'Please provide both email and name for testing'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/test/send-email', {
        email: testEmail,
        name: testName
      });
      setEmailStatus({
        type: 'success',
        message: 'Test email sent successfully!',
        details: response.data
      });
    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: 'Failed to send test email',
        details: error.response?.data || { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Email System Diagnostics</h3>
      
      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={checkEnvironmentVariables}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking...' : 'Check Environment'}
        </button>
        
        <button
          onClick={checkEmailConfiguration}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Testing...' : 'Test Configuration'}
        </button>
        
        <button
          onClick={sendTestEmail}
          disabled={loading || !testEmail || !testName}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      {/* Test Email Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Name
          </label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter name for test"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status Display */}
      {emailStatus && (
        <div className={`border rounded-lg p-4 ${getStatusBgColor(emailStatus.type)}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getStatusIcon(emailStatus.type)}
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {emailStatus.message}
              </h4>
              
              {emailStatus.details && (
                <div className="mt-2">
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(emailStatus.details, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Configuration Guide */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Email Configuration Requirements
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>EMAIL_HOST:</strong> SMTP server (e.g., smtp.gmail.com)</li>
          <li>• <strong>EMAIL_PORT:</strong> SMTP port (587 for TLS, 465 for SSL)</li>
          <li>• <strong>EMAIL_USER:</strong> Your email address</li>
          <li>• <strong>EMAIL_PASS:</strong> App password (not regular password)</li>
          <li>• <strong>FRONTEND_URL:</strong> Your frontend URL for email links</li>
        </ul>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>For Gmail:</strong> You need to enable 2-factor authentication and create an "App Password" 
            instead of using your regular password. Regular passwords won't work with SMTP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailTester;
