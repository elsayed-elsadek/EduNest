/**
 * FE-008 — session lifecycle behaviour of the shared axios instance:
 * one 401 handler, no 401 storm, dead tokens rejected before hitting the wire.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

const { getAuthTokenMock, handleSessionExpiredMock } = vi.hoisted(() => ({
  getAuthTokenMock: vi.fn(() => ''),
  handleSessionExpiredMock: vi.fn(),
}));

vi.mock('../../store/authStore', () => ({
  getAuthToken: () => getAuthTokenMock(),
  handleSessionExpired: () => handleSessionExpiredMock(),
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

/** Adapter that answers every request with the given status and counts calls. */
function stubAdapter(status: number): { calls: number } {
  const state = { calls: 0 };
  api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    state.calls += 1;
    return Promise.reject(
      Object.assign(new Error('Request failed'), {
        code: 'ERR_BAD_REQUEST',
        config,
        response: { status, statusText: 'Error', data: {}, headers: {}, config },
      })
    );
  }) as never;
  return state;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  getAuthTokenMock.mockReset().mockReturnValue('');
  handleSessionExpiredMock.mockClear();
  api.defaults.adapter = undefined as never;
});

afterEach(() => {
  api.defaults.adapter = undefined as never;
  vi.restoreAllMocks();
});

describe('api — session lifecycle (FE-008)', () => {
  it('a 401 on a protected endpoint triggers the session-expired handler once per request', async () => {
    stubAdapter(401);
    getAuthTokenMock.mockReturnValue(makeToken({ exp: Math.floor(Date.now() / 1000) + 600 }));

    await expect(api.get('/api/v1/protected')).rejects.toBeDefined();

    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('a 401 on a public auth path does not clear the session', async () => {
    stubAdapter(401);

    await expect(api.post('/login-api', { email: 'a@b.com', password: 'x' })).rejects.toBeDefined();

    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('non-401 errors keep the session', async () => {
    stubAdapter(500);

    await expect(api.get('/api/v1/protected')).rejects.toBeDefined();

    expect(handleSessionExpiredMock).not.toHaveBeenCalled();
  });

  it('an expired token is rejected locally without a network call', async () => {
    const adapter = stubAdapter(200);
    getAuthTokenMock.mockReturnValue(
      makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 })
    );

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });

    expect(adapter.calls).toBe(0);
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });

  it('a malformed token is rejected locally as unauthenticated', async () => {
    const adapter = stubAdapter(200);
    getAuthTokenMock.mockReturnValue('garbage');

    await expect(api.get('/api/v1/protected')).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });

    expect(adapter.calls).toBe(0);
    expect(handleSessionExpiredMock).toHaveBeenCalledTimes(1);
  });
});
