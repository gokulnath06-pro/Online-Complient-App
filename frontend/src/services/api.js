import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for token expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAgents: () => api.get('/auth/agents'),
  getAllUsers: (params) => api.get('/auth/users', { params }),
  updateUserRole: (id, data) => api.put(`/auth/users/${id}`, data),
};

// Complaint APIs
export const complaintsAPI = {
  create: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMy: (params) => api.get('/complaints/my', { params }),
  getAssigned: (params) => api.get('/complaints/assigned', { params }),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  trackPublic: (ticketId) => api.get(`/complaints/track/${ticketId}`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  assignAgent: (id, data) => api.put(`/complaints/${id}/assign`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
};

// Message / Chat APIs
export const messagesAPI = {
  getMessages: (complaintId) => api.get(`/messages/${complaintId}`),
  sendMessage: (complaintId, formData) => {
    if (formData instanceof FormData) {
      return api.post(`/messages/${complaintId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post(`/messages/${complaintId}`, { message: formData });
  },
};

// Feedback APIs
export const feedbackAPI = {
  submit: (complaintId, data) => api.post(`/feedback/${complaintId}`, data),
  getByComplaintId: (complaintId) => api.get(`/feedback/complaint/${complaintId}`),
  getAll: (params) => api.get('/feedback', { params }),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;
