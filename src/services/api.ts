import axios from 'axios';
import { getAuthToken } from '../store/authStore';
import { API_BASE_URL } from '../config/env';
import logger from '../utils/logger';

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
  'api/v1/register/restore',
  'api/v1/register/confirm-restore',
];

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.replace(API_BASE_URL, '').split('?')[0].replace(/^\//, '');
  return PUBLIC_AUTH_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

// Add authorization token only for requests that need it
api.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    return config;
  }

  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

// Response interceptor — errors are surfaced by the calling UI code.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignore canceled requests (normal cleanup when component unmounts)
    if (error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? 'NO_RESPONSE';
    const url = error.config?.url ?? 'unknown';
    const code = error.code ?? 'UNKNOWN';
    // `logger` redacts headers/tokens and strips query strings in development,
    // and is a no-op in production.
    logger.error(`API Error ${status} (${code}) on ${url}:`, error.message);
    return Promise.reject(error);
  }
);

export default api;
