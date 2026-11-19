import { describe, expect, it } from 'vitest';
import { isAccessTokenExpired } from '../jwt';

/** Builds a minimal unsigned JWT with the given payload (client-side decode only). */
function makeToken(payload: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.sig`;
}

describe('isAccessTokenExpired', () => {
  it('returns false for a token with a future exp', () => {
    const token = makeToken({ sub: 'u', exp: Math.floor(Date.now() / 1000) + 600 });
    expect(isAccessTokenExpired(token)).toBe(false);
  });

  it('returns true for a token whose exp has passed', () => {
    const token = makeToken({ sub: 'u', exp: Math.floor(Date.now() / 1000) - 600 });
    expect(isAccessTokenExpired(token)).toBe(true);
  });

  it('treats a token inside the clock-skew window as expired', () => {
    // exp 10s ahead is inside the default 30s skew → not presented to the backend
    const token = makeToken({ sub: 'u', exp: Math.floor(Date.now() / 1000) + 10 });
    expect(isAccessTokenExpired(token)).toBe(true);
  });

  it('accepts a custom skew of zero for exact-expiry checks', () => {
    const future = Math.floor(Date.now() / 1000) + 120;
    const token = makeToken({ sub: 'u', exp: future });
    expect(isAccessTokenExpired(token, 0)).toBe(false);
  });

  it('returns true for a malformed token', () => {
    expect(isAccessTokenExpired('not-a-jwt')).toBe(true);
    expect(isAccessTokenExpired('')).toBe(true);
  });

  it('returns true when the payload has no exp claim', () => {
    const token = makeToken({ sub: 'u' });
    expect(isAccessTokenExpired(token)).toBe(true);
  });
});
