import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create Auth Context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      console.log('AUTH: Login success, user data:', action.payload.user); // Debug log
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      console.log('AUTH: Update user, new data:', action.payload); // Debug log
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  error: null,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Add token to axios requests
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data,
        });
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  // Register function
  const register = async (name, email, password, phone = '', company = '', role = 'user') => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const userData = {
        name,
        email,
        password,
        phone,
        company,
        role
      };
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data.data,
        });
        
        toast.success('Registration successful! Please verify your email.');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  // Verify email function
  const verifyEmail = async (otp) => {
    try {
      const response = await api.post('/auth/verify-email', { otp });
      
      if (response.data.success) {
        // Update the user state with the verified user data
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user,
        });
        
        toast.success('Email verified successfully!');
        return { success: true, user: response.data.data.user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Resend OTP function
  const resendOTP = async () => {
    try {
      const response = await api.post('/auth/resend-otp');
      
      if (response.data.success) {
        toast.success('OTP sent successfully!');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  // Get current user function
  const getCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        console.log('Current user data:', response.data.data.user); // Debug log
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.data.user,
            token: state.token,
          },
        });
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // Token is invalid, logout
      logout();
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user,
        });
        
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.info('Logged out successfully');
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    verifyEmail,
    resendOTP,
    getCurrentUser,
    updateProfile,
    changePassword,
    logout,
    clearError,
    api, // Export api instance for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
