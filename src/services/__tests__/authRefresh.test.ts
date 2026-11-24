/**
 * FE-027 — single-flight refresh token rotation against the real store.
 *
 * Covers: rotation persistence (TC-REFRESH-05), rejection paths (TC-REFRESH-03/04/07),
 * the peer-tab "already rotated while waiting" guard (TC-REFRESH-06 core), and
 * same-tab single-flight deduplication (TC-REFRESH-02 core).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const handleSessionExpiredMock = vi.fn();

vi.mock('../../store/authStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../store/authStore')>();
  return {
    ...actual,
    handleSessionExpired: (...args: unknown[]) => handleSessionExpiredMock(...args),
  };
});

import { refreshAccessToken } from '../authRefresh';
import {
  clearAuthWithoutRedirect,
  getAuthGeneration,
  getStoredAuth,
  useAuthStore,
} from '../../store/authStore';

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: Record<string, unknown>): string {
  return [
    toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
    toBase64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
}

const oldToken = makeToken({ sub: 'old' });
const newToken = makeToken({ sub: 'new' });

interface MockResponse {
  ok: boolean;
  status: number;
  headers: { get: (name: string) => string | null };
  json: () => Promise<unknown>;
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  };
}

/** A fetch response that resolves only when the test releases it. */
function deferredResponse(): {
  promise: Promise<MockResponse>;
  resolve: (value: MockResponse) => void;
} {
  let resolve!: (value: MockResponse) => void;
  const promise = new Promise<MockResponse>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

/** Seeds the persisted pair + in-memory state (remember-me-on → localStorage). */
function seedPair(token: string, refreshToken: string): void {
  window.localStorage.setItem(
    'auth-storage',
    JSON.stringify({ state: { token, refreshToken, rememberMe: true, isAuthenticated: true }, version: 0 })
  );
  useAuthStore.setState({ token, refreshToken, rememberMe: true, isAuthenticated: true });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  window.localStorage.clear();
  window.sessionStorage.clear();
  useAuthStore.setState({ token: '', refreshToken: '', isAuthenticated: false, rememberMe: false });
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  handleSessionExpiredMock.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // remove the Web Locks stub from the peer-tab test — a leaked lock mutates
  // storage in every later test and sends them down the reuse path
  delete (navigator as unknown as { locks?: unknown }).locks;
});

describe('refreshAccessToken (FE-027)', () => {
  it('rotates the pair and persists BOTH new tokens (TC-REFRESH-05)', async () => {
    seedPair(oldToken, 'rt1');
    fetchMock.mockResolvedValue(
      jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2', status: 'ok' } })
    );

    const token = await refreshAccessToken(oldToken);

    expect(token).toBe(newToken);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/login-api/refresh');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: 'rt1' });
    // rotation continuity: the NEW pair is persisted, the old refresh token is gone
    expect(getStoredAuth()).toEqual({ token: newToken, refreshToken: 'rt2' });
    expect(window.localStorage.getItem('auth-storage')).toContain('rt2');
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('a 401 ERR_INVALID_TOKEN ends the session exactly once (TC-REFRESH-03)', async () => {
    seedPair(oldToken, 'rt1');
    fetchMock.mockResolvedValue(jsonResponse(401, { errorCode: 'ERR_INVALID_TOKEN' }));

    await expect(refreshAccessToken(oldToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('a 429 with Retry-After ends the session once instead of hammering (TC-REFRESH-04)', async () => {
    seedPair(oldToken, 'rt1');
    fetchMock.mockResolvedValue(jsonResponse(429, { errorCode: 'ERR_RATE_LIMIT' }, { 'Retry-After': '30' }));

    await expect(refreshAccessToken(oldToken)).rejects.toMatchObject({
      code: 'REFRESH_RATE_LIMITED',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('an ambiguous network drop ends the session and never retries the old token (TC-REFRESH-07)', async () => {
    seedPair(oldToken, 'rt1');
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(refreshAccessToken(oldToken)).rejects.toMatchObject({
      code: 'REFRESH_AMBIGUOUS',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1); // exactly one attempt — no blind retry
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('rejects immediately when there is no refresh token to rotate', async () => {
    useAuthStore.setState({ token: '', refreshToken: '', isAuthenticated: false });

    await expect(refreshAccessToken(undefined)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('reuses the peer tab pair when the token rotated while waiting for the lock (TC-REFRESH-06)', async () => {
    seedPair(oldToken, 'rt1');
    const peerToken = makeToken({ sub: 'peer-tab' });
    const peerRt = 'rt-from-peer';
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: {
        request: async (_name: string, callback: () => Promise<string>) => {
          // simulate a peer tab completing its rotation while this tab waited
          window.localStorage.setItem(
            'auth-storage',
            JSON.stringify({
              state: { token: peerToken, refreshToken: peerRt, rememberMe: true, isAuthenticated: true },
              version: 0,
            })
          );
          return callback();
        },
      },
    });

    const token = await refreshAccessToken(oldToken);

    expect(token).toBe(peerToken); // peer's access token reused…
    expect(fetchMock).not.toHaveBeenCalled(); // …without a second rotation
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('single-flights same-tab concurrent callers into ONE refresh request (TC-REFRESH-02 core)', async () => {
    seedPair(oldToken, 'rt1');
    let releaseFetch!: (value: MockResponse) => void;
    fetchMock.mockReturnValue(
      new Promise<MockResponse>((resolve) => {
        releaseFetch = resolve;
      })
    );

    const first = refreshAccessToken(oldToken);
    const second = refreshAccessToken(oldToken);
    releaseFetch(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } }));

    const [a, b] = await Promise.all([first, second]);

    expect(a).toBe(newToken);
    expect(b).toBe(newToken);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('discards a pending refresh result after non-redirecting auth cleanup', async () => {
    seedPair(oldToken, 'rt1');
    let releaseFetch!: (value: MockResponse) => void;
    fetchMock.mockReturnValue(
      new Promise<MockResponse>((resolve) => {
        releaseFetch = resolve;
      })
    );

    const pendingRefresh = refreshAccessToken(oldToken);
    clearAuthWithoutRedirect();
    releaseFetch(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } }));

    await expect(pendingRefresh).rejects.toMatchObject({ code: 'AUTH_STATE_CHANGED' });
    expect(useAuthStore.getState()).toMatchObject({ token: '', refreshToken: '', isAuthenticated: false });
    expect(getStoredAuth()).toEqual({ token: '', refreshToken: '' });
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
    expect(window.sessionStorage.getItem('auth-storage')).toBeNull();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('keeps a successful refresh authenticated until cleanup is explicitly requested', async () => {
    seedPair(oldToken, 'rt1');
    fetchMock.mockResolvedValue(
      jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } })
    );

    await expect(refreshAccessToken(oldToken)).resolves.toBe(newToken);
    expect(getStoredAuth()).toEqual({ token: newToken, refreshToken: 'rt2' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('a login during a pending refresh keeps the new session and discards the old result', async () => {
    seedPair(oldToken, 'rt1');
    const pending = deferredResponse();
    fetchMock.mockReturnValue(pending.promise);

    const refresh = refreshAccessToken(oldToken);
    const loginToken = makeToken({ sub: 'login-2' });
    useAuthStore.getState().setAuth({ token: loginToken, refreshToken: 'rt-login-2' });

    pending.resolve(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } }));

    await expect(refresh).rejects.toMatchObject({ code: 'AUTH_STATE_CHANGED' });
    expect(useAuthStore.getState()).toMatchObject({
      token: loginToken,
      refreshToken: 'rt-login-2',
      isAuthenticated: true,
    });
    expect(getStoredAuth()).toEqual({ token: loginToken, refreshToken: 'rt-login-2' });
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('adopting a peer pair invalidates a refresh started under the previous session', async () => {
    seedPair(oldToken, 'rt1');
    const pending = deferredResponse();
    fetchMock.mockReturnValue(pending.promise);

    const refresh = refreshAccessToken(oldToken);

    const peerToken = makeToken({ sub: 'peer' });
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: { token: peerToken, refreshToken: 'rt-peer', rememberMe: true, isAuthenticated: true },
        version: 0,
      })
    );
    window.dispatchEvent(new StorageEvent('storage', { key: 'auth-storage' }));

    pending.resolve(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } }));

    await expect(refresh).rejects.toMatchObject({ code: 'AUTH_STATE_CHANGED' });
    expect(useAuthStore.getState()).toMatchObject({ token: peerToken, refreshToken: 'rt-peer' });
    expect(getStoredAuth()).toEqual({ token: peerToken, refreshToken: 'rt-peer' });
  });

  it('a new session starts a fresh refresh instead of joining the old promise', async () => {
    seedPair(oldToken, 'rt1');
    const first = deferredResponse();
    const second = deferredResponse();
    fetchMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const oldRefresh = refreshAccessToken(oldToken);

    const loginToken = makeToken({ sub: 'login-3' });
    const rotatedLoginToken = makeToken({ sub: 'login-3-rotated' });
    useAuthStore.getState().setAuth({ token: loginToken, refreshToken: 'rt-login-3' });

    const newRefresh = refreshAccessToken(loginToken);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    first.resolve(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt-old-rotated' } }));
    second.resolve(
      jsonResponse(200, { apiResponse: { jwt: rotatedLoginToken, refreshToken: 'rt-login-3b' } })
    );

    await expect(oldRefresh).rejects.toMatchObject({ code: 'AUTH_STATE_CHANGED' });
    await expect(newRefresh).resolves.toBe(rotatedLoginToken);
    expect(getStoredAuth()).toEqual({ token: rotatedLoginToken, refreshToken: 'rt-login-3b' });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1].body))).toEqual({ refreshToken: 'rt-login-3' });
  });

  it('an older refresh settling cannot clear the newer in-flight refresh', async () => {
    seedPair(oldToken, 'rt1');
    const first = deferredResponse();
    const second = deferredResponse();
    const third = deferredResponse();
    fetchMock
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockReturnValueOnce(third.promise);

    const oldRefresh = refreshAccessToken(oldToken);

    const loginToken = makeToken({ sub: 'login-4' });
    const rotatedLoginToken = makeToken({ sub: 'login-4-rotated' });
    useAuthStore.getState().setAuth({ token: loginToken, refreshToken: 'rt-login-4' });

    const newRefresh = refreshAccessToken(loginToken);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    first.resolve(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } }));
    await expect(oldRefresh).rejects.toMatchObject({ code: 'AUTH_STATE_CHANGED' });

    // The settled old promise must not have removed the newer refresh slot.
    const thirdCaller = refreshAccessToken(loginToken);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    second.resolve(
      jsonResponse(200, { apiResponse: { jwt: rotatedLoginToken, refreshToken: 'rt-login-4b' } })
    );

    await expect(thirdCaller).resolves.toBe(rotatedLoginToken);
    await expect(newRefresh).resolves.toBe(rotatedLoginToken);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('a profile-only update does not invalidate an in-flight refresh', async () => {
    seedPair(oldToken, 'rt1');
    const pending = deferredResponse();
    fetchMock.mockReturnValue(pending.promise);

    const refresh = refreshAccessToken(oldToken);
    const generationBefore = getAuthGeneration();

    useAuthStore.getState().updateProfile({ userName: 'Updated Name' });

    expect(getAuthGeneration()).toBe(generationBefore);
    pending.resolve(jsonResponse(200, { apiResponse: { jwt: newToken, refreshToken: 'rt2' } }));

    await expect(refresh).resolves.toBe(newToken);
    expect(useAuthStore.getState()).toMatchObject({
      token: newToken,
      refreshToken: 'rt2',
      userName: 'Updated Name',
    });
  });

  it('an unusable token pair from the backend ends the session', async () => {
    seedPair(oldToken, 'rt1');
    fetchMock.mockResolvedValue(jsonResponse(200, { apiResponse: { jwt: 'garbage', refreshToken: '' } }));

    await expect(refreshAccessToken(oldToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });
});
