/**
 * 401 interceptor + public-auth-path matching tests (FE-008 / EF-25).
 *
 * The session engine is mocked so the interceptor's contract is tested in
 * isolation: single retry with the rotated token, endSession on
 * rejected/ambiguous, pass-through on throttled/unavailable, and exact
 * matching of the login-api endpoints (logout-all keeps its Bearer).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const refreshAccessToken = vi.fn();
const endSession = vi.fn();

vi.mock('../authSession', () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessToken(...args),
  endSession: (...args: unknown[]) => endSession(...args),
}));

const getAuthToken = vi.fn(() => '');

vi.mock('../../store/authStore', () => ({
  getAuthToken: () => getAuthToken(),
}));

import api from '../api';

type AdapterResponse = { status: number; data?: unknown };

/** Swaps the axios adapter for a scripted one; returns the captured requests. */
function scriptAdapter(responses: AdapterResponse[]): InternalAxiosRequestConfig[] {
  const captured: InternalAxiosRequestConfig[] = [];
  api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    captured.push(config);
    const next = responses.shift();
    if (!next) throw new Error('unexpected extra request');
    const response = {
      data: next.data ?? {},
      status: next.status,
      statusText: '',
      config,
      headers: {},
    };
    if (next.status >= 400) {
      // A custom adapter bypasses axios's settle(): rejection must be
      // produced here for non-2xx statuses, with the response attached.
      const error = new AxiosError(`Request failed with status ${next.status}`, 'ERR_BAD_REQUEST', config);
      error.response = response;
      return Promise.reject(error);
    }
    return Promise.resolve(response);
  }) as never;
  return captured;
}

function authHeader(config: InternalAxiosRequestConfig): unknown {
  const headers = config.headers as unknown as {
    get?: (k: string) => unknown;
    Authorization?: unknown;
  };
  return headers.get?.('Authorization') ?? headers.Authorization;
}

beforeEach(() => {
  getAuthToken.mockReset();
  refreshAccessToken.mockReset();
  endSession.mockReset();
  api.defaults.adapter = undefined as never;
});

describe('login-api endpoint matching is exact', () => {
  it('login-api/refresh and login-api/logout carry no Bearer', async () => {
    getAuthToken.mockReturnValue('raw.jwt.value');
    const captured = scriptAdapter([{ status: 200 }, { status: 200 }]);

    await api.post('/login-api/refresh', { refreshToken: 'rt' });
    await api.post('/login-api/logout', { refreshToken: 'rt' });

    expect(authHeader(captured[0])).toBeUndefined();
    expect(authHeader(captured[1])).toBeUndefined();
  });

  it('login-api/logout-all is protected and carries its Bearer token', async () => {
    getAuthToken.mockReturnValue('raw.jwt.value');
    const captured = scriptAdapter([{ status: 200 }]);

    await api.post('/login-api/logout-all');

    expect(authHeader(captured[0])).toBe('Bearer raw.jwt.value');
  });
});

describe('401 response interceptor — silent refresh + single retry', () => {
  it('refreshes once and retries with the rotated token', async () => {
    getAuthToken.mockReturnValueOnce('at1').mockReturnValue('at2');
    refreshAccessToken.mockResolvedValue({
      kind: 'refreshed',
      token: 'at2',
      refreshToken: 'rt2',
    });
    const captured = scriptAdapter([{ status: 401 }, { status: 200 }]);

    const response = await api.get('/api/v1/protected');

    expect(response.status).toBe(200);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(refreshAccessToken).toHaveBeenCalledWith('at1'); // the failed token
    expect(captured).toHaveLength(2);
    expect(authHeader(captured[1])).toBe('Bearer at2');
  });

  it("does not retry a request twice (no refresh loop)", async () => {
    getAuthToken.mockReturnValue('at1');
    refreshAccessToken.mockResolvedValue({
      kind: 'refreshed',
      token: 'at2',
      refreshToken: 'rt2',
    });
    scriptAdapter([{ status: 401 }, { status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("ends the session on 'rejected' and passes the 401 through", async () => {
    getAuthToken.mockReturnValue('at1');
    refreshAccessToken.mockResolvedValue({ kind: 'rejected' });
    scriptAdapter([{ status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(endSession).toHaveBeenCalledTimes(1);
  });

  it("ends the session on 'ambiguous' (unrecoverable rotation state)", async () => {
    getAuthToken.mockReturnValue('at1');
    refreshAccessToken.mockResolvedValue({ kind: 'ambiguous' });
    scriptAdapter([{ status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(endSession).toHaveBeenCalledTimes(1);
  });

  it("passes 401 through without clearing anything on 'throttled'", async () => {
    getAuthToken.mockReturnValue('at1');
    refreshAccessToken.mockResolvedValue({ kind: 'throttled' });
    scriptAdapter([{ status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(endSession).not.toHaveBeenCalled();
  });

  it('never triggers the refresh path for public auth endpoints', async () => {
    getAuthToken.mockReturnValue('');
    refreshAccessToken.mockResolvedValue({ kind: 'refreshed', token: 'x', refreshToken: 'y' });
    scriptAdapter([{ status: 401 }]);

    await expect(api.post('/login-api', { email: 'a@b.com' })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(endSession).not.toHaveBeenCalled();
  });
});
