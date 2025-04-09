import axios from "axios";
import toast from "react-hot-toast";

// Define backend URL based on environment
const BACKEND_URL = "/api"; // Use relative URL for both development and production

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true
});

// Simple error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);
