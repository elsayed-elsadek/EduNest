import { describe, expect, it } from 'vitest';
import { getDashboardPath, getSafeRedirectPath } from '../routeUtils';

describe('route helpers', () => {
  it('maps recognized roles to one canonical dashboard path', () => {
    expect(getDashboardPath('ROLE_STUDENT')).toBe('/student/dashboard');
    expect(getDashboardPath('ROLE_MENTOR')).toBe('/mentor/dashboard');
    expect(getDashboardPath('ROLE_ADMIN')).toBe('/admin/dashboard');
    expect(getDashboardPath('ROLE_UNKNOWN')).toBeNull();
  });

  it('preserves same-origin internal deep links including query and hash', () => {
    expect(
      getSafeRedirectPath({ pathname: '/admin/users', search: '?page=2', hash: '#active' }),
    ).toBe('/admin/users?page=2#active');
  });

  it.each([
    'https://evil.example/steal',
    '//evil.example/steal',
    '/\\evil.example/steal',
    'javascript:alert(1)',
  ])('rejects unsafe redirect pathname %s', (pathname) => {
    expect(getSafeRedirectPath({ pathname })).toBeNull();
  });

  it('rejects malformed or absent location state', () => {
    expect(getSafeRedirectPath(null)).toBeNull();
    expect(getSafeRedirectPath({ pathname: '/admin', search: 'page=2' })).toBeNull();
  });
});
