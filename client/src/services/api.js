import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  googleAuth: () => window.open(`${API_BASE_URL}/auth/google`, '_self'),
  microsoftAuth: () => window.open(`${API_BASE_URL}/auth/microsoft`, '_self'),
};

export const plaidAPI = {
  createLinkToken: () => api.post('/plaid/link'),
  exchangePublicToken: (publicToken) => api.post('/plaid/exchange', { public_token: publicToken }),
  getAccounts: () => api.get('/plaid/accounts'),
  getIntegrationStatus: () => api.get('/plaid/status'),
};

export default api;
