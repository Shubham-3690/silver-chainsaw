import axios from "axios";
import toast from "react-hot-toast";

// Define backend URL based on environment
const BACKEND_URL = "/api"; // Use relative URL for both development and production

// Create axios instance with enhanced configuration for cross-domain requests
export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Increase timeout for slower connections
  timeout: 10000
});

// Set auth token from localStorage if available
const token = localStorage.getItem('auth_token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Axios initialized with token from localStorage');
} else {
  console.log('Axios initialized without token');
}

// Enhanced request interceptor for debugging and token handling
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for token on each request
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('Request headers:', JSON.stringify(config.headers));
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced error handling with detailed logging and token management
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);

    // Check for Authorization header in response
    const authHeader = response.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Token received in response header');
      localStorage.setItem('auth_token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401) {
      toast.error('Authentication failed. Please try logging in again.');
      // Clear token on auth failure
      localStorage.removeItem('auth_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);
