/**
 * FE-008 — auth store session lifecycle:
 * remember-me storage routing, targeted logout, one-shot session expiry
 * handler, and hydration validation/migration of legacy storage.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAuthToken,
  handleSessionExpired,
  resetSessionExpiredGuard,
  useAuthStore,
} from '../authStore';

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

const validToken = makeToken({ sub: '1' }); // no exp → structurally valid
const expiredToken = makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });

function resetStore(): void {
  useAuthStore.setState({
    token: '',
    isAuthenticated: false,
    userName: '',
    userEmail: '',
    userRole: '',
    userAvatar: '',
    lastEmail: '',
    rememberMe: false,
    isHydrated: true,
  });
}

beforeEach(async () => {
  // Flush any isHydrated timeouts scheduled by a previous test's fresh store —
  // they write the emptied state to storage asynchronously and would otherwise
  // pollute the storage seeded by this test.
  await new Promise((resolve) => setTimeout(resolve, 0));
  resetStore();
  // resetStore() triggers a persist write into sessionStorage — wipe AFTER it
  // so seeded storage is not shadowed by the empty blob (getItem prefers
  // sessionStorage for remember-me-off sessions).
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetSessionExpiredGuard();
  // jsdom logs "Not implemented: navigation" for the hard redirect in logout().
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('remember-me storage routing (FE-008)', () => {
  it('keeps the session in sessionStorage when remember-me is off', () => {
    useAuthStore.getState().setAuth({ token: validToken, userName: 'Sara' });
    useAuthStore.getState().setRememberMe('', false);

    expect(useAuthStore.getState().token).toBe(validToken);
    expect(window.sessionStorage.getItem('auth-storage')).toContain(validToken);
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
  });

  it('persists the session to localStorage when remember-me is on', () => {
    useAuthStore.getState().setAuth({ token: validToken });
    useAuthStore.getState().setRememberMe('sara@example.com', true);

    expect(window.localStorage.getItem('auth-storage')).toContain(validToken);
    expect(window.sessionStorage.getItem('auth-storage')).toBeNull();
  });

  it('a remember-me-off session dies with the tab (simulated)', () => {
    useAuthStore.getState().setAuth({ token: validToken });
    useAuthStore.getState().setRememberMe('', false);

    // Simulate tab close + reopen: sessionStorage is wiped, localStorage has nothing.
    window.sessionStorage.clear();
    useAuthStore.setState({ token: '' });

    expect(getAuthToken()).toBe('');
  });

  it('never writes the token under a duplicate key', () => {
    useAuthStore.getState().setAuth({ token: validToken });
    useAuthStore.getState().setRememberMe('sara@example.com', true);

    expect(window.localStorage.getItem('token')).toBeNull();
    expect(window.sessionStorage.getItem('token')).toBeNull();
  });
});

describe('logout (FE-008)', () => {
  it('clears only auth-related keys and keeps unrelated preferences', () => {
    useAuthStore.getState().setAuth({ token: validToken });
    useAuthStore.getState().setRememberMe('sara@example.com', true);
    window.localStorage.setItem('theme', 'dark');
    window.localStorage.setItem('registrationEmail', 'someone@example.com');

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBe('');
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
    expect(window.sessionStorage.getItem('auth-storage')).toBeNull();
    expect(window.localStorage.getItem('registrationEmail')).toBeNull();
    // Unrelated preferences survive (AC: theme survives logout).
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });
});

describe('handleSessionExpired (FE-008)', () => {
  it('clears the session once and redirects with a reason', () => {
    useAuthStore.getState().setAuth({ token: validToken });
    const redirect = vi.fn();

    handleSessionExpired(redirect);

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/login?reason=expired');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBe('');
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
    expect(window.sessionStorage.getItem('auth-storage')).toBeNull();
  });

  it('never repeats the work on subsequent 401s (no 401 storm / redirect loop)', () => {
    const redirect = vi.fn();

    handleSessionExpired(redirect);
    handleSessionExpired(redirect);
    handleSessionExpired(redirect);

    expect(redirect).toHaveBeenCalledTimes(1);
  });
});

describe('hydration validation & migration (FE-008)', () => {
  async function loadFreshStore() {
    vi.resetModules();
    const module = await import('../authStore');
    // Wait for the isHydrated timeout scheduled by onRehydrateStorage.
    await new Promise((resolve) => setTimeout(resolve, 0));
    return module;
  }

  it('treats a malformed stored token as unauthenticated and wipes it', async () => {
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({ state: { token: 'garbage', isAuthenticated: true, rememberMe: true }, version: 0 }),
    );

    const { useAuthStore: fresh } = await loadFreshStore();

    expect(fresh.getState().token).toBe('');
    expect(fresh.getState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
  });

  it('treats an expired stored token as unauthenticated on load (TC-AUTH-06)', async () => {
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({ state: { token: expiredToken, isAuthenticated: true, rememberMe: true }, version: 0 }),
    );

    const { useAuthStore: fresh } = await loadFreshStore();

    expect(fresh.getState().isAuthenticated).toBe(false);
    expect(fresh.getState().token).toBe('');
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
  });

  it('removes the legacy duplicate `token` key on load', async () => {
    window.localStorage.setItem('token', 'legacy-duplicate');
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({ state: { token: validToken, isAuthenticated: true, rememberMe: true }, version: 0 }),
    );

    const { useAuthStore: fresh } = await loadFreshStore();

    expect(window.localStorage.getItem('token')).toBeNull();
    expect(fresh.getState().token).toBe(validToken);
    expect(fresh.getState().isAuthenticated).toBe(true);
  });

  it('moves a legacy remember-me-off session from localStorage to sessionStorage', async () => {
    window.localStorage.setItem(
      'auth-storage',
      JSON.stringify({ state: { token: validToken, isAuthenticated: true, rememberMe: false }, version: 0 }),
    );

    const { useAuthStore: fresh } = await loadFreshStore();

    expect(window.sessionStorage.getItem('auth-storage')).toContain(validToken);
    expect(window.localStorage.getItem('auth-storage')).toBeNull();
    expect(fresh.getState().isAuthenticated).toBe(true);
  });
});
