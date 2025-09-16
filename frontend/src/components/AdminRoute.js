import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isActivated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated or not activated, redirect to login
  if (!isAuthenticated || !isActivated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and activated but not admin, redirect to home
  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // If admin, show the protected admin content
  return children;
};

export default AdminRoute;
