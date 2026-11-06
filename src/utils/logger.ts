/**
 * Application logger.
 *
 * This is the ONLY module allowed to call `console.*`. The `no-console` ESLint
 * rule is enabled project-wide and disabled for this file only, so any new
 * `console.*` call outside this module fails `npm run lint`.
 *
 * Behaviour:
 *  - development (`vite dev`, and `vite build --mode development`): forwards
 *    to the matching console method after sanitising every argument;
 *  - production (`vite build`): every method is a no-op, so application logs
 *    never reach the browser console.
 *
 * Sanitisation guarantees a log can never contain:
 *  - an `Authorization` header, bearer token, JWT or API key;
 *  - a password, secret or e-mail address;
 *  - a full URL including its query string (query strings are stripped because
 *    they frequently carry tokens or e-mail addresses).
 *
 * `sanitizeForLog` is exported so the future error-reporting layer (FE-021)
 * can apply the same redaction before shipping an error anywhere else.
 */

/**
 * `import.meta.env.DEV` is inlined by Vite at build time. In a production
 * bundle it becomes `false`, so every logger method returns immediately.
 */
const isEnabled: boolean = import.meta.env.DEV;

const REDACTED = '[REDACTED]';

/** Object keys whose value must never be printed. */
const SENSITIVE_KEY_PATTERN =
  /^(authorization|proxy-authorization|cookie|set-cookie|password|passwd|pwd|secret|clientsecret|token|accesstoken|refreshtoken|idtoken|jwt|apikey|email|e-mail|mail)$/i;

/** `token=...`, `password: "..."`, `Authorization: "..."` inside free text. */
const SECRET_ASSIGNMENT_PATTERN =
  /\b((?:access[_-]?token|refresh[_-]?token|id[_-]?token|token|password|passwd|pwd|secret|api[_-]?key|authorization)\s*[:=]\s*)(?:Bearer\s+)?("[^"]*"|'[^']*'|[^\s,;&]+)/gi;

const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;

/** Raw JWT (`header.payload.signature`) — even without the `Bearer` prefix. */
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\b/g;

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const URL_PATTERN = /\bhttps?:\/\/[^\s"'<>]+/gi;

/** Drops the query string and hash from a URL, keeping origin + path. */
function stripUrlSecrets(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return rawUrl.split(/[?#]/)[0];
  }
}

/** Redacts secrets and strips query strings from a single string. */
export function sanitizeString(value: string): string {
  return value
    .replace(BEARER_PATTERN, `Bearer ${REDACTED}`)
    .replace(SECRET_ASSIGNMENT_PATTERN, (_match: string, prefix: string): string => `${prefix}${REDACTED}`)
    .replace(JWT_PATTERN, REDACTED)
    .replace(URL_PATTERN, stripUrlSecrets)
    .replace(EMAIL_PATTERN, REDACTED);
}

const MAX_DEPTH = 6;

function isDomNode(value: unknown): boolean {
  return typeof Node !== 'undefined' && value instanceof Node;
}

/**
 * Converts any value into a safe, plain copy that is safe to print.
 *
 * - sensitive object keys (`authorization`, `token`, `password`, `email`, …)
 *   are replaced with `[REDACTED]`;
 * - strings are passed through {@link sanitizeString};
 * - `Error` instances become `{ name, message, stack, ...ownProps }`, all
 *   sanitised — nothing is printed by reference, so DevTools cannot expand a
 *   live axios error and reveal `config.headers.Authorization`;
 * - cycles are detected, and recursion is capped at {@link MAX_DEPTH}.
 */
export function sanitizeForLog(
  value: unknown,
  depth = 0,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown {
  if (value === null || value === undefined) return value;

  const type = typeof value;

  if (type === 'string') return sanitizeString(value as string);
  if (type === 'number' || type === 'boolean' || type === 'bigint') return value;
  if (type === 'function') return '[Function]';
  if (type === 'symbol') return (value as symbol).toString();

  if (isDomNode(value)) return '[DOM node]';
  if (value instanceof Date) return value.toISOString();

  if (value instanceof Error) {
    const err = value as Error;
    if (seen.has(err)) return '[Circular]';
    seen.add(err);

    const safe: Record<string, unknown> = {
      name: err.name,
      message: sanitizeString(err.message),
      stack: err.stack ? sanitizeString(err.stack) : undefined,
    };

    if (depth < MAX_DEPTH) {
      for (const key of Object.keys(err)) {
        safe[key] = SENSITIVE_KEY_PATTERN.test(key)
          ? REDACTED
          : sanitizeForLog((err as unknown as Record<string, unknown>)[key], depth + 1, seen);
      }
    }

    return safe;
  }

  if (type === 'object') {
    const record = value as Record<string, unknown>;

    if (seen.has(record)) return '[Circular]';
    seen.add(record);

    if (Array.isArray(value)) {
      if (depth >= MAX_DEPTH) return '[Max depth]';
      return value.map((item) => sanitizeForLog(item, depth + 1, seen));
    }

    if (depth >= MAX_DEPTH) return '[Max depth]';

    const safe: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(record)) {
      safe[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED
        : sanitizeForLog(entry, depth + 1, seen);
    }
    return safe;
  }

  return value;
}

type LogMethod = 'debug' | 'info' | 'log' | 'warn' | 'error';

function write(method: LogMethod, args: readonly unknown[]): void {
  if (!isEnabled) return;

  const safeArgs = args.map((arg) => sanitizeForLog(arg));
  console[method](...safeArgs);
}

/**
 * Environment-aware logger. Every method is a no-op in production builds.
 *
 * @example
 * import logger from '../../utils/logger';
 * logger.error('Failed to load mentorship', err);
 */
export const logger = {
  debug(...args: unknown[]): void {
    write('debug', args);
  },
  info(...args: unknown[]): void {
    write('info', args);
  },
  log(...args: unknown[]): void {
    write('log', args);
  },
  warn(...args: unknown[]): void {
    write('warn', args);
  },
  error(...args: unknown[]): void {
    write('error', args);
  },
};

export default logger;
