/**
 * Extract field errors from an API error response.
 *
 * EF-2: delegates to the central `parseApiError`, which understands BOTH the
 * legacy `errorMessages` dialect AND the new unified envelope (`ERR_VALIDATION`
 * with a `fields` map) — so the mentorship call sites gain envelope support
 * without any signature change.
 */
import { parseApiError } from '../errors';

export function getValidationFieldErrors(error: unknown): Record<string, string> | null {
  const parsed = parseApiError(error);
  return Object.keys(parsed.fields).length > 0 ? parsed.fields : null;
}
