import axios from "axios";

// Define backend URL based on environment
const BACKEND_URL = "/api"; // Use relative URL for both development and production

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
