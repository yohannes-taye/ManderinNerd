import axios from 'axios';

// Configure axios base URL based on environment
const getBaseURL = () => {
  // In production, use the production API URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'http://68.183.250.107:5000';
  }
  // In development, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Set the base URL for all axios requests
axios.defaults.baseURL = getBaseURL();

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`Error from ${error.config?.url}:`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default axios;
