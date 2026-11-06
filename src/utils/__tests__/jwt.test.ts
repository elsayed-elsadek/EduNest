import { describe, expect, it } from 'vitest';
import {
  decodeToken,
  getFirstNameFromToken,
  getFirstNameFromUser,
  getRoleFromToken,
  getUserFromToken,
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
