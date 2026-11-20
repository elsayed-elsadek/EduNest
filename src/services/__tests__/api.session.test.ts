/**
 * FE-027 — session lifecycle of the shared axios instance:
 * a 401 on a protected endpoint triggers ONE silent refresh and replays the
 * request; a refresh failure rejects without an infinite loop; expired access
 * tokens are refreshed before a protected request is sent.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

const { getAuthTokenMock, handleSessionExpiredMock, refreshAccessTokenMock } = vi.hoisted(() => ({
  getAuthTokenMock: vi.fn(() => ''),
  handleSessionExpiredMock: vi.fn(),
  refreshAccessTokenMock: vi.fn(),
}));

vi.mock('../../store/authStore', () => ({
  getAuthToken: () => getAuthTokenMock(),
  handleSessionExpired: () => handleSessionExpiredMock(),
}));

vi.mock('../authRefresh', () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessTokenMock(...args),
}));

import api from '../api';

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

interface AdapterReply {
  status: number;
  data?: unknown;
  headers?: Record<string, string>;
}

/** Adapter answering per-URL, recording every call's URL + Authorization header. */
function stubAdapter(
  handler: (config: InternalAxiosRequestConfig, seenCalls: number) => AdapterReply
): { calls: Array<{ url?: string; auth?: string }> } {
  const state = { calls: [] as Array<{ url?: string; auth?: string }> };
  api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    state.calls.push({
      url: config.url,
      auth:
        typeof config.headers?.Authorization === 'string' ? config.headers.Authorization : undefined,
    });
    const seenCalls = state.calls.filter((c) => c.url === config.url).length;
    const reply = handler(config, seenCalls);
    const response = {
      status: reply.status,
      statusText: reply.status >= 400 ? 'Error' : 'OK',
      data: reply.data ?? {},
      headers: reply.headers ?? {},
      config,
    };
    if (reply.status >= 200 && reply.status < 300) return Promise.resolve(response);
    return Promise.reject(
      Object.assign(new Error('Request failed'), { code: 'ERR_BAD_REQUEST', config, response })
    );
  }) as never;
  return state;
}

const REFRESH_BODY = { apiResponse: { jwt: makeToken({ sub: 'new' }), refreshToken: 'rt2' } };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  getAuthTokenMock.mockReset().mockReturnValue('');
  handleSessionExpiredMock.mockClear();
  refreshAccessTokenMock.mockReset();
  api.defaults.adapter = undefined as never;
});

afterEach(() => {
  api.defaults.adapter = undefined as never;
  vi.restoreAllMocks();
});

describe('api — silent refresh on 401 (FE-027)', () => {
  it('replays a protected request once with the rotated token after a refresh', async () => {
    const oldToken = makeToken({ sub: 'old' });
    const newToken = makeToken({ sub: 'new' });
    // the replay re-runs the request interceptor, which reads the (rotated) store
    getAuthTokenMock.mockReturnValueOnce(oldToken).mockReturnValue(newToken);
    refreshAccessTokenMock.mockResolvedValue(newToken);
    const state = stubAdapter((config, seenCalls) =>
      config.url?.includes('refresh')
        ? { status: 200, data: REFRESH_BODY }
        : seenCalls > 1
          ? { status: 200, data: { ok: true } }
          : { status: 401, data: { errorCode: 'ERR_INVALID_TOKEN' } }
    );

    const result = await api.get('/api/v1/protected');

    expect(result.status).toBe(200);
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(refreshAccessTokenMock).toHaveBeenCalledWith(oldToken);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
    // initial 401 + replayed retry — the retry carried the rotated token
    const protectedCalls = state.calls.filter((c) => c.url === '/api/v1/protected');
    expect(protectedCalls).toHaveLength(2);
    expect(protectedCalls[1].auth).toBe(`Bearer ${newToken}`);
  });

  it('5 concurrent 401s all recover through the single-flight refresh', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: 'old' }));
    refreshAccessTokenMock.mockResolvedValue(makeToken({ sub: 'new' }));
    stubAdapter((config, seenCalls) =>
      config.url?.includes('refresh')
        ? { status: 200, data: REFRESH_BODY }
        : seenCalls > 1
          ? { status: 200, data: { ok: true } }
          : { status: 401, data: {} }
    );

    const results = await Promise.allSettled([
      api.get('/api/v1/protected'),
      api.get('/api/v1/protected'),
      api.get('/api/v1/protected'),
      api.get('/api/v1/protected'),
      api.get('/api/v1/protected'),
    ]);

    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('a 401 after the replay clears the session exactly once — no refresh loop', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: 'old' }));
    refreshAccessTokenMock.mockResolvedValue(makeToken({ sub: 'new' }));
    stubAdapter(() => ({ status: 401, data: {} })); // protected endpoint stays 401

    await expect(api.get('/api/v1/protected')).rejects.toBeDefined();

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('a failed refresh rejects the original request without a second refresh', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: 'old' }));
    refreshAccessTokenMock.mockRejectedValue(
      Object.assign(new Error('Refresh token rejected'), { code: 'SESSION_EXPIRED' })
    );
    stubAdapter((config) =>
      config.url?.includes('refresh')
        ? { status: 401, data: { errorCode: 'ERR_INVALID_TOKEN' } }
        : { status: 401, data: {} }
    );

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
  });

  it('a 401 on a public auth path never refreshes and never clears the session', async () => {
    stubAdapter(() => ({ status: 401, data: { errorCode: 'ERR_INVALID_CREDENTIALS' } }));

    await expect(api.post('/login-api', { email: 'a@b.com', password: 'x' })).rejects.toBeDefined();

    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('non-401 errors keep the session', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: '1' }));
    stubAdapter(() => ({ status: 500, data: {} }));

    await expect(api.get('/api/v1/protected')).rejects.toBeDefined();

    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });
});

describe('api — request-driven refresh before access-token expiry (FE-008)', () => {
  it('refreshes an expired access token before sending the protected request', async () => {
    const expiredToken = makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
    const newToken = makeToken({ sub: 'refreshed', exp: Math.floor(Date.now() / 1000) + 3600 });
    getAuthTokenMock.mockReturnValueOnce(expiredToken).mockReturnValue(newToken);
    refreshAccessTokenMock.mockResolvedValue(newToken);
    const adapter = stubAdapter(() => ({ status: 200, data: { ok: true } }));

    const result = await api.get('/api/v1/protected');

    expect(result.status).toBe(200);
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(refreshAccessTokenMock).toHaveBeenCalledWith(expiredToken);
    expect(adapter.calls).toEqual([
      { url: '/api/v1/protected', auth: `Bearer ${newToken}` },
    ]);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('refreshes shortly before expiry when a protected request is made', async () => {
    const nearExpiryToken = makeToken({ exp: Math.floor(Date.now() / 1000) + 30 });
    const newToken = makeToken({ sub: 'refreshed', exp: Math.floor(Date.now() / 1000) + 3600 });
    getAuthTokenMock.mockReturnValueOnce(nearExpiryToken).mockReturnValue(newToken);
    refreshAccessTokenMock.mockResolvedValue(newToken);
    const adapter = stubAdapter(() => ({ status: 200, data: { ok: true } }));

    await api.get('/api/v1/protected');

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(refreshAccessTokenMock).toHaveBeenCalledWith(nearExpiryToken);
    expect(adapter.calls[0].auth).toBe(`Bearer ${newToken}`);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('a failed refresh rejects the protected request and preserves the refresh failure path', async () => {
    const expiredToken = makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
    getAuthTokenMock.mockReturnValue(expiredToken);
    refreshAccessTokenMock.mockRejectedValue(
      Object.assign(new Error('Refresh token rejected'), { code: 'SESSION_EXPIRED' })
    );
    const adapter = stubAdapter(() => ({ status: 200, data: { ok: true } }));

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(adapter.calls).toHaveLength(0);
    // authRefresh owns ending the session on a failed refresh.
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('a malformed token is rejected locally as unauthenticated', async () => {
    const adapter = stubAdapter(() => ({ status: 200 }));
    getAuthTokenMock.mockReturnValue('garbage');

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });

    expect(adapter.calls).toHaveLength(0);
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });
});

describe('api — unified error contract (EF-2)', () => {
  it('preserves auth 429 normalization and Retry-After without retrying the request', async () => {
    const state = stubAdapter(() => ({
      status: 429,
      data: { status: 429, error: 'Too Many Requests', errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
      headers: { 'Retry-After': '47' },
    }));

    const rejection = await api.post('/login-api', { email: 'a@b.com' }).catch((error) => error);

    expect(state.calls).toHaveLength(1);
    expect(rejection.normalized).toMatchObject({
      errorCode: 'ERR_RATE_LIMITED',
      message: 'Slow down.',
      status: 429,
      error: 'Too Many Requests',
      retryAfterSeconds: 47,
    });
  });

  it('a 401 ERR_UNAUTHENTICATED envelope on a protected path still triggers ONE refresh, no logout', async () => {
    const oldToken = makeToken({ sub: 'old' });
    const newToken = makeToken({ sub: 'new' });
    getAuthTokenMock.mockReturnValueOnce(oldToken).mockReturnValue(newToken);
    refreshAccessTokenMock.mockResolvedValue(newToken);
    stubAdapter((_config, seenCalls) =>
      seenCalls > 1
        ? { status: 200, data: { ok: true } }
        : { status: 401, data: { errorCode: 'ERR_UNAUTHENTICATED', message: 'Authentication required. Please log in.' } }
    );

    const result = await api.get('/api/v1/protected');

    expect(result.status).toBe(200);
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('a login 401 with an EXISTING session never refreshes and never logs out', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: 'active-session' })); // valid session in another flow
    stubAdapter(() => ({
      status: 401,
      data: { errorCode: 'ERR_INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    }));

    const rejection = await api.post('/login-api', { email: 'a@b.com', password: 'x' }).catch((e) => e);

    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
    // EF-2: the unified, parsed error rides along for the UI to render
    expect(rejection.normalized).toMatchObject({
      errorCode: 'ERR_INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
      status: 401,
      fields: {},
    });
  });

  it('a 403 envelope carries the clean message without touching the session', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: '1' }));
    stubAdapter(() => ({
      status: 403,
      data: { errorCode: 'ERR_FORBIDDEN', message: 'You do not have permission to access this resource.' },
    }));

    const rejection = await api.get('/api/v1/protected').catch((e) => e);

    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
    expect(rejection.normalized).toMatchObject({
      errorCode: 'ERR_FORBIDDEN',
      message: 'You do not have permission to access this resource.',
      status: 403,
    });
  });

  it('a 400 ERR_VALIDATION with fields exposes the field map for forms', async () => {
    stubAdapter(() => ({
      status: 400,
      data: { errorCode: 'ERR_VALIDATION', message: 'Validation failed.', fields: { email: 'Invalid email' } },
    }));

    const rejection = await api.post('/api/v1/register/mentor', {}).catch((e) => e);

    expect(rejection.normalized.fields).toEqual({ email: 'Invalid email' });
  });

  it('a 500 WITHOUT refId normalizes cleanly — no reference to render', async () => {
    getAuthTokenMock.mockReturnValue(makeToken({ sub: '1' }));
    stubAdapter(() => ({
      status: 500,
      data: { errorCode: 'ERR_INTERNAL_SYSTEM', message: 'Something went wrong on our side.' },
    }));

    const rejection = await api.get('/api/v1/protected').catch((e) => e);

    expect(rejection.normalized.errorCode).toBe('ERR_INTERNAL_SYSTEM');
    expect(rejection.normalized.refId).toBeUndefined();
  });

  it('an ERR_VALIDATION envelope without a fields object still normalizes (no crash)', async () => {
    stubAdapter(() => ({ status: 400, data: { errorCode: 'ERR_VALIDATION', message: 'Validation failed.' } }));

    const rejection = await api.post('/api/v1/register/student', {}).catch((e) => e);

    expect(rejection.normalized.errorCode).toBe('ERR_VALIDATION');
    expect(rejection.normalized.fields).toEqual({});
    expect(rejection.normalized.message).toBe('Validation failed.');
  });
});
