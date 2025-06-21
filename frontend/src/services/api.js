import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (otp) => api.post('/auth/verify-email', { otp }),
  resendOtp: () => api.post('/auth/resend-otp'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Blog API
export const blogAPI = {
  getPosts: (params) => api.get('/blog', { params }),
  getPost: (slug) => api.get(`/blog/${slug}`),
  createPost: (data) => api.post('/blog', data),
  updatePost: (id, data) => api.put(`/blog/${id}`, data),
  deletePost: (id) => api.delete(`/blog/${id}`),
  getCategories: () => api.get('/blog/categories'),
};

// Portfolio API
export const portfolioAPI = {
  getProjects: (params) => api.get('/portfolio', { params }),
  getProject: (id) => api.get(`/portfolio/${id}`),
  createProject: (data) => api.post('/portfolio', data),
  updateProject: (id, data) => api.put(`/portfolio/${id}`, data),
  deleteProject: (id) => api.delete(`/portfolio/${id}`),
};

// Quote API
export const quoteAPI = {
  submitQuote: (data) => api.post('/quotes', data),
  getQuotes: (params) => api.get('/quotes', { params }),
  getQuote: (id) => api.get(`/quotes/${id}`),
  updateQuote: (id, data) => api.put(`/quotes/${id}`, data),
  deleteQuote: (id) => api.delete(`/quotes/${id}`),
  getUserQuotes: () => api.get('/quotes/user'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Chat API
export const chatAPI = {
  getMessages: (params) => api.get('/chat/messages', { params }),
  sendMessage: (data) => api.post('/chat/messages', data),
  getConversations: () => api.get('/chat/conversations'),
  markAsRead: (conversationId) => api.put(`/chat/conversations/${conversationId}/read`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm-payment', data),
  getPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
  refundPayment: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getQuotes: (params) => api.get('/admin/quotes', { params }),
  updateQuote: (id, data) => api.put(`/admin/quotes/${id}`, data),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

export default api;
