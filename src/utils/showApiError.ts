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

export function showApiError(error: unknown): void {
  const parsed = parseApiError(error);
  if (parsed.errorCode === 'ERR_CANCELED' || parsed.errorCode === 'SESSION_EXPIRED') return;

  const reference = parsed.status >= 500 && parsed.refId ? ` (Reference: ${parsed.refId})` : '';
  toast.error(`${parsed.message}${reference}`);
}
