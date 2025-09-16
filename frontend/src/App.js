import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ActivationPage from "./pages/ActivationPage";
import LessonPage from "./pages/LessonPage";
import CreateBlogPage from "./pages/CreateBlogPage";
import BlogManagementPage from "./pages/BlogManagementPage";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState("lesson");
  const [createdBlogs, setCreatedBlogs] = useState([]);
  const [authPage, setAuthPage] = useState(null);
  const { logout, isAuthenticated, isActivated, loading, user } = useAuth();

  const navigateToCreateBlog = () => {
    setCurrentPage("create");
  };

  const navigateToBlogManagement = () => {
    setCurrentPage("manage");
  };

  const navigateToAdmin = () => {
    setCurrentPage("admin");
  };

  const navigateToLesson = () => {
    setCurrentPage("lesson");
  };

  const navigateToLogin = () => {
    setAuthPage("login");
  };

  const navigateToRegister = () => {
    setAuthPage("register");
  };

  const navigateToActivate = () => {
    setAuthPage("activate");
  };

  const handleBlogCreated = (newBlog) => {
    setCreatedBlogs([...createdBlogs, newBlog]);
    console.log("New blog created:", newBlog);
  };

  const handleLoginSuccess = () => {
    setAuthPage(null); // Clear auth page to show protected content
    setCurrentPage("lesson");
  };

  const handleRegisterSuccess = (email) => {
    // After successful registration, show activation page
    setAuthPage("activate");
  };

  const handleActivationSuccess = () => {
    setAuthPage(null); // Clear auth page to show protected content
    setCurrentPage("lesson");
  };

  const handleLogout = () => {
    logout();
    setAuthPage("login");
    setCurrentPage("lesson");
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
      
      {authPage === "login" && (
        <LoginPage 
          onNavigateToRegister={navigateToRegister}
          onNavigateToActivate={navigateToActivate}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {authPage === "register" && (
        <RegisterPage 
          onNavigateToLogin={navigateToLogin}
          onNavigateToActivate={navigateToActivate}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      
      {authPage === "activate" && (
        <ActivationPage 
          onNavigateToLogin={navigateToLogin}
          onActivationSuccess={handleActivationSuccess}
        />
      )}

      {!authPage && (
        <ProtectedRoute
          onNavigateToLogin={navigateToLogin}
          onNavigateToRegister={navigateToRegister}
          onNavigateToActivate={navigateToActivate}
          onLoginSuccess={handleLoginSuccess}
          onActivationSuccess={handleActivationSuccess}
        >
          <div className="app-content">
            <header className="app-header">
              <h1>Mandarin Nerd</h1>
              <div className="header-actions">
                {user?.is_admin && (
                  <button onClick={navigateToAdmin} className="admin-button">
                    Admin Dashboard
                  </button>
                )}
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </header>
            
            {currentPage === "lesson" && (
              <LessonPage 
                onNavigateToCreate={navigateToCreateBlog}
                onNavigateToManage={navigateToBlogManagement}
              />
            )}
            {currentPage === "create" && (
              <CreateBlogPage 
                onNavigateBack={navigateToLesson}
                onBlogCreated={handleBlogCreated}
              />
            )}
            {currentPage === "manage" && (
              <BlogManagementPage 
                onNavigateBack={navigateToLesson}
              />
            )}
            {currentPage === "admin" && (
              <AdminDashboard 
                onNavigateBack={navigateToLesson}
              />
            )}
          </div>
        </ProtectedRoute>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;