import axios from 'axios';

const BASE_URL = 'https://ebtuzyirod.execute-api.sa-east-1.amazonaws.com/api';
const AUTH_URL = 'https://ebtuzyirod.execute-api.sa-east-1.amazonaws.com/api/auth';

// Create axios instances
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authClient = axios.create({
  baseURL: AUTH_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const requestInterceptor = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(requestInterceptor);
authClient.interceptors.request.use(requestInterceptor);

// Response interceptor to handle auth errors
const responseInterceptor = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response) => response,
  responseInterceptor
);

authClient.interceptors.response.use(
  (response) => response,
  responseInterceptor
);