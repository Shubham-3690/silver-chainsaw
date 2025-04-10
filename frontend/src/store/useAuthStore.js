import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Use the same origin for socket.io in both development and production
const BASE_URL = window.location.origin;

// Enhanced token management
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('Token found in localStorage');
      return token;
    }
  }
  return null;
};

// Set token in localStorage and axios headers
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set in localStorage and Authorization header');
  } else {
    localStorage.removeItem('auth_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('Token removed from localStorage and Authorization header');
  }
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
      // Get token and set in headers if available
      const token = getStoredToken();
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      console.log('Checking authentication status...');
      const res = await axiosInstance.get("/auth/check");
      console.log('Auth check successful');

      // Make sure token is set in state
      set({
        authUser: res.data,
        token: token
      });

      get().connectSocket();
    } catch (error) {
      console.error("Error in checkAuth:", error);
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message || error.message);

      // Clear token on auth check failure
      setAuthToken(null);

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
      console.log('Attempting signup...');
      const res = await axiosInstance.post("/auth/signup", data);

      // Store token in localStorage and state
      if (res.data.token) {
        setAuthToken(res.data.token);
        console.log('Signup successful with token');
      } else {
        console.warn('Signup response missing token!');
      }

      set({
        authUser: res.data,
        token: res.data.token
      });

      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log('Attempting login...');
      const res = await axiosInstance.post("/auth/login", data);

      // Store token in localStorage and state
      if (res.data.token) {
        setAuthToken(res.data.token);
        console.log('Login successful with token');
      } else {
        console.warn('Login response missing token!');
      }

      set({
        authUser: res.data,
        token: res.data.token
      });

      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.error('Login error:', error);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to log in');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      console.log('Attempting logout...');
      await axiosInstance.post("/auth/logout");

      // Clear token from localStorage and state
      setAuthToken(null);

      set({
        authUser: null,
        token: null
      });

      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.error('Logout error:', error);
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to log out');

      // Still clear token on error
      setAuthToken(null);
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
