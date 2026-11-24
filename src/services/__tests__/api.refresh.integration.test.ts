import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import api from '../api';
import {
  clearAuthWithoutRedirect,
  getAuthGeneration,
  getStoredAuth,
  resetSessionExpiredGuard,
  useAuthStore,
} from '../../store/authStore';

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

  it('does not send queued protected requests with a token cleared during refresh', async () => {
    const expiredToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 60 });
    const rotatedToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setAuth({ token: expiredToken, refreshToken: 'refresh-before' });

    let releaseFetch!: (value: {
      ok: boolean;
      status: number;
      headers: { get: () => null };
      json: () => Promise<unknown>;
    }) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<{
          ok: boolean;
          status: number;
          headers: { get: () => null };
          json: () => Promise<unknown>;
        }>((resolve) => {
          releaseFetch = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const sentAuthorization: string[] = [];
    api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
      const authorization = config.headers.Authorization;
      if (typeof authorization === 'string') sentAuthorization.push(authorization);
      return Promise.resolve({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config });
    }) as never;

    const firstRequest = api.get('/api/v1/protected-one');
    const secondRequest = api.get('/api/v1/protected-two');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    clearAuthWithoutRedirect();
    releaseFetch({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ apiResponse: { jwt: rotatedToken, refreshToken: 'refresh-after' } }),
    });

    const results = await Promise.allSettled([firstRequest, secondRequest]);
    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(sentAuthorization).toEqual([]);
    expect(useAuthStore.getState()).toMatchObject({ token: '', refreshToken: '', isAuthenticated: false });
  });

  it('a late 401 from a cleared session does not expire the current auth state', async () => {
    const accessToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    useAuthStore.getState().setAuth({ token: accessToken, refreshToken: 'rt-cleanup' });

    let requestConfig!: InternalAxiosRequestConfig;
    let rejectRequest!: (reason: unknown) => void;
    api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
      requestConfig = config;
      return new Promise((_resolve, reject) => {
        rejectRequest = reject;
      });
    }) as never;

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = api.get('/api/v1/protected-stale-401');
    await vi.waitFor(() => expect(requestConfig).toBeDefined());

    clearAuthWithoutRedirect();
    const generationAfterCleanup = getAuthGeneration();

    rejectRequest(
      Object.assign(new Error('Request failed with status code 401'), {
        code: 'ERR_BAD_REQUEST',
        config: requestConfig,
        response: { status: 401, statusText: 'Unauthorized', headers: {}, config: requestConfig, data: {} },
      })
    );

    await expect(request).rejects.toMatchObject({ response: { status: 401 } });
    // No refresh attempt and no session-expiry side effect (handleSessionExpired
    // clears auth, which would bump the generation again).
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getAuthGeneration()).toBe(generationAfterCleanup);
    expect(useAuthStore.getState()).toMatchObject({ token: '', isAuthenticated: false });
    expect(getStoredAuth()).toEqual({ token: '', refreshToken: '' });
  });

  it('a genuine current-session 401 still refreshes and replays with the rotated token', async () => {
    const accessToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 });
    const rotatedToken = makeToken({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 7200 });
    useAuthStore.getState().setAuth({ token: accessToken, refreshToken: 'rt-current' });

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({ apiResponse: { jwt: rotatedToken, refreshToken: 'rt-current-next' } }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const seenAuthorization: string[] = [];
    api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
      const authorization = config.headers.Authorization;
      if (typeof authorization === 'string') seenAuthorization.push(authorization);
      if (seenAuthorization.length === 1) {
        return Promise.reject(
          Object.assign(new Error('Request failed with status code 401'), {
            code: 'ERR_BAD_REQUEST',
            config,
            response: { status: 401, statusText: 'Unauthorized', headers: {}, config, data: {} },
          })
        );
      }
      return Promise.resolve({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config });
    }) as never;

    const response = await api.get('/api/v1/protected-current');

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(seenAuthorization).toEqual([`Bearer ${accessToken}`, `Bearer ${rotatedToken}`]);
    expect(useAuthStore.getState()).toMatchObject({
      token: rotatedToken,
      refreshToken: 'rt-current-next',
      isAuthenticated: true,
    });
  });
});
