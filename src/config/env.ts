/**
 * Central environment configuration — the single source of truth for every
 * backend URL used by the app.
 *
 * Application code must import `API_BASE_URL` / `CHATBOT_API_URL` /
 * `getAssetUrl` from here instead of reading `import.meta.env` directly or
 * hard-coding a host. Vite inlines `VITE_*` values at build time, so this
 * module is evaluated once per bundle.
 *
 * Rules enforced below:
 *  - production builds must define `VITE_API_BASE_URL`;
 *  - URLs must be absolute http(s) URLs;
 *  - credentials, query strings and hashes are rejected;
 *  - trailing slashes are normalised away;
 *  - localhost / 127.0.0.1 are refused in production builds.
 *
 * The pure URL validation functions are also used by vite.config.ts so
 * production builds fail before bundling begins.
 */

import { normalizeApiBaseUrl, normalizeChatbotUrl } from './envValidation';
export { normalizeApiBaseUrl, normalizeChatbotUrl } from './envValidation';

/** True for production bundles (`vite build`), false for `vite dev` / `vite serve`. */
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Absolute backend origin without a trailing slash, e.g.
 * `https://api.example.com` or `https://api.example.com/api/v1`.
 */
export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL, {
  isProduction: IS_PRODUCTION,
});

/**
 * Absolute chatbot service URL, or an empty string when the integration is
 * not configured in a production build.
 */
export const CHATBOT_API_URL = normalizeChatbotUrl(import.meta.env.VITE_CHATBOT_API_URL, {
  isProduction: IS_PRODUCTION,
});

export const appConfig = Object.freeze({
  apiBaseUrl: API_BASE_URL,
  chatbotApiUrl: CHATBOT_API_URL,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
});

/**
 * Builds an absolute URL for a backend-hosted asset (image, upload, file).
 *
 * Absolute inputs (http/https, data: and blob: URIs) are returned untouched.
 * Relative inputs are resolved against the API host — never the frontend
 * origin — so assets stay on the configured backend regardless of where the
 * SPA is served from.
 *
 * @example
 * // with VITE_API_BASE_URL=https://api.example.com
 * getAssetUrl('/uploads/x.png')  // → 'https://api.example.com/uploads/x.png'
 * getAssetUrl('uploads/x.png')   // → 'https://api.example.com/uploads/x.png'
 */
export function getAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;

  const trimmed = path.trim();
  if (!trimmed) return undefined;

  // Already absolute or an inline/object URL — leave it untouched.
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;

  // Resolve as root-relative so a base URL that contains a path
  // (e.g. .../api/v1) still yields the host's /uploads/... path.
  const rootRelative = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  try {
    return new URL(rootRelative, `${API_BASE_URL}/`).toString();
  } catch {
    return undefined;
  }
}
