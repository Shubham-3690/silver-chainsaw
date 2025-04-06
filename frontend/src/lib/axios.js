import axios from "axios";

// Define backend URL based on environment
const BACKEND_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001/api"
  : "https://nexus-chat-backend.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
