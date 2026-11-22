/**
 * EF-2 — presentation-only error surfacing.
 *
 * Renders a normalized API error as a toast with the backend's clean
 * `message`, appending the correlation id on 5xx responses (support contexts).
 *
 * STRICT separation of concerns:
 *  - this helper NEVER decides anything about authentication — no logout, no
 *    refresh, no store writes, no navigation. Those decisions live exclusively
 *    in api.ts / authStore.
 *  - canceled requests and the local SESSION_EXPIRED rejection are skipped:
 *    the redirect + login banner already own that experience.
 */
import toast from 'react-hot-toast';
import { parseApiError } from '../services/errors';

function allowedFieldNames(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // The backend currently sends a comma-separated string; retain support for it.
  }
  return value.split(',').map((field) => field.trim()).filter(Boolean);
}

function safeFieldName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 100);
}

export function showApiError(error: unknown): void {
  const parsed = parseApiError(error);
  if (parsed.errorCode === 'ERR_CANCELED' || parsed.errorCode === 'SESSION_EXPIRED') return;

  if (parsed.errorCode === 'ERR_UNKNOWN_FIELD') {
    const invalidField = parsed.fields.invalidField;
    const safeInvalidField = invalidField ? safeFieldName(invalidField) : '';
    const allowedFields = allowedFieldNames(parsed.fields.allowedFields)
      .map(safeFieldName)
      .filter(Boolean);
    if (safeInvalidField) {
      const allowed = allowedFields.length ? ` Allowed fields: ${allowedFields.join(', ')}.` : '';
      toast.error(`Request contains an undeclared field: ${safeInvalidField}.${allowed}`);
      return;
    }
  }

  const reference = parsed.status >= 500 && parsed.refId ? ` (Reference: ${parsed.refId})` : '';
  toast.error(`${parsed.message}${reference}`);
}
