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
  exchangePublicToken: (publicToken) => api.post('/integration/exchange', { public_token: publicToken }),
  getAccounts: () => api.get('/integration/accounts'),
  getIntegrationStatus: () => api.get('/integration/status'),
  getTransactions: (institutionId, startDate, endDate) => 
    api.post('/integration/transactions', { 
      institutionId, startDate, endDate 
    }),
};

export const transactionAPI = {
  getCachedTransactions: (params = {}) => 
    api.get('/transactions', { params }),
  getTransactionSummary: (params = {}) => 
    api.get('/transactions/summary', { params }),
  triggerManualSync: () => 
    api.post('/transactions/sync'),
};

export const insightsAPI = {
  getLatestInsight: () => api.get('/insights/latest'),
  getDashboardOverview: () => api.get('/insights/dashboard'),
};

export const aiAdvisorAPI = {
  askQuestion: (question) => api.post('/v1/ai-advisor/query', { question }),
  getChatHistory: () => api.get('/v1/ai-advisor/history'),
};

export default api;
