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
 * Development-only fallbacks are guarded by `import.meta.env.DEV` so the
 * strings are dropped from production bundles by the minifier.
 */

/** Hosts that are only valid in development. */
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

const DEV_FALLBACK_API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8080' : '';
const DEV_FALLBACK_CHATBOT_API_URL = import.meta.env.DEV ? 'http://127.0.0.1:8000/chat' : '';

interface UrlOptions {
  isProduction: boolean;
}

function parseAbsoluteUrl(raw: string, variableName: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `[env] "${variableName}" must be an absolute URL including the scheme, ` +
        `e.g. https://api.example.com — received "${raw}".`,
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`[env] "${variableName}" must use http:// or https:// — received "${raw}".`);
  }

  if (parsed.username || parsed.password) {
    throw new Error(`[env] "${variableName}" must not contain credentials.`);
  }

  if (parsed.search || parsed.hash) {
    throw new Error(`[env] "${variableName}" must not contain a query string or hash.`);
  }

  return parsed;
}

function rejectLocalHostInProduction(
  parsed: URL,
  raw: string,
  variableName: string,
  isProduction: boolean,
): void {
  if (isProduction && LOCAL_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    throw new Error(
      `[env] "${variableName}" must not point to a local host in a production ` +
        `build — received "${raw}".`,
    );
  }
}

/**
 * Validates and normalises the backend base URL.
 *
 * Kept separate from the module constant so it can be unit-tested without
 * touching `import.meta.env`.
 *
 * @throws {Error} when the value is missing in production, is not an absolute
 *   http(s) URL, contains credentials/query/hash, or points at localhost in
 *   production.
 */
export function normalizeApiBaseUrl(
  rawValue: string | undefined,
  { isProduction }: UrlOptions,
): string {
  const raw = rawValue?.trim();

  if (!raw) {
    if (isProduction) {
      throw new Error(
        '[env] Missing required environment variable "VITE_API_BASE_URL". ' +
          'Production builds must point at the deployed backend, e.g. ' +
          'VITE_API_BASE_URL=https://api.example.com',
      );
    }

    return DEV_FALLBACK_API_BASE_URL;
  }

  const parsed = parseAbsoluteUrl(raw, 'VITE_API_BASE_URL');
  rejectLocalHostInProduction(parsed, raw, 'VITE_API_BASE_URL', isProduction);

  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

/**
 * Validates and normalises the optional chatbot service URL.
 *
 * The chatbot is a separate service, so a production build without
 * `VITE_CHATBOT_API_URL` returns an empty string instead of breaking the app:
 * the widget degrades gracefully. An invalid value still throws.
 */
export function normalizeChatbotUrl(
  rawValue: string | undefined,
  { isProduction }: UrlOptions,
): string {
  const raw = rawValue?.trim();

  if (!raw) return isProduction ? '' : DEV_FALLBACK_CHATBOT_API_URL;

  const parsed = parseAbsoluteUrl(raw, 'VITE_CHATBOT_API_URL');
  rejectLocalHostInProduction(parsed, raw, 'VITE_CHATBOT_API_URL', isProduction);

  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

/** True for production bundles (`vite build`), false for `vite dev` / `vite serve`. */
export const IS_PRODUCTION = import.meta.env.PROD;

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
