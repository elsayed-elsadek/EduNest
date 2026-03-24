import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_STORAGE = 'auth-storage';
const TOKEN_KEY = 'token';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      isAuthenticated: false,
      userName: '',
      userEmail: '',
      userRole: '',
      userAvatar: '',
      isHydrated: false,
      lastEmail: '',
      rememberMe: false,
      setAuth: (payload) =>
        set((state) => {
          if (payload.token && typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_KEY, payload.token);
          }
          return {
            ...state,
            token: payload.token,
            isAuthenticated: !!payload.token,
            userName: payload.userName ?? state.userName,
            userEmail: payload.userEmail ?? state.userEmail,
            userRole: payload.userRole ?? state.userRole,
            userAvatar: payload.userAvatar ?? state.userAvatar,
          };
        }),
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
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          // Clear zustand persist explicitly
          localStorage.removeItem(AUTH_STORAGE);
        }
        set({
          token: '',
          isAuthenticated: false,
          userName: '',
          userEmail: '',
          userRole: '',
          userAvatar: '',
          lastEmail: '',
          rememberMe: false,
        });
        // Hard redirect to clear all React state/cache
        window.location.href = '/login';
      },
    }),
    {
      name: AUTH_STORAGE,
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== 'undefined') {
          window.localStorage.setItem(TOKEN_KEY, state.token);
        }
        // Mark as hydrated after rehydration completes
        setTimeout(() => {
          useAuthStore.setState({ isHydrated: true });
        }, 0);
      },
    }
  )
);

/** للاستخدام خارج الـ React (مثل الـ API interceptor) — يقرأ من الـ store أو من localStorage */
export function getAuthToken(): string {
  const fromStore = useAuthStore.getState().token;
  if (fromStore) return fromStore;
  if (typeof window === 'undefined') return '';
  const fromToken = window.localStorage.getItem(TOKEN_KEY);
  if (fromToken) return fromToken;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      return parsed?.state?.token ?? '';
    }
  } catch {
    // ignore
  }
  return '';
}
