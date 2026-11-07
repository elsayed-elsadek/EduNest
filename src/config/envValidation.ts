const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);
const DEV_FALLBACK_API_BASE_URL = 'http://localhost:8080';
const DEV_FALLBACK_CHATBOT_API_URL = 'http://127.0.0.1:8000/chat';

export interface UrlOptions {
  isProduction: boolean;
}

function parseAbsoluteUrl(raw: string, variableName: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `[env] "${variableName}" must be a valid absolute URL including the scheme, ` +
        'e.g. https://api.example.com.',
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`[env] "${variableName}" must use the http:// or https:// protocol.`);
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
  variableName: string,
  isProduction: boolean,
): void {
  if (isProduction && LOCAL_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    throw new Error(`[env] "${variableName}" must not point to a local host in a production build.`);
  }
}

function normalizeUrl(parsed: URL): string {
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

export function normalizeApiBaseUrl(
  rawValue: string | undefined,
  { isProduction }: UrlOptions,
): string {
  const raw = rawValue?.trim();

  if (!raw) {
    if (isProduction) {
      throw new Error(
        '[env] Missing required environment variable "VITE_API_BASE_URL". ' +
          'Set it to the absolute URL of the deployed backend.',
      );
    }

    return DEV_FALLBACK_API_BASE_URL;
  }

  const parsed = parseAbsoluteUrl(raw, 'VITE_API_BASE_URL');
  rejectLocalHostInProduction(parsed, 'VITE_API_BASE_URL', isProduction);

  return normalizeUrl(parsed);
}

export function normalizeChatbotUrl(
  rawValue: string | undefined,
  { isProduction }: UrlOptions,
): string {
  const raw = rawValue?.trim();
  if (!raw) return isProduction ? '' : DEV_FALLBACK_CHATBOT_API_URL;

  const parsed = parseAbsoluteUrl(raw, 'VITE_CHATBOT_API_URL');
  rejectLocalHostInProduction(parsed, 'VITE_CHATBOT_API_URL', isProduction);

  return normalizeUrl(parsed);
}
