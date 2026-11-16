import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { isTokenValid } from '../utils/jwt';

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
  'restoreEmail',
  'registrationEmail',
  'registrationType',
  'resetEmail',
] as const;

export interface AuthState {
  token: string;
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  userRole: string;
  userAvatar: string;
  isHydrated: boolean;
  lastEmail: string;
  rememberMe: boolean;
  setAuth: (payload: {
    token: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    userAvatar?: string;
  }) => void;
  updateProfile: (payload: {
    userName?: string;
    userAvatar?: string;
  }) => void;
  setHydrated: (value: boolean) => void;
  setRememberMe: (email: string, remember: boolean) => void;
  logout: () => void;
}

/** Initial (logged-out) auth state — also used as the reset payload on expiry. */
const LOGGED_OUT_STATE = {
  token: '',
  isAuthenticated: false,
  userName: '',
  userEmail: '',
  userRole: '',
  userAvatar: '',
  lastEmail: '',
  rememberMe: false,
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
    return window.sessionStorage.getItem(name) ?? window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    let remember = false;
    try {
      const parsed = JSON.parse(value) as { state?: { rememberMe?: boolean } };
      remember = parsed?.state?.rememberMe === true;
    } catch {
      // Unparseable payload — keep it out of persistent storage.
    }
    if (remember) {
      window.localStorage.setItem(name, value);
      window.sessionStorage.removeItem(name);
    } else {
      window.sessionStorage.setItem(name, value);
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
    (set) => ({
      ...LOGGED_OUT_STATE,
      isHydrated: false,
      setAuth: (payload) =>
        set((state) => ({
          ...state,
          token: payload.token,
          isAuthenticated: !!payload.token,
          userName: payload.userName ?? state.userName,
          userEmail: payload.userEmail ?? state.userEmail,
          userRole: payload.userRole ?? state.userRole,
          userAvatar: payload.userAvatar ?? state.userAvatar,
        })),
      updateProfile: (payload) =>
        set((state) => ({
          ...state,
          userName: payload.userName ?? state.userName,
          userAvatar: payload.userAvatar ?? state.userAvatar,
        })),
      setHydrated: (value) =>
        set({ isHydrated: value }),
      setRememberMe: (email, remember) =>
        set({ lastEmail: email, rememberMe: remember }),
      logout: () => {
        // Resetting the store first lets the persist middleware write the
        // emptied state; wiping the keys afterwards removes it entirely, so
        // only auth keys are touched (theme and other preferences survive).
        set(LOGGED_OUT_STATE);
        clearAuthStorage();
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

// FE-008 — hydration validation (TC-AUTH-06). With synchronous storage the
// persisted state is already merged by the time create() returns, so an
// expired or malformed token can be rejected immediately: the session is
// wiped and the store starts unauthenticated.
if (typeof window !== 'undefined') {
  const { token } = useAuthStore.getState();
  if (token && !isTokenValid(token)) {
    useAuthStore.setState(LOGGED_OUT_STATE);
    clearAuthStorage();
  }
  // Mark as hydrated after rehydration completes.
  useAuthStore.setState({ isHydrated: true });
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
