import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  normalizeApiBaseUrl,
  normalizeChatbotUrl,
} from '../envValidation';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadConfigModule() {
  vi.stubEnv('VITE_API_BASE_URL', 'https://unit-test-api.example.com/');
  vi.stubEnv('VITE_CHATBOT_API_URL', 'https://unit-test-chat.example.com/chat');
  vi.resetModules();
  return import('../env');
}

describe('normalizeApiBaseUrl', () => {
  it('uses the development fallback when the variable is missing in dev', () => {
    expect(normalizeApiBaseUrl(undefined, { isProduction: false })).toBe(
      'http://localhost:8080',
    );
  });

  it('treats a whitespace-only value as missing', () => {
    expect(normalizeApiBaseUrl('   ', { isProduction: false })).toBe('http://localhost:8080');
  });

  it('treats an empty value as missing in development', () => {
    expect(normalizeApiBaseUrl('', { isProduction: false })).toBe('http://localhost:8080');
  });

  it('fails a production build when VITE_API_BASE_URL is missing', () => {
    expect(() => normalizeApiBaseUrl(undefined, { isProduction: true })).toThrow(
      /Missing required environment variable "VITE_API_BASE_URL"/,
    );
  });

  it('rejects an empty production value instead of using the development fallback', () => {
    expect(() => normalizeApiBaseUrl('', { isProduction: true })).toThrow(
      /Missing required environment variable "VITE_API_BASE_URL"/,
    );
  });

  it('uses a configured development URL instead of the fallback', () => {
    expect(normalizeApiBaseUrl('https://dev-api.example.com/', { isProduction: false })).toBe(
      'https://dev-api.example.com',
    );
  });

  it('rejects a malformed configured value instead of using the fallback', () => {
    expect(() => normalizeApiBaseUrl('not-a-url', { isProduction: false })).toThrow(
      /"VITE_API_BASE_URL" must be a valid absolute URL/,
    );
  });

  it('normalises trailing slashes and surrounding whitespace', () => {
    expect(normalizeApiBaseUrl('  https://api.example.com/  ', { isProduction: true })).toBe(
      'https://api.example.com',
    );
    expect(
      normalizeApiBaseUrl('https://api.example.com/api/v1///', { isProduction: true }),
    ).toBe('https://api.example.com/api/v1');
  });

  it('accepts http and a host with a port', () => {
    expect(normalizeApiBaseUrl('http://10.0.0.5:8080', { isProduction: true })).toBe(
      'http://10.0.0.5:8080',
    );
  });

  it('rejects a value that is not an absolute URL', () => {
    expect(() => normalizeApiBaseUrl('api.example.com', { isProduction: true })).toThrow(
      /must be a valid absolute URL/,
    );
  });

  it('rejects relative URLs', () => {
    expect(() => normalizeApiBaseUrl('/api', { isProduction: false })).toThrow(
      /"VITE_API_BASE_URL" must be a valid absolute URL/,
    );
  });

  it.each(['javascript:alert(1)', 'ftp://api.example.com'])(
    'rejects unsupported protocol in %s',
    (url) => {
      expect(() => normalizeApiBaseUrl(url, { isProduction: false })).toThrow(
        /"VITE_API_BASE_URL" must use the http:\/\/ or https:\/\/ protocol/,
      );
    },
  );

  it('does not expose malformed values in validation errors', () => {
    let thrown: unknown;
    try {
      normalizeApiBaseUrl('not-a-url-private-config', { isProduction: false });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    if (!(thrown instanceof Error)) throw new Error('Expected invalid URL validation to throw');
    expect(thrown.message).toContain('VITE_API_BASE_URL');
    expect(thrown.message).not.toContain('not-a-url-private-config');
  });

  it('rejects embedded credentials', () => {
    expect(() =>
      normalizeApiBaseUrl('https://user:pass@api.example.com', { isProduction: true }),
    ).toThrow(/must not contain credentials/);
  });

  it('rejects query strings and hashes', () => {
    expect(() => normalizeApiBaseUrl('https://api.example.com?x=1', { isProduction: true })).toThrow(
      /must not contain a query string or hash/,
    );
    expect(() => normalizeApiBaseUrl('https://api.example.com#top', { isProduction: true })).toThrow(
      /must not contain a query string or hash/,
    );
  });

  it.each(['localhost', '127.0.0.1', '0.0.0.0'])(
    'rejects %s in a production build',
    (host) => {
      expect(() => normalizeApiBaseUrl(`http://${host}:8080`, { isProduction: true })).toThrow(
        /must not point to a local host/,
      );
    },
  );

  it('allows a local host in development', () => {
    expect(normalizeApiBaseUrl('http://localhost:8080', { isProduction: false })).toBe(
      'http://localhost:8080',
    );
  });
});

describe('normalizeChatbotUrl', () => {
  it('returns an empty string when the optional URL is missing in production', () => {
    expect(normalizeChatbotUrl(undefined, { isProduction: true })).toBe('');
  });

  it('uses the development fallback when the URL is missing in dev', () => {
    expect(normalizeChatbotUrl(undefined, { isProduction: false })).toBe(
      'http://127.0.0.1:8000/chat',
    );
  });

  it('normalises a valid URL and strips trailing slashes', () => {
    expect(normalizeChatbotUrl('https://chat.example.com/chat/', { isProduction: true })).toBe(
      'https://chat.example.com/chat',
    );
  });

  it('still validates an invalid value in production', () => {
    expect(() => normalizeChatbotUrl('not-a-url', { isProduction: true })).toThrow(
      /must be a valid absolute URL/,
    );
  });

  it('rejects a local host in production', () => {
    expect(() =>
      normalizeChatbotUrl('http://localhost:8000/chat', { isProduction: true }),
    ).toThrow(/must not point to a local host/);
  });
});

describe('module constants', () => {
  it('exports normalized constants and a typed centralized configuration object', async () => {
    const { API_BASE_URL, CHATBOT_API_URL, appConfig } = await loadConfigModule();

    expect(API_BASE_URL).toBe('https://unit-test-api.example.com');
    expect(CHATBOT_API_URL).toBe('https://unit-test-chat.example.com/chat');
    expect(appConfig.apiBaseUrl).toBe(API_BASE_URL);
    expect(appConfig.chatbotApiUrl).toBe(CHATBOT_API_URL);
    expect(typeof appConfig.isProduction).toBe('boolean');
    expect(typeof appConfig.isDevelopment).toBe('boolean');
  });

  it('exposes an absolute API base URL without a trailing slash', async () => {
    const { API_BASE_URL } = await loadConfigModule();

    expect(API_BASE_URL).toMatch(/^https?:\/\/[^/]+/);
    expect(API_BASE_URL.endsWith('/')).toBe(false);
  });

  it('exposes the chatbot URL as a string', async () => {
    const { CHATBOT_API_URL } = await loadConfigModule();

    expect(typeof CHATBOT_API_URL).toBe('string');
  });
});

describe('getAssetUrl', () => {
  it.each([undefined, null, '', '   '])('returns undefined for %j', async (value) => {
    const { getAssetUrl } = await loadConfigModule();
    expect(getAssetUrl(value)).toBeUndefined();
  });

  it('leaves absolute and inline URLs untouched', async () => {
    const { getAssetUrl } = await loadConfigModule();
    expect(getAssetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(getAssetUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(getAssetUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc');
  });

  it('resolves a root-relative path against the API origin', async () => {
    const { getAssetUrl } = await loadConfigModule();
    expect(getAssetUrl('/uploads/a.png')).toBe('https://unit-test-api.example.com/uploads/a.png');
  });

  it('resolves a bare relative path against the API origin', async () => {
    const { getAssetUrl } = await loadConfigModule();
    expect(getAssetUrl('uploads/a.png')).toBe('https://unit-test-api.example.com/uploads/a.png');
  });

  it('trims surrounding whitespace', async () => {
    const { getAssetUrl } = await loadConfigModule();
    expect(getAssetUrl('  /uploads/a.png  ')).toBe('https://unit-test-api.example.com/uploads/a.png');
  });
});
