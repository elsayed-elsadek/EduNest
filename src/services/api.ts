import axios from 'axios';
import { getAuthToken } from '../store/authStore';

const API_BASE_URL = 'http://localhost:8080/'; 

// Production mode check - only log in development
const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  // Add timeout to prevent hanging requests
  timeout: 15000,
});

// Public auth paths that don't require token
const PUBLIC_AUTH_PATHS = [
  'api/v1/register/mentor',
  'api/v1/register/student',
  'api/v1/register/send-otp',
  'api/v1/contact/save-message',
  'api/v1/register/verify-user',
  'login-api',
  'forget-password',
];

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.replace(API_BASE_URL, '').split('?')[0].replace(/^\//, '');
  return PUBLIC_AUTH_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

// Add authorization token only for requests that need it
api.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    if (isDev) {
      console.log('📤 Public request (no token needed):', config.url);
    }
    return config;
  }
  
  const token = getAuthToken();
  
  if (token) {
    config.headers.Authorization = token;
  }
  
  return config;
});

// Response interceptor - minimal logging for production
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Minimal error logging - only in development
    if (isDev) {
      const status = error.response?.status;
      const url = error.config?.url;
      console.error(`❌ API Error ${status} on ${url}`);
    }
    return Promise.reject(error);
  }
);

export default api;

