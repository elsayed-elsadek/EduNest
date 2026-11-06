

const DEV_FALLBACK_API_BASE_URL = 'http://localhost:8080';

/** Hosts that are only valid in development. */
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

interface ApiBaseUrlOptions {
  isProduction: boolean;
}

/**
 * Validates and normalises a raw API base URL.
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
  { isProduction }: ApiBaseUrlOptions,
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

  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `[env] "VITE_API_BASE_URL" must be an absolute URL including the scheme, ` +
        `e.g. https://api.example.com — received "${raw}".`,
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `[env] "VITE_API_BASE_URL" must use http:// or https:// — received "${raw}".`,
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error('[env] "VITE_API_BASE_URL" must not contain credentials.');
  }

  if (parsed.search || parsed.hash) {
    throw new Error('[env] "VITE_API_BASE_URL" must not contain a query string or hash.');
  }

  if (isProduction && LOCAL_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    throw new Error(
      `[env] "VITE_API_BASE_URL" must not point to a local host in a production ` +
        `build — received "${raw}".`,
    );
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');

  return `${parsed.origin}${pathname}`;
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
 * Builds an absolute URL for a backend-hosted asset (image, upload, file).
 *
 * Absolute inputs are returned untouched. Relative inputs are resolved against
 * the API host — never the frontend origin — so assets stay on the configured
 * backend regardless of where the SPA is served from.
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

  // Already absolute — leave it untouched.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Resolve as root-relative so a base URL that contains a path
  // (e.g. .../api/v1) still yields the host's /uploads/... path.
  const rootRelative = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  try {
    return new URL(rootRelative, `${API_BASE_URL}/`).toString();
  } catch {
    return undefined;
  }
}
