import { RequestTimeoutError } from './fetchWithTimeout';

/**
 * Coarse failure classification used by the error UI: the user gets a
 * different message (and recovery hint) for each kind.
 *
 * - `offline`  — the browser reports no connection; retrying later is right.
 * - `timeout`  — the request took too long; retrying now may work.
 * - `server`   — the request reached a server and it answered with an error.
 * - `unknown`  — anything else (bug, cancelled request, CORS, …).
 */
export type RequestFailureKind = 'offline' | 'timeout' | 'server' | 'unknown';

interface AxiosLikeError {
  code?: string;
  name?: string;
  response?: { status?: number };
}

export function classifyRequestError(error: unknown): RequestFailureKind {
  // The browser's own verdict wins: if we are offline, that is the actionable
  // information regardless of what the transport threw.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'offline';
  }

  if (error instanceof RequestTimeoutError) {
    return 'timeout';
  }

  const candidate = error as AxiosLikeError | null;

  if (candidate && typeof candidate === 'object') {
    // axios aborts with code ECONNABORTED; fetch aborts with a DOMException
    // named TimeoutError (or our normalised RequestTimeoutError).
    if (
      candidate.code === 'ECONNABORTED' ||
      candidate.name === 'TimeoutError' ||
      candidate.name === 'RequestTimeoutError'
    ) {
      return 'timeout';
    }

    if (
      candidate.response &&
      typeof candidate.response.status === 'number'
    ) {
      return 'server';
    }
  }

  return 'unknown';
}

export default classifyRequestError;
