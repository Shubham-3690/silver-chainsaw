import axios from "axios";
import toast from "react-hot-toast";

// Define backend URL based on environment
const BACKEND_URL = "/api"; // Use relative URL for both development and production

// Create axios instance with credentials enabled
export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Enhanced error handling with detailed logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
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
      // You might want to redirect to login page or clear auth state here
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);
