import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ActivationPage from "./pages/ActivationPage";
import LessonPage from "./pages/LessonPage";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function AppContent() {
  const { logout, isAuthenticated, isActivated, loading, user } = useAuth();

  const handleLoginSuccess = () => {
    // Login success is handled by the auth context
  };

  const handleRegisterSuccess = (email) => {
    // Registration success is handled by the auth context
  };

  const handleActivationSuccess = () => {
    // Activation success is handled by the auth context
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <LoginPage 
            onNavigateToRegister={() => window.location.href = '/register'}
            onNavigateToActivate={() => window.location.href = '/activate'}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
        
        <Route path="/register" element={
          <RegisterPage 
            onNavigateToLogin={() => window.location.href = '/login'}
            onNavigateToActivate={() => window.location.href = '/activate'}
            onRegisterSuccess={handleRegisterSuccess}
          />
        } />
        
        <Route path="/activate" element={
          <ActivationPage 
            onNavigateToLogin={() => window.location.href = '/login'}
            onActivationSuccess={handleActivationSuccess}
          />
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute
            onNavigateToLogin={() => window.location.href = '/login'}
            onNavigateToRegister={() => window.location.href = '/register'}
            onNavigateToActivate={() => window.location.href = '/activate'}
            onLoginSuccess={handleLoginSuccess}
            onActivationSuccess={handleActivationSuccess}
          >
            <LessonPageWrapper onLogout={handleLogout} />
          </ProtectedRoute>
        } />



        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboardWrapper onLogout={handleLogout} />
          </AdminRoute>
        } />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Wrapper components to handle navigation and logout
function LessonPageWrapper({ onLogout }) {
  return (
    <div className="app-content">
      <AppHeader onLogout={onLogout} />
      <LessonPage />
    </div>
  );
}



function AdminDashboardWrapper({ onLogout }) {
  const navigateToLesson = () => {
    window.location.href = '/';
  };

  return (
    <div className="app-content">
      <AppHeader onLogout={onLogout} />
      <AdminDashboard 
        onNavigateBack={navigateToLesson}
      />
    </div>
  );
}

function AppHeader({ onLogout }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <h1>Mandarin Nerd</h1>
      <div className="header-actions">
        {user?.is_admin && (
          <button 
            onClick={() => window.location.href = '/admin'} 
            className="admin-button"
          >
            Admin Dashboard
          </button>
        )}
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;