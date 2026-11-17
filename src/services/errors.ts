/**
 * EF-2 — Unified API error contract (backend EB-12).
 *
 * Every backend error response — any status, any layer — is one envelope:
 *
 *   {
 *     "timestamp": "2026-10-29T19:30:00",
 *     "status": 403,
 *     "error": "Forbidden",
 *     "errorCode": "ERR_FORBIDDEN",
 *     "message": "You do not have permission to access this resource.",
 *     "path": "/api/v1/contact/all-messages",
 *     "refId": "a1b2c3d4"        // ONLY on 500 — correlates with backend logs
 *   }
 *
 * `parseApiError` normalizes ANY error (envelope, legacy shape, network drop,
 * garbage body) into one `NormalizedApiError` so callers can branch on
 * `errorCode` and render `message` directly — the backend guarantees it is
 * clean, user-friendly and free of technical internals. Locally-generated
 * fallbacks follow the same hygiene: axios technical messages are never
 * surfaced.
 *
 * This module is PURE: no imports from authStore (authentication decisions
 * live exclusively in api.ts) and no toast/UI imports (presentation lives in
 * utils/showApiError.ts).
 */

/** Error codes documented in the EB-12 contract (mds/api/error-responses.md). */
export const KNOWN_ERROR_CODES = [
  'ERR_UNAUTHENTICATED',
  'ERR_INVALID_TOKEN',
  'ERR_FORBIDDEN',
  'ERR_VALIDATION',
  'ERR_MALFORMED_BODY',
  'ERR_UNKNOWN_FIELD',
  'ERR_BUSINESS_RULE',
  'ERR_RESOURCE_NOT_FOUND',
  'ERR_USER_NOT_FOUND',
  'ERR_EMAIL_IN_USE',
  'ERR_INVALID_OTP',
  'ERR_OTP_EXPIRED',
  'ERR_ALREADY_VERIFIED',
  'ERR_CONSTRAINT_VIOLATION',
  'ERR_INTERNAL_SYSTEM',
  // Locally-generated codes (never from the backend envelope)
  'ERR_NETWORK',
  'ERR_UNKNOWN',
  'ERR_INVALID_CREDENTIALS',
] as const;

/**
 * One normalized error for every failure path. `errorCode` is the stable,
 * machine-readable key for programmatic branching; unknown backend codes pass
 * through UNCHANGED (with `known: false`) so new server codes never break the
 * client.
 */
export interface NormalizedApiError {
  errorCode: string;
  /** False when the backend sent a code outside the documented catalog. */
  known: boolean;
  /** Clean, user-facing message — safe to render directly. */
  message: string;
  /** HTTP status, or 0 when no response arrived (network drop / timeout). */
  status: number;
  /** Field-level validation errors (400 ERR_VALIDATION); empty otherwise. */
  fields: Record<string, string>;
  /** Correlation id — present only on 500 responses. */
  refId?: string;
}

/** Canonical field-aware validation error (previously duplicated in two services). */
export class ApiValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/** Generic display text per status — used only when the backend sent no message. */
function genericMessageFor(status: number): string {
  if (status === 400) return 'Invalid request.';
  if (status === 401) return 'Please log in to continue.';
  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 404) return 'The requested resource was not found.';
  if (status === 409) return 'This conflicts with existing data.';
  if (status === 429) return 'Too many requests. Please slow down and try again.';
  if (status >= 500) return 'Something went wrong on our side. Please try again.';
  return 'Something went wrong. Please try again.';
}

/** Axios error shape, typed defensively — the parser must never assume. */
interface AxiosLikeError {
  response?: { status?: number; data?: unknown };
  code?: string;
  message?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * True when the thrown value itself looks like a response body — several
 * services reject with `err.response?.data ?? err.message`, so a plain object
 * carrying error fields arrives UNWRAPPED. `Error` instances are excluded:
 * axios errors own a `message` property and must always parse via `response`.
 */
function looksLikePayload(value: unknown): boolean {
  if (!isRecord(value) || value instanceof Error) return false;
  return (
    typeof value.errorCode === 'string' ||
    isRecord(value.errorMessages) ||
    isRecord(value.apiResponse) ||
    typeof value.message === 'string' ||
    typeof value.error === 'string'
  );
}

/** Keeps the fields map strictly Record<string, string> whatever arrived. */
function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const key of Object.keys(value)) {
    const entry = value[key];
    if (typeof entry === 'string') out[key] = entry;
    else if (entry !== undefined && entry !== null) out[key] = JSON.stringify(entry);
  }
  return out;
}

/** Legacy dialect #1: `{ errorMessages: { field: "msg" } }` validation bodies. */
function legacyFieldErrors(data: Record<string, unknown>): Record<string, string> {
  return isRecord(data.errorMessages) ? toStringRecord(data.errorMessages) : {};
}

/**
 * Normalizes any thrown error into the unified shape.
 *
 * Parsing priority:
 *   1. Unified envelope        — `errorCode` starting with `ERR_`
 *   2. Legacy fallbacks        — `errorMessages` map, `apiResponse.message`,
 *                                bare `message`, Spring's `{ error }`, raw string body
 *   3. Safe generic fallback   — network drop → ERR_NETWORK; anything else →
 *                                ERR_UNKNOWN with a status-appropriate message
 *
 * This function never throws.
 */
export function parseApiError(error: unknown): NormalizedApiError {
  try {
    // Services intentionally THROW display strings (e.g. handleRequest's
    // catch) — the string itself is the clean message.
    if (typeof error === 'string') {
      return { errorCode: 'ERR_UNKNOWN', known: false, message: error, status: 0, fields: {} };
    }

    const axiosError = (error ?? {}) as AxiosLikeError;
    let status = typeof axiosError.response?.status === 'number' ? axiosError.response.status : 0;
    let data: unknown = axiosError.response?.data;

    // Several services reject with the RAW body (`throw err.response?.data ??
    // err.message`) — when no axios wrapper survives, the thrown object may BE
    // the payload (unified envelope or a legacy shape). Parse it directly,
    // restoring the envelope's own `status` for the refId/generic rules.
    if (data === undefined && looksLikePayload(error)) {
      const payload = error as Record<string, unknown>;
      data = payload;
      if (typeof payload.status === 'number') status = payload.status;
    }

    // ── 1. Unified envelope (EB-12) ─────────────────────────────────────────
    if (isRecord(data) && typeof data.errorCode === 'string' && data.errorCode.startsWith('ERR_')) {
      const known = (KNOWN_ERROR_CODES as readonly string[]).includes(data.errorCode);
      const fields = toStringRecord(data.fields);
      const message =
        typeof data.message === 'string' && data.message.trim()
          ? data.message
          : genericMessageFor(status);
      // The contract sends refId ONLY on 500 — anything else is noise, and
      // showApiError additionally renders it for 5xx contexts only.
      const refId =
        status >= 500 && typeof data.refId === 'string' && data.refId ? data.refId : undefined;
      return { errorCode: data.errorCode, known, message, status, fields, refId };
    }

    // ── 2. Legacy shapes (pre-EB-12 dialects still seen in the wild) ────────
    if (isRecord(data)) {
      // `{ errorMessages: {...} }` — field-aware validation, old dialect
      const legacyFields = legacyFieldErrors(data);
      if (Object.keys(legacyFields).length > 0) {
        const first = Object.values(legacyFields)[0];
        return {
          errorCode: 'ERR_VALIDATION',
          known: true,
          message: first ?? genericMessageFor(status),
          status,
          fields: legacyFields,
        };
      }
      // `{ apiResponse: { message } }` — success-wrapper carrying an error note
      if (isRecord(data.apiResponse) && typeof data.apiResponse.message === 'string' && data.apiResponse.message) {
        return { errorCode: 'ERR_UNKNOWN', known: false, message: data.apiResponse.message, status, fields: {} };
      }
      // `{ message }` — bare message body
      if (typeof data.message === 'string' && data.message) {
        return { errorCode: 'ERR_UNKNOWN', known: false, message: data.message, status, fields: {} };
      }
      // Spring's default `{ timestamp, status, error, path }` — no errorCode
      if (typeof data.error === 'string' && data.error) {
        return { errorCode: 'ERR_UNKNOWN', known: false, message: data.error, status, fields: {} };
      }
    }
    // Raw string body (proxy/CDN pages, plain-text errors)
    if (typeof data === 'string' && data.trim()) {
      return { errorCode: 'ERR_UNKNOWN', known: false, message: data, status, fields: {} };
    }

    // ── 3. Safe generic fallbacks ───────────────────────────────────────────
    if (axiosError.code === 'SESSION_EXPIRED') {
      return {
        errorCode: 'SESSION_EXPIRED',
        known: false,
        message: 'Your session has expired. Please log in again.',
        status: 0,
        fields: {},
      };
    }
    if (axiosError.code === 'ERR_CANCELED') {
      return { errorCode: 'ERR_CANCELED', known: false, message: 'Request canceled.', status: 0, fields: {} };
    }
    if (status === 0) {
      return {
        errorCode: 'ERR_NETWORK',
        known: true,
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        fields: {},
      };
    }
    return {
      errorCode: 'ERR_UNKNOWN',
      known: false,
      message: genericMessageFor(status),
      status,
      fields: {},
    };
  } catch {
    // The parser itself must never be the reason a failure surfaces wrong.
    return {
      errorCode: 'ERR_UNKNOWN',
      known: false,
      message: 'Something went wrong. Please try again.',
      status: 0,
      fields: {},
    };
  }
}
