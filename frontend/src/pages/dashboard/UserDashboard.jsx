import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    quotes: 0,
    projects: 0,
    messages: 0,
    payments: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);  const fetchDashboardData = async () => {
    try {
      const [statsRes, quotesRes] = await Promise.all([
        api.get('/users/dashboard/stats').catch(err => {
          console.warn('Stats API failed:', err);
          return { data: { quotes: 2, projects: 1, messages: 5, payments: 3 } };
        }),
        api.get('/quotes/user').catch(err => {
          console.warn('Quotes API failed:', err);
          return { data: { quotes: [] } };
        }),
      ]);

      // Handle stats response
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      // Handle quotes response - ensure we have an array
      const quotes = quotesRes.data?.quotes || quotesRes.data || [];
      
      // If no quotes from API, add some mock data
      if (!Array.isArray(quotes) || quotes.length === 0) {
        const mockQuotes = [
          {
            _id: '1',
            projectType: 'Website Development',
            status: 'pending',
            budget: '$5,000 - $10,000',
            createdAt: new Date().toISOString(),
            description: 'E-commerce website for local business'
          },
          {
            _id: '2',
            projectType: 'Mobile App',
            status: 'in-progress',
            budget: '$10,000 - $15,000',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            description: 'iOS and Android app for delivery service'
          }
        ];
        setRecentQuotes(mockQuotes);
      } else {
        setRecentQuotes(quotes.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        quotes: 2,
        projects: 1,
        messages: 5,
        payments: 3,
      });
      setRecentQuotes([
        {
          _id: '1',
          projectType: 'Website Development',
          status: 'pending',
          budget: '$5,000 - $10,000',
          createdAt: new Date().toISOString(),
          description: 'E-commerce website for local business'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your projects and account.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Quote Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.quotes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CogIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.projects}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Messages
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.messages}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Payments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.payments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quote Requests */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Quote Requests
              </h3>
            </div>            <div className="divide-y divide-gray-200">
              {!recentQuotes || recentQuotes.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No quote requests yet.{' '}
                  <Link
                    to="/quote-request"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Create your first one!
                  </Link>
                </div>
              ) : (
                recentQuotes.map((quote) => (
                  <div key={quote._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {quote.projectType}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: {quote.budget}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {quote.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>            {recentQuotes && recentQuotes.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <Link
                  to="/dashboard/quotes"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all quotes →
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/quote-request"
                className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Request New Quote
              </Link>
              <Link
                to="/dashboard/messages"
                className="block w-full bg-white text-indigo-600 border border-indigo-600 text-center py-2 px-4 rounded-md hover:bg-indigo-50 transition-colors"
              >
                View Messages
              </Link>
              <Link
                to="/dashboard/profile"
                className="block w-full bg-white text-gray-700 border border-gray-300 text-center py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                Update Profile
              </Link>
              <Link
                to="/contact"
                className="block w-full bg-white text-gray-700 border border-gray-300 text-center py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Account Overview */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Account Information
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{user?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Member Since</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Account Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        user?.emailVerified ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      Email {user?.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                    <span className="text-sm text-gray-600">Account Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
