/**
 * Storage adapter + bootstrap-decision tests for the persisted auth store
 * (FE-008 / EF-25 — RM-1..8, D2 migration, D9 legacy cleanup).
 *
 * Each test re-imports the store module so the persist hydration (and its
 * bootstrap decision) runs against freshly seeded storage.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const AUTH_STORAGE = 'auth-storage';
const TOKEN_KEY = 'token';

/** Builds a minimal unsigned JWT with the given payload (client-side decode only). */
function makeToken(payload: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.sig`;
}

/** Seeds a zustand-persist-shaped record into the chosen home. */
function seed(home: 'local' | 'session', state: Record<string, unknown>): void {
  const storage = home === 'local' ? window.localStorage : window.sessionStorage;
  storage.setItem(AUTH_STORAGE, JSON.stringify({ state, version: 0 }));
}

function readHome(home: 'local' | 'session'): string | null {
  const storage = home === 'local' ? window.localStorage : window.sessionStorage;
  return storage.getItem(AUTH_STORAGE);
}

/** Lets the onRehydrateStorage setTimeout decision run. */
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

type StoreModule = typeof import('../authStore');

async function freshStore(): Promise<StoreModule> {
  vi.resetModules();
  return await import('../authStore');
}

describe('authStore storage adapter — single record, routed home', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('RM-1: an unchecked session record is written to sessionStorage only', async () => {
    const store = await freshStore();
    store.useAuthStore.getState().setAuth({ token: 'tok1' });

    const sessionRaw = readHome('session');
    expect(sessionRaw).toContain('tok1');
    expect(readHome('local')).toBeNull();
    void store;
  });

  it('RM-2: a checked ("remember me") session record is written to localStorage only', async () => {
    const store = await freshStore();
    store.useAuthStore.getState().setAuth({ token: 'tok2', rememberMe: true });

    const localRaw = readHome('local');
    expect(localRaw).toContain('tok2');
    expect(readHome('session')).toBeNull();
  });

  it('RM-3/RM-4: switching rememberMe relocates the record and leaves no copy behind', async () => {
    const store = await freshStore();
    store.useAuthStore.getState().setAuth({ token: 'tok3' });
    expect(readHome('session')).not.toBeNull();

    // unchecked → checked
    store.useAuthStore.getState().setRememberMe('user@edunest.io', true);
    expect(readHome('local')).toContain('tok3');
    expect(readHome('session')).toBeNull();

    // checked → unchecked
    store.useAuthStore.getState().setRememberMe('', false);
    expect(readHome('session')).toContain('tok3');
    expect(readHome('local')).toBeNull();
  });

  it('marker: a record stored in the wrong home is discarded, never restored', async () => {
    // Record claims sessionStorage but sits in localStorage — stale copy.
    seed('local', {
      token: 'stale',
      refreshToken: 'r',
      rememberMe: false,
      userName: '',
      userEmail: '',
      userRole: '',
      userAvatar: '',
      lastEmail: '',
      storageHome: 'session',
    });

    const store = await freshStore();
    await tick();

    expect(readHome('local')).toBeNull();
    expect(store.useAuthStore.getState().isAuthenticated).toBe(false);
    expect(store.useAuthStore.getState().token).toBe('');
  });
});

describe('authStore bootstrap decision', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('no stored session → authInit ready (anonymous)', async () => {
    const store = await freshStore();
    await tick();
    expect(store.useAuthStore.getState().authInit).toBe('ready');
    expect(store.useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('valid (unexpired) token → authInit ready with a session', async () => {
    const jwt = makeToken({ sub: 'u', exp: Math.floor(Date.now() / 1000) + 600 });
    seed('session', {
      token: jwt,
      refreshToken: 'rt',
      isAuthenticated: true,
      rememberMe: false,
      userName: '',
      userEmail: '',
      userRole: '',
      userAvatar: '',
      lastEmail: '',
      storageHome: 'session',
    });

    const store = await freshStore();
    await tick();

    const state = store.useAuthStore.getState();
    expect(state.authInit).toBe('ready');
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(jwt);
  });

  it('expired access token + refresh token → authInit recovering (session preserved)', async () => {
    const jwt = makeToken({ sub: 'u', exp: Math.floor(Date.now() / 1000) - 600 });
    seed('session', {
      token: jwt,
      refreshToken: 'rt1',
      rememberMe: false,
      userName: '',
      userEmail: '',
      userRole: '',
      userAvatar: '',
      lastEmail: '',
      storageHome: 'session',
    });

    const store = await freshStore();
    await tick();

    const state = store.useAuthStore.getState();
    expect(state.authInit).toBe('recovering');
    expect(state.token).toBe(jwt); // not cleared — recovery is in flight
  });

  it('malformed token without refresh token → session cleared, authInit failed', async () => {
    seed('session', {
      token: 'not-a-jwt',
      refreshToken: '',
      rememberMe: false,
      userName: '',
      userEmail: '',
      userRole: '',
      userAvatar: '',
      lastEmail: '',
      storageHome: 'session',
    });

    const store = await freshStore();
    await tick();

    const state = store.useAuthStore.getState();
    expect(state.authInit).toBe('failed');
    expect(state.token).toBe('');
    expect(readHome('session')).toBeNull();
    expect(readHome('local')).toBeNull();
  });
});

describe('authStore migrations and legacy cleanup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('D2: a legacy unchecked record persisted in localStorage is relocated to sessionStorage', async () => {
    // Pre-upgrade record: no storageHome marker, rememberMe false, localStorage home.
    seed('local', {
      token: 'legacy-tok',
      refreshToken: 'rt1',
      rememberMe: false,
      userName: '',
      userEmail: '',
      userRole: '',
      userAvatar: '',
      lastEmail: '',
    });

    const store = await freshStore();
    await tick();

    // Relocated once, then the session is held for recovery (refresh token present).
    expect(readHome('session')).toContain('legacy-tok');
    expect(readHome('local')).toBeNull();
    expect(store.useAuthStore.getState().authInit).toBe('recovering');
  });

  it('D9: a lone legacy token key is removed on hydration and never resurrects a session', async () => {
    window.localStorage.setItem(TOKEN_KEY, 'orphan-token');

    const store = await freshStore();
    await tick();

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(store.useAuthStore.getState().isAuthenticated).toBe(false);
    expect(store.useAuthStore.getState().authInit).toBe('ready');
  });
});

describe('authStore clearAuth — selective wipe', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('clears only auth-owned keys; theme / pre-auth emails survive', async () => {
    window.localStorage.setItem('theme', 'dark');
    window.localStorage.setItem('registrationEmail', 'new@edunest.io');
    window.localStorage.setItem('restoreEmail', 'old@edunest.io');
    window.localStorage.setItem('resetEmail', 'reset@edunest.io');
    window.localStorage.setItem('registrationType', 'mentor');

    const store = await freshStore();
    store.useAuthStore.getState().setAuth({ token: 'tok-clear', rememberMe: true });
    expect(readHome('local')).not.toBeNull();

    store.useAuthStore.getState().clearAuth();

    expect(readHome('local')).toBeNull();
    expect(readHome('session')).toBeNull();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();

    // Non-auth keys survive (D6).
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(window.localStorage.getItem('registrationEmail')).toBe('new@edunest.io');
    expect(window.localStorage.getItem('restoreEmail')).toBe('old@edunest.io');
    expect(window.localStorage.getItem('resetEmail')).toBe('reset@edunest.io');
    expect(window.localStorage.getItem('registrationType')).toBe('mentor');

    const state = store.useAuthStore.getState();
    expect(state.token).toBe('');
    expect(state.refreshToken).toBe('');
    expect(state.isAuthenticated).toBe(false);
    expect(state.authInit).toBe('failed');
  });
});
