import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import ActivationPage from '../pages/ActivationPage';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, onNavigateToLogin, onNavigateToRegister, onNavigateToActivate, onLoginSuccess, onActivationSuccess }) => {
  const { isAuthenticated, isActivated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToRegister={onNavigateToRegister}
        onNavigateToActivate={onNavigateToActivate}
        onLoginSuccess={onLoginSuccess}
      />
    );
  }

  // If authenticated but not activated, show activation page
  if (!isActivated) {
    return (
      <ActivationPage
        onNavigateToLogin={onNavigateToLogin}
        onActivationSuccess={onActivationSuccess}
      />
    );
  }

  // If authenticated and activated, show the protected content
  return children;
};

export default ProtectedRoute;
