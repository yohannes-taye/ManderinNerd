import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './ActivationPage.css';

const ActivationPage = ({ onNavigateToLogin, onActivationSuccess }) => {
  const { activate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await activate(data.email, data.activationCode);
      
      if (result.success) {
        toast.success(result.message);
        if (onActivationSuccess) {
          onActivationSuccess();
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
    <div className="activation-page">
      <div className="activation-container">
        <div className="activation-header">
          <h1>Activate Account</h1>
          <p>Enter your email and activation code to activate your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="activation-form">
          <div className="form-group">
            <label htmlFor="activate-email">Email Address</label>
            <input
              type="email"
              id="activate-email"
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
            <label htmlFor="activate-activationCode">Activation Code</label>
            <input
              type="text"
              id="activate-activationCode"
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
              Use the same activation code you used during registration
            </div>
          </div>

          <button 
            type="submit" 
            className="activation-button"
            disabled={isLoading}
          >
            {isLoading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>

        <div className="activation-footer">
          <p>
            Already activated?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onNavigateToLogin}
            >
              Sign in
            </button>
          </p>
          <div className="info-box">
            <h4>Need help?</h4>
            <p>If you don't have an activation code or are having trouble, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationPage;
