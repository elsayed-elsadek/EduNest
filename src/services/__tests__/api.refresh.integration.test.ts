import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import api from '../api';
import { resetSessionExpiredGuard, useAuthStore } from '../../store/authStore';

function encodeBase64Url(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: Record<string, unknown>): string {
  return `${encodeBase64Url({ alg: 'HS256', typ: 'JWT' })}.${encodeBase64Url(payload)}.signature`;
}

describe('api — real request-driven refresh integration (FE-008)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    resetSessionExpiredGuard();
    useAuthStore.getState().clearAuth();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    api.defaults.adapter = undefined as never;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('rotates an expired token, persists the pair, and sends the protected request with the new Bearer token', async () => {
    const expiredToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 60 });
    const rotatedToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setAuth({ token: expiredToken, refreshToken: 'refresh-before' });

    const fetchMock = vi.fn(async (...args: [RequestInfo | URL, RequestInit?]) => {
      void args;
      return {
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({ apiResponse: { jwt: rotatedToken, refreshToken: 'refresh-after' } }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const sentAuthorization: string[] = [];
    api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
      const authorization = config.headers.Authorization;
      if (typeof authorization === 'string') sentAuthorization.push(authorization);
      return Promise.resolve({
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }) as never;

    const response = await api.get('/api/v1/protected-resource');

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/login-api/refresh');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1] && (fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({
      refreshToken: 'refresh-before',
    });
    expect(sentAuthorization).toEqual([`Bearer ${rotatedToken}`]);
    expect(useAuthStore.getState()).toMatchObject({
      token: rotatedToken,
      refreshToken: 'refresh-after',
      isAuthenticated: true,
    });
  });
});
