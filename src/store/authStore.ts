import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { isTokenValid } from '../utils/jwt';
import { API_BASE_URL } from '../config/env';

/**
 * FE-008 — Session & token lifecycle
 *
 * Storage strategy (see docs/FE-008-session-storage-decision.md):
 * - "Remember me" checked   → the session persists in `localStorage`.
 * - "Remember me" unchecked → the session lives in `sessionStorage` only and
 *   dies with the tab.
 *
 * The persisted zustand blob (`auth-storage`) is the SINGLE source of truth
 * for the token. No duplicate storage keys, no token in URLs, never logged.
 */
const AUTH_STORAGE = 'auth-storage';

/** Legacy duplicate JWT key written by the previous implementation — removed on load. */
const LEGACY_TOKEN_KEY = 'token';

/** Keys that belong to the auth domain and are wiped by logout/expiry. Unrelated preferences (e.g. `theme`) are NOT listed here and survive. */
const AUTH_STORAGE_KEYS = [
  AUTH_STORAGE,
  LEGACY_TOKEN_KEY,
] as const;

export interface AuthState {
  token: string;
  refreshToken: string;
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  userRole: string;
  userAvatar: string;
  isHydrated: boolean;
  authInit: 'hydrating' | 'ready' | 'recovering' | 'throttled' | 'failed';
  lastEmail: string;
  rememberMe: boolean;
  setAuth: (payload: {
    token: string;
    refreshToken?: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    userAvatar?: string;
    rememberMe?: boolean;
    lastEmail?: string;
  }) => void;
  setTokenPair: (token: string, refreshToken: string) => void;
  updateProfile: (payload: {
    userName?: string;
    userAvatar?: string;
  }) => void;
  setHydrated: (value: boolean) => void;
  setAuthInit: (value: AuthState['authInit']) => void;
  clearAuth: () => void;
  setRememberMe: (email: string, remember: boolean) => void;
  logout: () => void;
}

/** Initial (logged-out) auth state — also used as the reset payload on expiry. */
const LOGGED_OUT_STATE = {
  token: '',
  refreshToken: '',
  isAuthenticated: false,
  userName: '',
  userEmail: '',
  userRole: '',
  userAvatar: '',
  lastEmail: '',
  rememberMe: false,
  authInit: 'failed' as const,
};

/** Removes every auth-related key from both storages; unrelated keys survive. */
function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  for (const key of AUTH_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

/**
 * Session-aware storage: routes the persisted auth blob to `localStorage` when
 * the user checked "remember me", otherwise to `sessionStorage` so the session
 * ends when the tab closes (TC-AUTH-04).
 */
const sessionAwareStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    // Session-only logins live in sessionStorage; "remember me" ones in localStorage.
    // New records carry a home marker so stale copies in the wrong storage are
    // discarded rather than accidentally restoring a session.
    for (const [home, storage] of [
      ['session', window.sessionStorage],
      ['local', window.localStorage],
    ] as const) {
      const raw = storage.getItem(name);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as { state?: { storageHome?: string } };
        const marker = parsed?.state?.storageHome;
        if ((marker === 'session' || marker === 'local') && marker !== home) {
          storage.removeItem(name);
          continue;
        }
      } catch {
        // Let Zustand handle malformed persisted payloads as usual.
      }
      return raw;
    }
    return null;
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    let remember = false;
    let persistedValue = value;
    try {
      const parsed = JSON.parse(value) as { state?: { rememberMe?: boolean; storageHome?: string } };
      remember = parsed?.state?.rememberMe === true;
      if (parsed.state) {
        parsed.state.storageHome = remember ? 'local' : 'session';
        persistedValue = JSON.stringify(parsed);
      }
    } catch {
      // Unparseable payload — keep it out of persistent storage.
    }
    if (remember) {
      window.localStorage.setItem(name, persistedValue);
      window.sessionStorage.removeItem(name);
    } else {
      window.sessionStorage.setItem(name, persistedValue);
      window.localStorage.removeItem(name);
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
  },
};

let sessionExpiredHandled = false;

const defaultSessionRedirect = (path: string): void => {
  window.location.replace(path);
};

/**
 * FE-008 — single entry point for "the session is no longer usable"
 * (expired/malformed token, 401 from any endpoint).
 *
 * Clears the auth state exactly once and lands the user on
 * `/login?reason=expired`. The once-guard prevents redirect loops and 401
 * storms when several requests fail at the same time.
 */
export function handleSessionExpired(
  redirect: (path: string) => void = defaultSessionRedirect,
): void {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  useAuthStore.setState(LOGGED_OUT_STATE);
  clearAuthStorage();
  redirect('/login?reason=expired');
}

/** Test-only: resets the once-guard between unit tests. */
export function resetSessionExpiredGuard(): void {
  sessionExpiredHandled = false;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...LOGGED_OUT_STATE,
      isHydrated: false,
      setAuth: (payload) =>
        set((state) => ({
          ...state,
          token: payload.token,
          refreshToken: payload.refreshToken ?? state.refreshToken,
          isAuthenticated: !!payload.token,
          userName: payload.userName ?? state.userName,
          userEmail: payload.userEmail ?? state.userEmail,
          userRole: payload.userRole ?? state.userRole,
          userAvatar: payload.userAvatar ?? state.userAvatar,
          rememberMe: payload.rememberMe ?? state.rememberMe,
          lastEmail: payload.lastEmail ?? state.lastEmail,
          authInit: 'ready',
        })),
      // FE-027: persists the rotated pair after every successful refresh.
      // Rotation is single-use — the OLD refresh token is dead the moment this
      // runs, so both values must land in storage together, atomically.
      setTokenPair: (token, refreshToken) =>
        set({ token, refreshToken, isAuthenticated: !!token, authInit: 'ready' }),
      updateProfile: (payload) =>
        set((state) => ({
          ...state,
          userName: payload.userName ?? state.userName,
          userAvatar: payload.userAvatar ?? state.userAvatar,
        })),
      setHydrated: (value) =>
        set({ isHydrated: value }),
      setAuthInit: (value) =>
        set({ authInit: value }),
      clearAuth: () => {
        set({ ...LOGGED_OUT_STATE, isHydrated: true });
        clearAuthStorage();
      },
      setRememberMe: (email, remember) =>
        set({ lastEmail: email, rememberMe: remember }),
      logout: () => {
        // BLK-04: the backend cannot revoke already-issued access JWTs, so the
        // client is the mitigation — revoke the refresh session server-side
        // (best-effort, idempotent per contract) then wipe locally at once.
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            // Intentional raw-fetch exception: keepalive lets revocation
            // survive the hard redirect; the request is best-effort by design.
            void fetch(`${API_BASE_URL}/login-api/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
              keepalive: true, // survives the hard redirect below
            }).catch(() => undefined);
          }
        } catch {
          // best-effort — never block logout on the revoke call
        }
        // Resetting the store first lets the persist middleware write the
        // emptied state; wiping the keys afterwards removes it entirely, so
        // only auth keys are touched (theme and other preferences survive).
        set({ ...LOGGED_OUT_STATE, isHydrated: true });
        clearAuthStorage();
        notifyAuthPeers({ type: 'LOGOUT' });
        // Hard redirect to clear all React state/cache
        window.location.href = '/login';
      },
    }),
    {
      name: AUTH_STORAGE,
      storage: createJSONStorage(() => sessionAwareStorage),
      onRehydrateStorage: () => (state) => {
        if (typeof window === 'undefined') return;
        // Migration (FE-008): the legacy implementation duplicated the JWT
        // under a bare `token` key. The persisted blob is the single source.
        window.localStorage.removeItem(LEGACY_TOKEN_KEY);

        if (state?.token && !state.rememberMe) {
          // Legacy "remember me" off sessions were persisted to localStorage —
          // move them to sessionStorage so closing the tab ends the session.
          const legacyBlob = window.localStorage.getItem(AUTH_STORAGE);
          if (legacyBlob) {
            window.sessionStorage.setItem(AUTH_STORAGE, legacyBlob);
            window.localStorage.removeItem(AUTH_STORAGE);
          }
        }
        // NOTE: clearing invalid tokens happens right after store creation
        // (see below) — this callback runs while the module is still
        // evaluating, where the store constant is not reachable yet.
      },
    }
  )
);

// FE-008 — decide whether the hydrated session is ready, needs refresh
// recovery, or must be cleared. Keep expired sessions with a refresh token so
// the auth-session bootstrap can rotate them instead of logging out locally.
if (typeof window !== 'undefined') {
  const { token, refreshToken } = useAuthStore.getState();
  if (!token) {
    useAuthStore.setState({ isHydrated: true, authInit: 'ready' });
  } else if (!isTokenValid(token)) {
    if (refreshToken) {
      useAuthStore.setState({ isHydrated: true, isAuthenticated: true, authInit: 'recovering' });
    } else {
      useAuthStore.getState().clearAuth();
    }
  } else {
    useAuthStore.setState({ isHydrated: true, authInit: 'ready' });
  }
}

/** للاستخدام خارج الـ React (مثل الـ API interceptor) — يقرأ من الـ store أو من الـ auth blob المحفوظ */
export function getAuthToken(): string {
  const fromStore = useAuthStore.getState().token;
  if (fromStore) return fromStore;
  if (typeof window === 'undefined') return '';
  try {
    const raw =
      window.sessionStorage.getItem(AUTH_STORAGE) ?? window.localStorage.getItem(AUTH_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      return parsed?.state?.token ?? '';
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * FE-027 — reads the persisted auth pair straight from web storage, bypassing
 * this tab's in-memory state. This is the shared state peer tabs re-read after
 * acquiring the refresh lock (remember-me-on sessions live in `localStorage`,
 * which is shared across tabs).
 */
export function getStoredAuth(): { token: string; refreshToken: string } {
  if (typeof window === 'undefined') return { token: '', refreshToken: '' };
  try {
    const raw =
      window.sessionStorage.getItem(AUTH_STORAGE) ?? window.localStorage.getItem(AUTH_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string; refreshToken?: string } };
      return {
        token: parsed?.state?.token ?? '',
        refreshToken: parsed?.state?.refreshToken ?? '',
      };
    }
  } catch {
    // ignore
  }
  return { token: '', refreshToken: '' };
}

/** Reads the current refresh token from the store, with persisted storage fallback. */
export function getRefreshToken(): string {
  const fromStore = useAuthStore.getState().refreshToken;
  return fromStore || getStoredAuth().refreshToken;
}

/** FE-027 — cross-tab auth events broadcast over a shared channel. */
export type AuthSyncEvent = { type: 'TOKEN_REFRESHED' } | { type: 'LOGOUT' };

const authChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('edunest_auth_sync')
    : null;

export function notifyAuthPeers(event: AuthSyncEvent): void {
  try {
    authChannel?.postMessage(event);
  } catch {
    // best-effort — a closed channel must never break the auth flow
  }
}

/**
 * Re-reads the persisted pair into this tab's in-memory state. Called when a
 * peer tab broadcasts TOKEN_REFRESHED (it already rotated and persisted the new
 * pair) or when a `storage` event reports a change.
 */
function syncFromStorage(): void {
  const stored = getStoredAuth();
  const current = useAuthStore.getState();
  if (!stored.token) {
    // Peer tab logged out or its session expired.
    if (current.token) useAuthStore.setState(LOGGED_OUT_STATE);
    return;
  }
  if (stored.token === current.token && stored.refreshToken === current.refreshToken) return;
  useAuthStore.setState({
    token: stored.token,
    refreshToken: stored.refreshToken,
    isAuthenticated: !!stored.token,
  });
}

if (typeof window !== 'undefined') {
  if (authChannel) {
    authChannel.onmessage = (event: MessageEvent<AuthSyncEvent>) => {
      if (event.data?.type === 'TOKEN_REFRESHED') {
        syncFromStorage();
      } else if (event.data?.type === 'LOGOUT') {
        // A peer tab revoked the session — end ours too, without a redirect
        // loop (ProtectedRoute lands the user on /login on its own).
        useAuthStore.setState(LOGGED_OUT_STATE);
        clearAuthStorage();
      }
    };
  }
  // `storage` events only fire in OTHER tabs — the cheapest cross-tab sync for
  // remember-me-on sessions (sessionStorage sessions are per-tab by design).
  window.addEventListener('storage', (event) => {
    if (event.key === AUTH_STORAGE) syncFromStorage();
  });
}
