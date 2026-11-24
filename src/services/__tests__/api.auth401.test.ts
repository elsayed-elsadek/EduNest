/**
 * Protected 401 behavior for the shared Axios client (FE-008 / FE-027).
 * The refresh transport is mocked here; real rotation + replay are covered by
 * api.refresh.integration.test.ts and authRefresh.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const { getAuthTokenMock, handleSessionExpiredMock, refreshAccessTokenMock, getAuthGenerationMock } = vi.hoisted(() => ({
  getAuthTokenMock: vi.fn(() => ''),
  handleSessionExpiredMock: vi.fn(),
  refreshAccessTokenMock: vi.fn(),
  getAuthGenerationMock: vi.fn(() => 0),
}));

vi.mock('../../store/authStore', () => ({
  getAuthToken: () => getAuthTokenMock(),
  getAuthGeneration: () => getAuthGenerationMock(),
  handleSessionExpired: (...args: unknown[]) => handleSessionExpiredMock(...args),
}));

vi.mock('../authRefresh', () => ({
  refreshAccessToken: (...args: unknown[]) => refreshAccessTokenMock(...args),
}));

import api from '../api';

type AdapterResponse = { status: number; data?: unknown };

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(sub: string): string {
  return `${toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${toBase64Url(
    JSON.stringify({ sub })
  )}.signature`;
}

const accessToken1 = makeToken('user-1');
const accessToken2 = makeToken('user-1-rotated');

/** Swaps the axios adapter for scripted responses and captures dispatched configs. */
function scriptAdapter(responses: AdapterResponse[]): InternalAxiosRequestConfig[] {
  const captured: InternalAxiosRequestConfig[] = [];
  api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    captured.push(config);
    const next = responses.shift();
    if (!next) throw new Error('unexpected extra request');
    const response = { data: next.data ?? {}, status: next.status, statusText: '', config, headers: {} };
    if (next.status >= 400) {
      const error = new AxiosError(`Request failed with status ${next.status}`, 'ERR_BAD_REQUEST', config);
      error.response = response;
      return Promise.reject(error);
    }
    return Promise.resolve(response);
  }) as never;
  return captured;
}

function authHeader(config: InternalAxiosRequestConfig): unknown {
  const headers = config.headers as unknown as { get?: (key: string) => unknown; Authorization?: unknown };
  return headers.get?.('Authorization') ?? headers.Authorization;
}

beforeEach(() => {
  getAuthTokenMock.mockReset().mockReturnValue('');
  getAuthGenerationMock.mockReset().mockReturnValue(0);
  handleSessionExpiredMock.mockClear();
  refreshAccessTokenMock.mockReset();
  api.defaults.adapter = undefined as never;
});

describe('login-api endpoint matching is exact', () => {
  it('login-api/refresh and login-api/logout carry no Bearer', async () => {
    getAuthTokenMock.mockReturnValue(accessToken1);
    const captured = scriptAdapter([{ status: 200 }, { status: 200 }]);

    await api.post('/login-api/refresh', { refreshToken: 'rt' });
    await api.post('/login-api/logout', { refreshToken: 'rt' });

    expect(authHeader(captured[0])).toBeUndefined();
    expect(authHeader(captured[1])).toBeUndefined();
  });

  it('login-api/logout-all is protected and carries its Bearer token', async () => {
    getAuthTokenMock.mockReturnValue(accessToken1);
    const captured = scriptAdapter([{ status: 200 }]);

    await api.post('/login-api/logout-all');

    expect(authHeader(captured[0])).toBe(`Bearer ${accessToken1}`);
  });
});

describe('401 response interceptor — silent refresh + single retry', () => {
  it('refreshes once and retries with the rotated token', async () => {
    getAuthTokenMock.mockReturnValueOnce(accessToken1).mockReturnValue(accessToken2);
    refreshAccessTokenMock.mockResolvedValue(accessToken2);
    const captured = scriptAdapter([{ status: 401 }, { status: 200 }]);

    const response = await api.get('/api/v1/protected');

    expect(response.status).toBe(200);
    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(refreshAccessTokenMock).toHaveBeenCalledWith(accessToken1);
    expect(captured).toHaveLength(2);
    expect(authHeader(captured[1])).toBe(`Bearer ${accessToken2}`);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('does not refresh or expire a request sent under an older auth generation', async () => {
    getAuthTokenMock.mockReturnValue(accessToken1);
    // Sent under generation 0, then the 401 is handled under generation 1
    // (an explicit cleanup or a newer login happened meanwhile).
    getAuthGenerationMock.mockReturnValueOnce(0).mockReturnValue(1);
    scriptAdapter([{ status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('does not retry a request twice; the second 401 ends the session once', async () => {
    getAuthTokenMock.mockReturnValue(accessToken1);
    refreshAccessTokenMock.mockResolvedValue(accessToken2);
    scriptAdapter([{ status: 401 }, { status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('does not attempt another refresh when refresh itself fails', async () => {
    getAuthTokenMock.mockReturnValue(accessToken1);
    refreshAccessTokenMock.mockRejectedValue(Object.assign(new Error('refresh rejected'), { code: 'SESSION_EXPIRED' }));
    scriptAdapter([{ status: 401 }]);

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(refreshAccessTokenMock).toHaveBeenCalledTimes(1);
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('never triggers refresh or session expiry for public auth endpoints', async () => {
    getAuthTokenMock.mockReturnValue(accessToken1);
    scriptAdapter([{ status: 401 }]);

    await expect(api.post('/login-api', { email: 'a@b.com' })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });
});
