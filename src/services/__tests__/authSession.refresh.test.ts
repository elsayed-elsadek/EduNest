/**
 * Session-engine tests (FE-008 / EF-25):
 *  - generation guard (GEN), write boundary
 *  - refresh outcomes: refreshed / rejected / throttled(429) / ambiguous
 *  - single-flight (T1)
 *  - parseRetryAfter (RA-1..3)
 *  - performLogout: bounded in-flight wait, newest token revocation, local
 *    cleanup always (RL-1..6)
 *
 * jsdom provides no BroadcastChannel / Web Locks — those paths degrade
 * gracefully in this module; the tests therefore cover the same-tab engine.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completeLogin,
  endSession,
  invalidateSession,
  parseRetryAfter,
  performLogout,
  refreshAccessToken,
  setAuthPair,
} from '../authSession';
import { useAuthStore } from '../../store/authStore';

/** Minimal fetch Response stand-in (jsdom-independent). */
const res = (status: number, body: unknown, retryAfter?: string) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: {
    get: (key: string) =>
      key.toLowerCase() === 'retry-after' && retryAfter !== undefined ? retryAfter : null,
  },
  json: async () => body,
});

/** Mock fetch returning a canned response; keeps last URL/body for asserts. */
function stubFetch(response: () => unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => response());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const state = () => useAuthStore.getState();

beforeEach(() => {
  // Skip the redirect guard inside performLogout/endSession.
  window.history.pushState({}, '', '/login');
  window.localStorage.clear();
  window.sessionStorage.clear();
  useAuthStore.getState().clearAuth();
});

describe('parseRetryAfter (RA-1..3)', () => {
  it('parses delta-seconds', () => {
    expect(parseRetryAfter('5')).toBe(5000);
  });

  it('parses an HTTP-date in the future', () => {
    const target = Date.now() + 7000;
    const httpDate = new Date(target).toUTCString();
    const delay = parseRetryAfter(httpDate);
    expect(delay).toBeGreaterThanOrEqual(5000);
    expect(delay).toBeLessThanOrEqual(9000);
  });

  it('falls back to 30s when missing or unparseable', () => {
    expect(parseRetryAfter(null)).toBe(30000);
    expect(parseRetryAfter('not-a-date')).toBe(30000);
  });
});

describe('write boundary — generation guard (GEN)', () => {
  it('completeLogin opens a generation and writes the pair', () => {
    completeLogin({
      token: 'at1',
      refreshToken: 'rt1',
      userName: 'Test User',
      userEmail: 'u@e.io',
      userRole: 'ROLE_MENTOR',
      rememberMe: false,
    });

    expect(state().token).toBe('at1');
    expect(state().refreshToken).toBe('rt1');
    expect(state().isAuthenticated).toBe(true);
  });

  it('setAuthPair is discarded after logout invalidates the generation', () => {
    completeLogin({ token: 'at1', refreshToken: 'rt1' });
    invalidateSession();

    const wrote = setAuthPair({ token: 'at2', refreshToken: 'rt2' });
    expect(wrote).toBe(false);
    expect(state().token).toBe('at1'); // unchanged
  });

  it('setAuthPair is discarded while no generation is active', () => {
    const wrote = setAuthPair({ token: 'ghost', refreshToken: 'ghost-r' });
    expect(wrote).toBe(false);
    expect(state().token).toBe('');
  });
});

describe('refreshAccessToken outcomes', () => {
  it("returns 'unavailable' when there is no refresh token", async () => {
    const fetchMock = stubFetch(() => res(200, {}));
    const outcome = await refreshAccessToken(undefined);
    expect(outcome.kind).toBe('unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 'refreshed', writes the rotated pair, and never puts tokens in the URL", async () => {
    const fetchMock = stubFetch(() =>
      res(200, { apiResponse: { jwt: 'at2', refreshToken: 'rt2' } })
    );
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    const outcome = await refreshAccessToken('at1');

    expect(outcome).toEqual({ kind: 'refreshed', token: 'at2', refreshToken: 'rt2' });
    expect(state().token).toBe('at2');
    expect(state().refreshToken).toBe('rt2');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(url).toContain('/login-api/refresh');
    expect(url).not.toContain('rt1'); // refresh token never in a URL
    expect(init.body).toContain('rt1'); // …it travels in the body
    expect(init.body).not.toContain('at1');
  });

  it("returns 'rejected' on explicit 401/400 and preserves tokens", async () => {
    stubFetch(() => res(401, { message: 'expired' }));
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    const outcome = await refreshAccessToken('at1');

    expect(outcome.kind).toBe('rejected');
    expect(state().token).toBe('at1');
    expect(state().refreshToken).toBe('rt1');
  });

  it("returns 'ambiguous' on a 200 with an unusable body", async () => {
    stubFetch(() => res(200, { apiResponse: { jwt: 123 } }));
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    const outcome = await refreshAccessToken('at1');

    expect(outcome.kind).toBe('ambiguous');
    expect(state().token).toBe('at1');
  });

  it("returns 'ambiguous' on a network failure (never retried blindly)", async () => {
    stubFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    const outcome = await refreshAccessToken('at1');
    expect(outcome.kind).toBe('ambiguous');
  });

  it("returns 'throttled' on 429, preserves tokens, and blocks early retries (RA)", async () => {
    const fetchMock = stubFetch(() => res(429, {}, '7'));
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    const outcome = await refreshAccessToken('at1');
    expect(outcome.kind).toBe('throttled');
    expect(state().token).toBe('at1'); // tokens preserved — NOT an auth failure
    expect(state().refreshToken).toBe('rt1');

    // Immediate second attempt is refused locally without another request.
    const again = await refreshAccessToken('at1');
    expect(again.kind).toBe('throttled');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('single-flight refresh (T1)', () => {
  it('concurrent callers share one in-flight request', async () => {
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    const a = refreshAccessToken('at1');
    const b = refreshAccessToken('at1');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(res(200, { apiResponse: { jwt: 'at2', refreshToken: 'rt2' } }));
    const [finalA, finalB] = await Promise.all([a, b]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(finalA).toEqual({ kind: 'refreshed', token: 'at2', refreshToken: 'rt2' });
    expect(finalB).toEqual(finalA);
  });
});

describe('performLogout (RL-1..6)', () => {
  it('broadcasts, revokes with the current refresh token, and always cleans up locally', async () => {
    const fetchMock = vi.fn(async (url: unknown) => {
      expect(String(url)).toContain('/login-api/logout');
      return res(200, {});
    });
    vi.stubGlobal('fetch', fetchMock);
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    await performLogout();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, { body: string }];
    expect(init.body).toContain('rt1');

    const after = state();
    expect(after.token).toBe('');
    expect(after.refreshToken).toBe('');
    expect(after.isAuthenticated).toBe(false);
    expect(readHome('local')).toBeNull();
    expect(readHome('session')).toBeNull();
  });

  it('waits for an in-flight refresh and revokes with the NEWEST token; its write is suppressed', async () => {
    let resolveRefresh!: () => void;
    const logoutBodies: string[] = [];
    const fetchMock = vi.fn((url: unknown, init?: { body: string }) => {
      if (String(url).includes('/login-api/refresh')) {
        return new Promise((resolve) => {
          resolveRefresh = () => resolve(res(200, { apiResponse: { jwt: 'at2', refreshToken: 'rt2' } }));
        });
      }
      logoutBodies.push(init?.body ?? '');
      return Promise.resolve(res(200, {}));
    });
    vi.stubGlobal('fetch', fetchMock);

    completeLogin({ token: 'at1', refreshToken: 'rt1' });
    const inFlight = refreshAccessToken('at1');
    const loggingOut = performLogout();
    resolveRefresh();
    await Promise.all([inFlight, loggingOut]);

    // The mid-flight rotation must NOT land in storage (generation guard)…
    expect(state().token).toBe('');
    // …but the revocation call must carry the newest refresh token (RL-2).
    expect(logoutBodies.length).toBe(1);
    expect(logoutBodies[0]).toContain('rt2');
  });

  it('local cleanup happens even when the revocation call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline');
      })
    );
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    await performLogout();

    expect(state().token).toBe('');
    expect(state().isAuthenticated).toBe(false);
  });

  it("refreshes are refused after logout ('unavailable')", async () => {
    const fetchMock = stubFetch(() => res(200, {}));
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    await performLogout();

    const callsAfterLogout = fetchMock.mock.calls.length;
    const outcome = await refreshAccessToken('at1');
    expect(outcome.kind).toBe('unavailable');
    expect(fetchMock.mock.calls.length).toBe(callsAfterLogout); // no new request
  });
});

describe('endSession', () => {
  it('clears the session locally and blocks further writes', async () => {
    completeLogin({ token: 'at1', refreshToken: 'rt1' });

    endSession('refresh rejected');

    expect(state().token).toBe('');
    expect(state().isAuthenticated).toBe(false);
    const wrote = setAuthPair({ token: 'at2', refreshToken: 'rt2' });
    expect(wrote).toBe(false);
  });
});

function readHome(home: 'local' | 'session'): string | null {
  const storage = home === 'local' ? window.localStorage : window.sessionStorage;
  return storage.getItem('auth-storage');
}
