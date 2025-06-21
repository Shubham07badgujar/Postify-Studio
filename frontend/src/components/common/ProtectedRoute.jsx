import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isEmailVerified) {
    // Redirect to email verification page
    return <Navigate to="/verify-email" replace />;
  }

  // Check for admin-only access
  if (adminOnly && user.role !== 'admin') {
    // Redirect to regular dashboard or home for non-admin users
    return <Navigate to="/dashboard" replace />;
  }

  // Check for specific required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
