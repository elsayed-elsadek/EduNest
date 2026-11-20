import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, handleSessionExpired } from '../store/authStore';
import { refreshAccessToken } from './authRefresh';
import { parseApiError, type NormalizedApiError } from './errors';
import { getTokenExpiration, isTokenValid } from '../utils/jwt';
import { API_BASE_URL } from '../config/env';
import logger from '../utils/logger';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 15000,
});

// Refresh shortly before expiry when a protected request is about to be sent.
// This is request-driven (not a background timer), so idle sessions are not
// kept alive without user activity.
const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000;

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
  // Logout-all is an authenticated operation, unlike login/logout/refresh.
  if (path === 'login-api/logout-all') return false;
  return PUBLIC_AUTH_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

// Add authorization token only for requests that need it
api.interceptors.request.use(async (config) => {
  if (isPublicAuthRequest(config.url)) {
    return config;
  }

  let token = getAuthToken();

  if (!token) {
    return config;
  }

  // Contract (Integration Handbook §3 / EB-30): cross-origin CORS sets
  // allowCredentials=false, so protected REST requests authenticate via
  // `Authorization: Bearer <jwt>` — a raw token is rejected.
  //
  const expiresAt = getTokenExpiration(token);

  // A malformed token cannot be refreshed safely. A well-formed expired token
  // can: use the stored refresh token before sending any protected request.
  if (!isTokenValid(token) && expiresAt === null) {
    handleSessionExpired();
    return Promise.reject(
      Object.assign(new Error('Session expired'), { code: 'SESSION_EXPIRED' })
    );
  }

  if (expiresAt !== null && expiresAt <= Date.now() + ACCESS_TOKEN_REFRESH_WINDOW_MS) {
    // FE-008: refresh just in time on user activity, before sending an expired
    // access token. refreshAccessToken is single-flight and cross-tab locked.
    token = await refreshAccessToken(token);
  }

  // Guard against a malformed/expired replacement from the refresh path.
  if (!isTokenValid(token)) {
    handleSessionExpired();
    return Promise.reject(
      Object.assign(new Error('Session expired'), { code: 'SESSION_EXPIRED' })
    );
  }

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Response interceptor — errors are surfaced by the calling UI code.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ignore canceled requests (normal cleanup when component unmounts) and the
    // local SESSION_EXPIRED rejection (its redirect is already running).
    if (error.code === 'ERR_CANCELED' || error.code === 'SESSION_EXPIRED') {
      return Promise.reject(error);
    }

    const status = error.response?.status ?? 'NO_RESPONSE';
    const url = error.config?.url ?? 'unknown';
    const code = error.code ?? 'UNKNOWN';
    // `logger` redacts headers/tokens and strips query strings in development,
    // and is a no-op in production.
    logger.error(`API Error ${status} (${code}) on ${url}:`, error.message);

    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const isProtected401 = status === 401 && !isPublicAuthRequest(original?.url);

    if (isProtected401 && original && !original._retry) {
      // FE-027: a 401 on a protected endpoint means the access token is no
      // longer accepted — attempt ONE silent refresh (single-flight, shared by
      // all concurrent 401s) and replay the original request with the rotated
      // token. When the refresh itself fails (401/429/ambiguous network drop)
      // refreshAccessToken() has already ended the session exactly once.
      original._retry = true;
      try {
        const failedAccessToken =
          typeof original.headers?.Authorization === 'string'
            ? original.headers.Authorization.replace(/^Bearer\s+/i, '')
            : undefined;
        const newToken = await refreshAccessToken(failedAccessToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        return Promise.reject(refreshError ?? error);
      }
    }

    if (isProtected401) {
      // FE-008: refresh was already attempted (or the request is a replay) —
      // clear the session exactly once (guarded) → /login?reason=expired.
      handleSessionExpired();
    }

    // EF-2: attach the unified, parsed error (envelope → legacy → generic) so
    // UI consumers can branch on `errorCode` and render the clean `message`.
    // Purely additive — the silent-refresh and logout logic above is untouched:
    // errorCode is classification only, never an additional logout trigger.
    const normalized: NormalizedApiError = parseApiError(error);
    (error as Error & { normalized?: NormalizedApiError }).normalized = normalized;

    return Promise.reject(error);
  }
);

export default api;
