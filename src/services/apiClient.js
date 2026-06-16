import axios from 'axios';
import API_BASE_URL from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds request timeout limit
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject JWT Bearer tokens automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('digipay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Unified error format mapping
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected network error occurred';
    if (error.response) {
      // Server-side returned non-2xx status code
      message = error.response.data?.detail || message;
    } else if (error.request) {
      // Request sent but server is unreachable
      message = 'Failed to connect to the backend server. Please verify database/server is online.';
    }
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
