/**
 * FE-027 — silent refresh-token rotation with single-flight deduplication.
 *
 * Backend contract (Integration Handbook §3 / EB-91, verified live on Swagger):
 * - `POST /login-api/refresh` body `{ refreshToken }` → 200 `{ apiResponse: { jwt, refreshToken, ... } }`
 *   — the submitted refresh token is CONSUMED (single-use rotation).
 * - Re-submitting a consumed token triggers family revocation → the user is
 *   logged out everywhere. The backend takes NO pessimistic row lock, so
 *   client-side single-flight is strictly mandatory, not an optimization.
 * - 401 `ERR_INVALID_TOKEN` (expired/replayed) and 429 (rate limited, with
 *   `Retry-After`) both end the session.
 * - An ambiguous network drop mid-refresh may have rotated the token server-side —
 *   retrying the old token is forbidden; the session must be treated as expired.
 *
 * Cross-tab coordination (Option A — persisted pair): the rotated pair lands in
 * web storage, which peer tabs re-read after acquiring the Web Locks mutex.
 */
import { getStoredAuth, handleSessionExpired, notifyAuthPeers, useAuthStore } from '../store/authStore';
import { isTokenValid } from '../utils/jwt';
import { API_BASE_URL } from '../config/env';
import logger from '../utils/logger';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const REFRESH_ENDPOINT = `${API_BASE_URL}/login-api/refresh`;
const REFRESH_LOCK = 'edunest_auth_refresh_lock';
/** Refresh can take longer than ordinary API calls, but must remain bounded. */
const REFRESH_TIMEOUT_MS = 30_000;

/** In-flight refresh promise — guarantees ONE refresh per tab regardless of how many 401s race. */
let refreshPromise: Promise<string> | null = null;

/** Web Locks API, typed defensively (not in all TS lib targets / browsers). */
interface LocksLike {
  request: (name: string, callback: () => Promise<string>) => Promise<string>;
}

function getLocks(): LocksLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as unknown as { locks?: LocksLike }).locks;
}

/**
 * Performs the actual rotation. `observedRefreshToken` is what this caller saw
 * before serializing — if the stored token differs by now, a peer tab already
 * rotated and we must reuse its access token instead of rotating again.
 */
async function executeRefresh(observedRefreshToken: string): Promise<string> {
  const { refreshToken: currentRefreshToken } = getStoredAuth();

  if (!currentRefreshToken) {
    handleSessionExpired();
    throw Object.assign(new Error('No refresh token available'), { code: 'SESSION_EXPIRED' });
  }

  if (currentRefreshToken !== observedRefreshToken) {
    // A peer tab rotated while we waited for the lock — its access token is
    // already persisted and unused. Reusing it avoids a pointless rotation.
    const { token: latestToken } = getStoredAuth();
    if (latestToken) return latestToken;
  }

  let response: Response;
  try {
    // Keep refresh outside the axios interceptor to avoid recursive refresh;
    // the shared fetch wrapper still supplies the standard timeout/abort path.
    response = await fetchWithTimeout(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    }, REFRESH_TIMEOUT_MS);
  } catch (error) {
    // AMBIGUOUS FAILURE (Handbook §3 CRITICAL): the request may have reached
    // the backend and rotated the token before the connection dropped. The old
    // token must never be retried — end the session exactly once.
    logger.warn('Refresh request failed before a response arrived — ending session', error);
    handleSessionExpired();
    throw Object.assign(new Error('Refresh request failed — ambiguous outcome'), {
      code: 'REFRESH_AMBIGUOUS',
    });
  }

  if (response.status === 429) {
    // Rate limited. The approved behaviour (TC-REFRESH-04) is to end the
    // session once rather than hammer the endpoint; `Retry-After` is surfaced
    // for the login screen banner.
    const retryAfter = response.headers.get('Retry-After');
    logger.warn(`Refresh rate limited by the backend — Retry-After: ${retryAfter ?? 'unknown'}s`);
    handleSessionExpired();
    throw Object.assign(new Error('Refresh rate limited'), { code: 'REFRESH_RATE_LIMITED' });
  }

  if (!response.ok) {
    // 401 ERR_INVALID_TOKEN — expired, revoked, or replayed refresh token.
    handleSessionExpired();
    throw Object.assign(new Error('Refresh token rejected'), { code: 'SESSION_EXPIRED' });
  }

  let apiResponse: { jwt?: string; refreshToken?: string } | undefined;
  try {
    const data = (await response.json()) as { apiResponse?: { jwt?: string; refreshToken?: string } };
    apiResponse = data?.apiResponse;
  } catch {
    // malformed body → fall through to the invalid-pair guard below
  }

  const newToken = apiResponse?.jwt ?? '';
  const newRefreshToken = apiResponse?.refreshToken ?? '';

  // Never authenticate with a malformed/expired pair — the session is over.
  if (!newToken || !isTokenValid(newToken) || !newRefreshToken) {
    logger.warn('Refresh returned an unusable token pair — ending session');
    handleSessionExpired();
    throw Object.assign(new Error('Refresh returned an invalid token pair'), {
      code: 'SESSION_EXPIRED',
    });
  }

  // Persist the rotated pair atomically — the old refresh token is now dead.
  useAuthStore.getState().setTokenPair(newToken, newRefreshToken);
  notifyAuthPeers({ type: 'TOKEN_REFRESHED' });

  return newToken;
}

/**
 * Single-flight silent refresh. All concurrent 401s await the SAME promise;
 * the first caller passes the access token its failed request actually used so
 * a rotation completed by a peer tab (before lock acquisition) is detected.
 *
 * @param failedAccessToken the `Bearer <jwt>` the failing request sent, if any
 * @returns the new access token for retrying the original request
 * @throws `SESSION_EXPIRED`-coded errors after the session has been cleared
 */
export async function refreshAccessToken(failedAccessToken?: string): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const observed = getStoredAuth();

  const run = async (): Promise<string> => {
    // Another tab may have rotated while this caller waited for the lock —
    // re-read the shared state before burning our (still valid) refresh token.
    const latest = getStoredAuth();
    const accessAlreadyReplaced =
      !!failedAccessToken && !!latest.token && latest.token !== failedAccessToken;
    const refreshAlreadyRotated =
      !!observed.refreshToken && !!latest.refreshToken && latest.refreshToken !== observed.refreshToken;

    if (latest.token && (accessAlreadyReplaced || refreshAlreadyRotated)) {
      return latest.token;
    }
    return executeRefresh(observed.refreshToken);
  };

  const locks = getLocks();
  const pending = locks ? locks.request(REFRESH_LOCK, run) : run();

  refreshPromise = pending.finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
