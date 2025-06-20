import { useAuth } from '../../contexts/AuthContext';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user.role === 'admin' || user.isAdmin;

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;
