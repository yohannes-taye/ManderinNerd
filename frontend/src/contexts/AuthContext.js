import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = Cookies.get('authToken');
        console.log('Checking auth status, token exists:', !!token);
        
        if (!token) {
          console.log('No token found, user not authenticated');
          setLoading(false);
          return;
        }

        console.log('Verifying token with backend...');
        const response = await axios.get('/auth/verify');
        console.log('Token verification response:', response.data);
        
        if (response.data.valid) {
          console.log('Token is valid, setting user as authenticated');
          setUser(response.data.user);
          setIsAuthenticated(true);
          setIsActivated(response.data.user.is_activated);
        } else {
          console.log('Token is invalid, clearing auth data');
          // Invalid token, clear it
          Cookies.remove('authToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Clear invalid token
        Cookies.remove('authToken');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token in cookie
      Cookies.set('authToken', token, { expires: 1 }); // 1 day
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      setIsActivated(user.is_activated);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password, activationCode) => {
    try {
      const response = await axios.post('/auth/register', { 
        email, 
        password, 
        activationCode 
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const activate = async (email, activationCode) => {
    try {
      const response = await axios.post('/auth/activate', { 
        email, 
        activationCode 
      });
      
      // If user is logged in, update their activation status
      if (isAuthenticated && user?.email === email) {
        setIsActivated(true);
        setUser(prev => ({ ...prev, is_activated: true }));
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Activation failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Activation failed' 
      };
    }
  };

  const logout = () => {
    // Clear token and user data
    Cookies.remove('authToken');
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
    setIsActivated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isActivated,
    loading,
    login,
    register,
    activate,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
