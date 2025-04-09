import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Use the same origin for socket.io in both development and production
const BASE_URL = window.location.origin;

// Load token from localStorage if available
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: getStoredToken(),
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      // Set token from localStorage if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const res = await axiosInstance.get("/auth/check");
      console.log('Auth check successful');

      set({
        authUser: res.data,
        token: token
      });

      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      // Clear token on auth check failure
      localStorage.removeItem('auth_token');
      delete axiosInstance.defaults.headers.common['Authorization'];

      set({
        authUser: null,
        token: null
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      // Store token in localStorage and state
      if (res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
        // Set Authorization header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      set({
        authUser: res.data,
        token: res.data.token
      });

      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      // Store token in localStorage and state
      if (res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
        // Set Authorization header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }

      set({
        authUser: res.data,
        token: res.data.token
      });

      toast.success("Logged in successfully");
      console.log('Login successful, token:', res.data.token ? 'Present' : 'Missing');

      get().connectSocket();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Failed to log in');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      // Clear token from localStorage and state
      localStorage.removeItem('auth_token');
      delete axiosInstance.defaults.headers.common['Authorization'];

      set({
        authUser: null,
        token: null
      });

      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.response?.data?.message || 'Failed to log out');

      // Still clear token on error
      localStorage.removeItem('auth_token');
      set({ authUser: null, token: null });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      }
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.connect();

    set({ socket: socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
  },
}));
