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

// Set token in localStorage and axios headers with extra validation
const setAuthToken = (token) => {
  if (token) {
    // Ensure token is a string and has reasonable length
    if (typeof token === 'string' && token.length > 20) {
      localStorage.setItem('auth_token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in localStorage and Authorization header:', token.substring(0, 15) + '...');
      return true;
    } else {
      console.error('Invalid token format:', token);
      return false;
    }
  } else {
    localStorage.removeItem('auth_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('Token removed from localStorage and Authorization header');
    return true;
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
      console.log('Attempting signup with data:', { email: data.email, fullName: data.fullName, passwordLength: data.password?.length });

      // Add timestamp to prevent caching
      const res = await axiosInstance.post(`/auth/signup?_t=${Date.now()}`, data);
      console.log('Signup response received:', { status: res.status, hasToken: !!res.data.token });

      // Store token in localStorage and state
      if (res.data.token) {
        const tokenSet = setAuthToken(res.data.token);
        if (tokenSet) {
          console.log('Signup successful with valid token');
        } else {
          console.error('Signup successful but token format invalid');
        }
      } else {
        // Check headers for token as fallback
        const authHeader = res.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const headerToken = authHeader.substring(7);
          setAuthToken(headerToken);
          console.log('Token found in response headers instead of body');
          // Update the token in the response data for state
          res.data.token = headerToken;
        } else {
          console.warn('Signup response missing token in both body and headers!');
        }
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
      console.log('Attempting login with credentials:', { email: data.email, passwordLength: data.password?.length });

      // Add timestamp to prevent caching
      const res = await axiosInstance.post(`/auth/login?_t=${Date.now()}`, data);
      console.log('Login response received:', { status: res.status, hasToken: !!res.data.token });

      // Store token in localStorage and state
      if (res.data.token) {
        const tokenSet = setAuthToken(res.data.token);
        if (tokenSet) {
          console.log('Login successful with valid token');
        } else {
          console.error('Login successful but token format invalid');
        }
      } else {
        // Check headers for token as fallback
        const authHeader = res.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const headerToken = authHeader.substring(7);
          setAuthToken(headerToken);
          console.log('Token found in response headers instead of body');
          // Update the token in the response data for state
          res.data.token = headerToken;
        } else {
          console.warn('Login response missing token in both body and headers!');
        }
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
