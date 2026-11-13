/**
 * Default request timeout, matching the axios client in `src/services/api.ts`
 * so both transport layers behave identically.
 */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Typed error thrown by `fetchWithTimeout` when the deadline elapses. */
export class RequestTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs} ms`);
    this.name = 'RequestTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * `fetch` with a hard deadline. Raw `fetch` calls in the codebase have no
 * timeout, so a dead connection leaves the UI spinning forever — this wrapper
 * aborts after `timeoutMs` and rejects with a typed `RequestTimeoutError`.
 *
 * If the caller supplies its own `init.signal`, both signals are honoured:
 * whichever fires first wins (the external abort reason is preserved so the
 * caller can still distinguish "user cancelled" from "timed out").
 */
export async function fetchWithTimeout(
  url: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const externalSignal = init.signal ?? undefined;

  // Short-circuit: an already-aborted signal must reject immediately —
  // fetch() must not be called at all.
  if (externalSignal?.aborted) {
    throw externalSignal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
  }

  const controller = new AbortController();
  const reason = new DOMException(
    `Request timed out after ${timeoutMs} ms`,
    'TimeoutError',
  );

  const timer = setTimeout(() => controller.abort(reason), timeoutMs);

  const onExternalAbort = () => controller.abort(externalSignal?.reason);

  if (externalSignal) {
    if (externalSignal.aborted) {
      onExternalAbort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  const cleanup = () => {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  };

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    // Re-throw the abort reason when it is ours, normalised to the typed
    // error so `classifyRequestError` can recognise it without DOMException
    // name sniffing.
    if (error === reason || (error instanceof DOMException && error.name === 'TimeoutError')) {
      throw new RequestTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    cleanup();
  }
}

export default fetchWithTimeout;
