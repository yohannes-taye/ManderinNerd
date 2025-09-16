import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './RegisterPage.css';

const RegisterPage = ({ onNavigateToLogin, onNavigateToActivate, onRegisterSuccess }) => {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data.email, data.password, data.activationCode);
      
      if (result.success) {
        toast.success(result.message);
        if (onRegisterSuccess) {
          onRegisterSuccess(data.email);
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
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Sign up with your activation code</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              type="email"
              id="register-email"
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
            <label htmlFor="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password"
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="register-confirmPassword"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="register-activationCode">Activation Code</label>
            <input
              type="text"
              id="register-activationCode"
              {...register('activationCode', {
                required: 'Activation code is required',
                minLength: {
                  value: 8,
                  message: 'Activation code must be at least 8 characters'
                }
              })}
              className={errors.activationCode ? 'error' : ''}
              placeholder="Enter your activation code"
            />
            {errors.activationCode && (
              <span className="error-message">{errors.activationCode.message}</span>
            )}
            <div className="help-text">
              You need a valid activation code to create an account
            </div>
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onNavigateToLogin}
            >
              Sign in
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
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
