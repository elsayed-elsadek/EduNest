import { describe, expect, it } from 'vitest';
import {
  decodeToken,
  getFirstNameFromToken,
  getFirstNameFromUser,
  getRoleFromToken,
  getTokenExpiration,
  getUserFromToken,
  isTokenValid,
} from '../jwt';

/** Base64URL-encodes a UTF-8 string (JWT segments are UTF-8, not Latin-1). */
function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('decodeToken', () => {
  it('returns the payload of a well-formed JWT', () => {
    const token = makeToken({ sub: '42', authorities: ['ROLE_STUDENT'] });

    expect(decodeToken(token)).toMatchObject({ sub: '42', authorities: ['ROLE_STUDENT'] });
  });

  it('decodes UTF-8 payload values without corrupting them', () => {
    const token = makeToken({ fullName: 'أحمد علي' });

    expect(decodeToken(token)).toEqual({ fullName: 'أحمد علي' });
  });

  it.each([
    ['an empty string', ''],
    ['a token with the wrong number of segments', 'not-a-token'],
    ['a token with two segments', 'header.payload'],
    ['a segment that is not valid base64', 'header.!!!.signature'],
    ['a payload that is not JSON', `${toBase64Url('{}')}.${toBase64Url('not json')}.signature`],
  ])('returns null for %s', (_label, token) => {
    expect(decodeToken(token)).toBeNull();
  });
});

describe('getFirstNameFromToken', () => {
  it('reads firstName and keeps only the first word', () => {
    expect(getFirstNameFromToken(makeToken({ firstName: 'Sara Ahmed' }))).toBe('Sara');
  });

  it.each(['first_name', 'name', 'fullName', 'full_name'])(
    'falls back to the "%s" claim',
    (claim) => {
      expect(getFirstNameFromToken(makeToken({ [claim]: 'Mona' }))).toBe('Mona');
    },
  );

  it('prefers firstName over the other name claims', () => {
    const token = makeToken({ firstName: 'Nour', name: 'Someone Else' });

    expect(getFirstNameFromToken(token)).toBe('Nour');
  });

  it('returns an empty string when the token is invalid', () => {
    expect(getFirstNameFromToken('broken')).toBe('');
  });
});

describe('getRoleFromToken', () => {
  it('reads a string authorities claim', () => {
    expect(getRoleFromToken(makeToken({ authorities: 'ROLE_MENTOR' }))).toBe('ROLE_MENTOR');
  });

  it('reads the first entry of an array authorities claim', () => {
    expect(getRoleFromToken(makeToken({ authorities: ['ROLE_ADMIN', 'ROLE_STUDENT'] }))).toBe(
      'ROLE_ADMIN',
    );
  });

  it('falls back to role, userRole and authority claims', () => {
    expect(getRoleFromToken(makeToken({ role: 'ROLE_STUDENT' }))).toBe('ROLE_STUDENT');
    expect(getRoleFromToken(makeToken({ userRole: 'ROLE_MENTOR' }))).toBe('ROLE_MENTOR');
    expect(getRoleFromToken(makeToken({ authority: 'ROLE_ADMIN' }))).toBe('ROLE_ADMIN');
  });

  it('returns an empty string when no role claim is present', () => {
    expect(getRoleFromToken(makeToken({ sub: '1' }))).toBe('');
    expect(getRoleFromToken('broken')).toBe('');
  });
});

describe('getUserFromToken', () => {
  it('builds the user from username, fullName and authorities', () => {
    const token = makeToken({
      username: 'sara@example.com',
      fullName: 'Sara Ali',
      authorities: ['ROLE_STUDENT'],
    });

    expect(getUserFromToken(token)).toEqual({
      username: 'sara@example.com',
      fullName: 'Sara Ali',
      role: 'ROLE_STUDENT',
      email: 'sara@example.com',
    });
  });

  it('falls back to sub and name, and hides non-email usernames', () => {
    const token = makeToken({ sub: '42', name: 'Omar' });

    expect(getUserFromToken(token)).toEqual({
      username: '42',
      fullName: 'Omar',
      role: '',
      email: undefined,
    });
  });

  it('returns null for an invalid token', () => {
    expect(getUserFromToken('broken')).toBeNull();
  });
});

describe('getTokenExpiration (FE-008)', () => {
  it('returns the exp claim in milliseconds', () => {
    expect(getTokenExpiration(makeToken({ exp: 1700000 }))).toBe(1_700_000_000);
  });

  it('accepts a string-encoded exp', () => {
    expect(getTokenExpiration(makeToken({ exp: '1700000' }))).toBe(1_700_000_000);
  });

  it('returns null when there is no exp claim', () => {
    expect(getTokenExpiration(makeToken({ sub: '1' }))).toBeNull();
  });

  it('returns null for a malformed token', () => {
    expect(getTokenExpiration('broken')).toBeNull();
  });
});

describe('isTokenValid (FE-008)', () => {
  it('accepts a token that expires in the future', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;

    expect(isTokenValid(makeToken({ exp: future }))).toBe(true);
  });

  it('rejects a token that expired outside the clock-skew window', () => {
    const past = Math.floor(Date.now() / 1000) - 120;

    expect(isTokenValid(makeToken({ exp: past }))).toBe(false);
  });

  it('tolerates a token that expired within the skew window', () => {
    const justPast = Math.floor(Date.now() / 1000) - 5;

    expect(isTokenValid(makeToken({ exp: justPast }))).toBe(true);
  });

  it('treats a token without an exp claim as structurally valid (defer to 401s)', () => {
    expect(isTokenValid(makeToken({ sub: '1' }))).toBe(true);
  });

  it.each([
    ['an empty string', ''],
    ['a non-JWT string', 'garbage'],
    ['a two-segment string', 'header.payload'],
    ['a payload that is not JSON', `${toBase64Url('{}')}.${toBase64Url('nope')}.signature`],
  ])('rejects %s', (_label, token) => {
    expect(isTokenValid(token)).toBe(false);
  });
});

describe('getFirstNameFromUser', () => {
  it('returns an empty string for missing or non-object input', () => {
    expect(getFirstNameFromUser(undefined)).toBe('');
    expect(getFirstNameFromUser(null as unknown as Record<string, unknown>)).toBe('');
  });

  it('reads the common name fields and keeps only the first word', () => {
    expect(getFirstNameFromUser({ firstName: 'Lina Hassan' })).toBe('Lina');
    expect(getFirstNameFromUser({ first_name: 'Lina' })).toBe('Lina');
    expect(getFirstNameFromUser({ name: 'Lina' })).toBe('Lina');
    expect(getFirstNameFromUser({ full_name: 'Lina' })).toBe('Lina');
  });

  it('returns an empty string when no name field exists', () => {
    expect(getFirstNameFromUser({ id: 1 })).toBe('');
  });
});
