import axios from "axios";
import toast from "react-hot-toast";

// Define backend URL based on environment
const BACKEND_URL = "/api"; // Use relative URL for both development and production

// Create axios instance with maximum compatibility for cross-domain requests
export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  // Increase timeout for slower connections
  timeout: 15000
});

// ALWAYS set auth token from localStorage if available
const token = localStorage.getItem('auth_token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Axios initialized with token from localStorage:', token.substring(0, 15) + '...');
} else {
  console.log('Axios initialized without token - authentication will likely fail');
}

// Enhanced request interceptor with aggressive token handling
axiosInstance.interceptors.request.use(
  (config) => {
    // ALWAYS check for token on each request and force it into headers
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Force the Authorization header on EVERY request
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${Date.now()}`;

    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('Request headers:', JSON.stringify(config.headers));
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response handling with aggressive token capture
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);

    // Check for token in response data
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('Token found in response data');
      localStorage.setItem('auth_token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Also check for Authorization header in response
    const authHeader = response.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Token received in response header');
      localStorage.setItem('auth_token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Log all response headers for debugging
    console.log('Response headers:', response.headers);

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
      // Don't clear token on first 401 - it might be a temporary issue
      // Only clear if explicitly logging out or after multiple failures
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);
