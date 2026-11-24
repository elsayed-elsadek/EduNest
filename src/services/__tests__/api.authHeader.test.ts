import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

const getAuthToken = vi.fn(() => '');
const handleSessionExpired = vi.fn();

vi.mock('../../store/authStore', () => ({
  getAuthToken: () => getAuthToken(),
  getAuthGeneration: () => 0,
  handleSessionExpired: () => handleSessionExpired(),
  // FE-027 exports consumed by authRefresh.ts (loaded via api.ts's import chain)
  getStoredAuth: () => ({ token: '', refreshToken: '' }),
  notifyAuthPeers: () => undefined,
}));

import api from '../api';

/** Base64URL-encodes a UTF-8 string. */
function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** FE-008: request-interceptor validation requires a well-formed JWT. */
function makeToken(payload: Record<string, unknown>): string {
  return [
    toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
    toBase64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
}

const VALID_TOKEN = makeToken({ sub: '1' }); // no exp claim → structurally valid

/**
 * Captures the request config the interceptor produced by swapping the
 * axios adapter for a stub.
 */
async function capturedConfig(
  request: () => Promise<unknown>
): Promise<InternalAxiosRequestConfig> {
  let captured: InternalAxiosRequestConfig | undefined;
  api.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    captured = config;
    return Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      config,
      headers: {},
    });
  }) as never;

  try {
    await request();
  } finally {
    api.defaults.adapter = undefined as never;
  }

  expect(captured).toBeDefined();
  return captured as InternalAxiosRequestConfig;
}

function authHeader(config: InternalAxiosRequestConfig): unknown {
  const headers = config.headers as unknown as {
    get?: (k: string) => unknown;
    Authorization?: unknown;
  };
  return headers.get?.('Authorization') ?? headers.Authorization;
}

describe('api request interceptor — Authorization header contract', () => {
  beforeEach(() => {
    getAuthToken.mockReset();
    getAuthToken.mockReturnValue('');
    handleSessionExpired.mockClear();
  });

  it('sends `Authorization: Bearer <jwt>` on protected requests', async () => {
    getAuthToken.mockReturnValue(VALID_TOKEN);

    const config = await capturedConfig(() => api.get('/api/v1/some-protected-resource'));

    expect(authHeader(config)).toBe(`Bearer ${VALID_TOKEN}`);
  });

  it('sends no Authorization header on public auth paths (login)', async () => {
    getAuthToken.mockReturnValue(VALID_TOKEN);

    const config = await capturedConfig(() => api.post('/login-api', { email: 'a@b.com', password: 'x' }));

    expect(authHeader(config)).toBeUndefined();
  });

  it('sends no Authorization header on public auth paths (password reset)', async () => {
    getAuthToken.mockReturnValue('');

    const config = await capturedConfig(() =>
      api.post('/forget-password/reset', { email: 'a@b.com', resetToken: 't', newPassword: 'x' })
    );

    expect(authHeader(config)).toBeUndefined();
  });

  it('sends no Authorization header when no token exists', async () => {
    getAuthToken.mockReturnValue('');

    const config = await capturedConfig(() => api.get('/api/v1/some-protected-resource'));

    expect(authHeader(config)).toBeUndefined();
  });

  it('does not double the Bearer prefix', async () => {
    getAuthToken.mockReturnValue(VALID_TOKEN);

    const config = await capturedConfig(() => api.get('/api/v1/another'));

    expect(String(authHeader(config))).not.toBe(`Bearer Bearer ${VALID_TOKEN}`);
    expect(String(authHeader(config)).startsWith('Bearer ')).toBe(true);
    expect(String(authHeader(config)).split('Bearer ').length - 1).toBe(1);
  });
});
