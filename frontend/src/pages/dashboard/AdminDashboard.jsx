import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowTrendingUpIcon, // ✅ Correct import
} from '@heroicons/react/24/outline';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
    totalRevenue: 0,
    activeProjects: 0,
    blogPosts: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, quotesRes] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/quotes?limit=5'),
      ]);

      setStats(statsRes.data);
      setRecentQuotes(quotesRes.data.quotes);

      setRecentActivity([
        {
          id: 1,
          type: 'user_registered',
          message: 'New user registered',
          time: '2 hours ago',
        },
        {
          id: 2,
          type: 'quote_submitted',
          message: 'New quote request submitted',
          time: '4 hours ago',
        },
        {
          id: 3,
          type: 'payment_received',
          message: 'Payment received for Project #123',
          time: '6 hours ago',
        },
        {
          id: 4,
          type: 'blog_published',
          message: 'New blog post published',
          time: '1 day ago',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <UsersIcon className="h-4 w-4 text-green-500" />;
      case 'quote_submitted':
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case 'payment_received':
        return <CurrencyDollarIcon className="h-4 w-4 text-green-500" />;
      case 'blog_published':
        return <DocumentTextIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <EyeIcon className="h-4 w-4 text-gray-500" />;
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
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor your business performance and manage operations.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard icon={<UsersIcon className="h-6 w-6 text-blue-400" />} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={<DocumentTextIcon className="h-6 w-6 text-yellow-400" />} label="Total Quotes" value={stats.totalQuotes} />
          <StatCard icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-red-400" />} label="Pending Quotes" value={stats.pendingQuotes} />
          <StatCard icon={<CurrencyDollarIcon className="h-6 w-6 text-green-400" />} label="Revenue" value={`$${stats.totalRevenue?.toLocaleString() || 0}`} />
          <StatCard icon={<ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />} label="Active Projects" value={stats.activeProjects} />
          <StatCard icon={<DocumentTextIcon className="h-6 w-6 text-indigo-400" />} label="Blog Posts" value={stats.blogPosts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quote Requests */}
          <RecentQuotes recentQuotes={recentQuotes} getStatusColor={getStatusColor} />

          {/* Recent Activity */}
          <RecentActivity recentActivity={recentActivity} getActivityIcon={getActivityIcon} />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
};

// Extracted Components for Cleaner JSX

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const RecentQuotes = ({ recentQuotes, getStatusColor }) => (
  <div className="bg-white shadow rounded-lg">
    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">Recent Quote Requests</h3>
      <Link to="/admin/quotes" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
    </div>
    <div className="divide-y divide-gray-200">
      {recentQuotes.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No recent quote requests.</div>
      ) : (
        recentQuotes.map((quote) => (
          <div key={quote._id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{quote.projectType}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                    {quote.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{quote.name} • {quote.budget}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(quote.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const RecentActivity = ({ recentActivity, getActivityIcon }) => (
  <div className="bg-white shadow rounded-lg">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
    </div>
    <div className="divide-y divide-gray-200">
      {recentActivity.map((activity) => (
        <div key={activity.id} className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions = () => (
  <div className="mt-8 bg-white shadow rounded-lg">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionLink to="/admin/users" icon={<UsersIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />} label="Manage Users" bgColor="blue" />
        <QuickActionLink to="/admin/quotes" icon={<DocumentTextIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />} label="Review Quotes" bgColor="yellow" />
        <QuickActionLink to="/admin/blog" icon={<DocumentTextIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />} label="Manage Blog" bgColor="purple" />
        <QuickActionLink to="/admin/analytics" icon={<ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />} label="View Analytics" bgColor="green" />
      </div>
    </div>
  </div>
);

const QuickActionLink = ({ to, icon, label, bgColor }) => (
  <Link
    to={to}
    className={`block bg-${bgColor}-50 hover:bg-${bgColor}-100 p-4 rounded-lg text-center transition-colors`}
  >
    {icon}
    <span className={`text-sm font-medium text-${bgColor}-900`}>{label}</span>
  </Link>
);

export default AdminDashboard;
