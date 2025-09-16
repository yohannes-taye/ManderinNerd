import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ onNavigateToRegister, onNavigateToActivate, onLoginSuccess }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [showActivationCode, setShowActivationCode] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const generateActivationCode = async () => {
    try {
      const response = await axios.get('/auth/generate-code');
      setActivationCode(response.data.activationCode);
      setShowActivationCode(true);
      toast.success('Activation code generated!');
    } catch (error) {
      toast.error('Failed to generate activation code');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Login successful!');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onNavigateToRegister}
            >
              Sign up
            </button>
          </p>
          <p>
            Need to activate your account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onNavigateToActivate}
            >
              Activate
            </button>
          </p>
          
          <div className="activation-code-section">
            <button 
              type="button" 
              className="generate-code-button"
              onClick={generateActivationCode}
            >
              Get Activation Code
            </button>
            
            {showActivationCode && (
              <div className="activation-code-display">
                <p><strong>Your activation code:</strong></p>
                <div className="code-box">
                  {activationCode}
                </div>
                <p className="code-instruction">Use this code to register a new account</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
