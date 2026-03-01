import axios from 'axios';
import { getAuthToken } from '../store/authStore';

// const API_BASE_URL = 'https://arline-unbalked-hiram.ngrok-free.dev/'; //omar
const API_BASE_URL = 'https://blake-glottologic-carlee.ngrok-free.dev/'; //hazem


const api = axios.create({
  baseURL:API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// مسارات لا تحتاج توكن (تسجيل، لوجين، نسيت كلمة المرور)
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

// Add authorization token only for requests that need it (not register/login/forget-password)
api.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    console.log('📤 Public request (no token needed):', config.url);
    return config;
  }
  
  const token = getAuthToken();
  console.log('🔐 Checking token for:', config.url);
  console.log('   Token exists?', token ? 'YES ✅' : 'NO ❌');
  if (token) {
    console.log('   Token length:', token.length);
    console.log('   Token starts with:', token.substring(0, 30) + '...');
    console.log('   Token ends with:', '...' + token.substring(token.length - 30));
  }
  
  if (token) {
    config.headers.Authorization = token;
    console.log('   ✅ Authorization header set to: ' + token.substring(0, 20) + '...');
  } else {
    console.warn('   ⚠️ NO TOKEN FOUND - Request will fail with 401');
  }
  return config;
});

// Add response interceptor to log errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.error(`❌ API Error ${status} on ${url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
