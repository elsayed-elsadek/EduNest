import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { useLogin } from '../useLogin';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../config/env';
import { loginUser, sendOtp } from '../../services/authService';
import { getStudentProfile } from '../../services/student-roleService/Studentprofileservice';

const { navigateMock, locationMock, toastMock } = vi.hoisted(() => {
  const toast = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  });
  return {
    navigateMock: vi.fn(),
    locationMock: { pathname: '/login', search: '', hash: '', state: null as unknown },
    toastMock: toast,
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationMock,
  };
});

vi.mock('react-hot-toast', () => ({ default: toastMock }));

vi.mock('../../services/authService', () => ({
  loginUser: vi.fn(),
  sendOtp: vi.fn(),
}));

vi.mock('../../services/student-roleService/Studentprofileservice', () => ({
  getStudentProfile: vi.fn(),
}));

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
    toBase64Url(JSON.stringify({ alg: 'HS256' })),
    toBase64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
}

function submit(result: { current: ReturnType<typeof useLogin> }) {
  return result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as FormEvent);
}

function fillCredentials(
  result: { current: ReturnType<typeof useLogin> },
  email = 'sara@example.com',
  password = 'secret1',
) {
  act(() => {
    result.current.handleInputChange('email', email);
    result.current.handleInputChange('password', password);
  });
}

const loginUserMock = vi.mocked(loginUser);
const sendOtpMock = vi.mocked(sendOtp);
const getStudentProfileMock = vi.mocked(getStudentProfile);

beforeEach(() => {
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
  vi.clearAllMocks();
  locationMock.pathname = '/login';
  locationMock.search = '';
  locationMock.hash = '';
  locationMock.state = null;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('useLogin validation', () => {
  it('rejects an empty form without calling the API', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await submit(result);
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('submits a password shorter than six characters without client-side length validation', async () => {
    loginUserMock.mockResolvedValue({ apiResponse: {} });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result, 'sara@example.com', '123');

    await act(async () => {
      await submit(result);
    });

    expect(result.current.errors.password).toBeUndefined();
    expect(loginUserMock).toHaveBeenCalledWith('sara@example.com', '123');
  });

  it('accepts a valid e-mail and password and calls the API', async () => {
    loginUserMock.mockResolvedValue({ apiResponse: {} });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(result.current.errors).toEqual({});
    expect(loginUserMock).toHaveBeenCalledWith('sara@example.com', 'secret1');
  });

  it('clears the field error when the user edits that field', async () => {
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await submit(result);
    });
    expect(result.current.errors.email).toBe('Email is required');

    act(() => {
      result.current.handleInputChange('email', 'sara@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.showPassword).toBe(false);
    act(() => {
      result.current.setShowPassword(true);
    });
    expect(result.current.showPassword).toBe(true);
  });
});

describe('useLogin submit', () => {
  it.each([
    { rememberMe: true, expectedHome: 'local' as const, absentHome: 'session' as const },
    { rememberMe: false, expectedHome: 'session' as const, absentHome: 'local' as const },
  ])('persists a complete login pair in $expectedHome storage and restores it after reload', async ({
    rememberMe,
    expectedHome,
    absentHome,
  }) => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    useAuthStore.getState().setAuth({
      token: 'prior-synthetic-access-token',
      refreshToken: 'prior-synthetic-refresh-token',
      rememberMe: !rememberMe,
      lastEmail: 'prior-session@example.invalid',
    });
    useAuthStore.getState().setRememberMe('prior-session@example.invalid', !rememberMe);
    loginUserMock.mockResolvedValue({
      apiResponse: {
        jwt: makeToken({ sub: 'synthetic-user', authorities: ['ROLE_MENTOR'] }),
        refreshToken: 'synthetic-refresh-token',
      },
    });

    const { result } = renderHook(() => useLogin());
    fillCredentials(result, 'session-test@example.invalid', 'synthetic-password');
    act(() => result.current.handleInputChange('rememberMe', rememberMe));

    await act(async () => submit(result));

    const intendedStorage = expectedHome === 'local' ? window.localStorage : window.sessionStorage;
    const otherStorage = absentHome === 'local' ? window.localStorage : window.sessionStorage;
    const storedPair = intendedStorage.getItem('auth-storage');
    expect(storedPair).toContain('synthetic-refresh-token');
    expect(storedPair).not.toContain('prior-synthetic-access-token');
    expect(storedPair).not.toContain('prior-synthetic-refresh-token');
    expect(otherStorage.getItem('auth-storage')).toBeNull();
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      rememberMe,
      lastEmail: rememberMe ? 'session-test@example.invalid' : '',
    });

    // Re-import only the store module to simulate a fresh page load. The
    // completed login above is the source of the persisted session.
    vi.resetModules();
    const { useAuthStore: rehydratedStore } = await import('../../store/authStore');
    expect(rehydratedStore.getState()).toMatchObject({
      token: expect.any(String),
      refreshToken: 'synthetic-refresh-token',
      isAuthenticated: true,
      rememberMe,
      authInit: 'ready',
    });
    expect(rehydratedStore.getState().token).toBe(JSON.parse(storedPair!).state.token);
  });

  it('stores the session and redirects to the role dashboard on success', async () => {
    loginUserMock.mockResolvedValue({
      apiResponse: {
        jwt: makeToken({ authorities: ['ROLE_MENTOR'], fullName: 'Sara Ali' }),
        status: 'Welcome back',
      },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.userRole).toBe('ROLE_MENTOR');
    expect(state.userName).toBe('Sara Ali');
    expect(navigateMock).toHaveBeenCalledWith('/mentor/dashboard', { replace: true });
    expect(toastMock.success).toHaveBeenCalledWith('Welcome back');
    expect(result.current.loading).toBe(false);
  });

  it('loads the student avatar after a student login', async () => {
    loginUserMock.mockResolvedValue({
      apiResponse: {
        jwt: makeToken({
          username: 'sara@example.com',
          fullName: 'Sara Ali',
          authorities: ['ROLE_STUDENT'],
        }),
      },
    });
    getStudentProfileMock.mockResolvedValue({
      apiResponse: { profile: { profileImageUrl: '/uploads/sara.png' } },
    } as unknown as Awaited<ReturnType<typeof getStudentProfile>>);
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    const apiOrigin = new URL(API_BASE_URL).origin;
    expect(useAuthStore.getState().userAvatar).toBe(`${apiOrigin}/uploads/sara.png`);
    expect(navigateMock).toHaveBeenCalledWith('/student/dashboard', { replace: true });
  });

  it('still logs in when the optional profile image request fails', async () => {
    loginUserMock.mockResolvedValue({
      apiResponse: {
        jwt: makeToken({ authorities: ['ROLE_STUDENT'] }),
      },
    });
    getStudentProfileMock.mockRejectedValue(new Error('profile unavailable'));
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith('/student/dashboard', { replace: true });
  });

  it('remembers the e-mail when "remember me" is checked', async () => {
    loginUserMock.mockResolvedValue({
      apiResponse: { jwt: makeToken({ authorities: ['ROLE_ADMIN'] }) },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);
    act(() => {
      result.current.handleInputChange('rememberMe', true);
    });

    await act(async () => {
      await submit(result);
    });

    expect(useAuthStore.getState().rememberMe).toBe(true);
    expect(useAuthStore.getState().lastEmail).toBe('sara@example.com');
  });

  it('sends an unknown role to the unauthorized page', async () => {
    loginUserMock.mockResolvedValue({ apiResponse: { jwt: makeToken({ sub: '1' }) } });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(navigateMock).toHaveBeenCalledWith('/unauthorized', { replace: true });
  });

  it('returns to a safe internal deep link after a successful login', async () => {
    locationMock.state = { from: { pathname: '/student/learning', search: '?page=2' } };
    loginUserMock.mockResolvedValue({
      apiResponse: { jwt: makeToken({ sub: '1', role: 'ROLE_STUDENT' }) },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(navigateMock).toHaveBeenCalledWith('/student/learning?page=2', { replace: true });
  });

  it('ignores an external post-login redirect and uses the role dashboard', async () => {
    locationMock.state = { from: { pathname: '//evil.example/steal' } };
    loginUserMock.mockResolvedValue({
      apiResponse: { jwt: makeToken({ sub: '1', role: 'ROLE_STUDENT' }) },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(navigateMock).toHaveBeenCalledWith('/student/dashboard', { replace: true });
  });

  it.each([
    null,
    '',
    { pathname: '//evil.example/redirect' },
    { pathname: '/student/learning', search: 'not-a-query' },
  ])('falls back to the role dashboard for a malformed or empty return path', async (from) => {
    locationMock.state = { from };
    loginUserMock.mockResolvedValue({
      apiResponse: { jwt: makeToken({ sub: 'synthetic-user', role: 'ROLE_STUDENT' }) },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => submit(result));

    expect(navigateMock).toHaveBeenCalledWith('/student/dashboard', { replace: true });
  });

  it('reports a failed login when the API returns no token', async () => {
    loginUserMock.mockResolvedValue({
      apiResponse: { status: 'Invalid credentials' },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(toastMock.error).toHaveBeenCalledWith('Invalid credentials');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('does not call the API when validation fails', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await submit(result);
    });

    expect(loginUserMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('does not infer account deletion from response message text', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { errorMessages: { error: 'Account is deleted' } } },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(window.localStorage.getItem('restoreEmail')).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.authError).toBe('Account is deleted');
  });

  it('does not infer verification status or issue OTP from response message text', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { message: 'Email not verified, please request a new OTP' } },
    });
    sendOtpMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(sendOtpMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('registrationEmail')).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.authError).toBe('Email not verified, please request a new OTP');
  });

  it('shows a login error without probing verification or attempting an OTP resend', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { message: 'unverified account' } },
    });
    sendOtpMock.mockRejectedValue(new Error('smtp down'));
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(sendOtpMock).not.toHaveBeenCalled();
    expect(result.current.authError).toBe('unverified account');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('shows the exact generic message for ERR_INVALID_CREDENTIALS', async () => {
    loginUserMock.mockRejectedValue({
      response: { status: 401, data: { errorCode: 'ERR_INVALID_CREDENTIALS', message: 'Account is deleted' } },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => { await submit(result); });

    expect(result.current.authError).toBe('Invalid email or password.');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(sendOtpMock).not.toHaveBeenCalled();
  });

  it('maps 400 ERR_VALIDATION email and password fields to inline form errors', async () => {
    loginUserMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errorCode: 'ERR_VALIDATION',
          message: 'Validation failed.',
          fields: { email: 'Email is invalid.', password: 'Password is incorrect.' },
        },
      },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => { await submit(result); });

    expect(result.current.errors.email).toBe('Email is invalid.');
    expect(result.current.errors.password).toBe('Password is incorrect.');
    expect(result.current.authError).toBe('');
  });

  it('handles missing or unexpected validation fields without throwing', async () => {
    loginUserMock.mockRejectedValue({
      response: { status: 400, data: { errorCode: 'ERR_VALIDATION', message: 'Invalid request.', fields: { other: 'Check this.' } } },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => { await submit(result); });

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBeUndefined();
    expect(result.current.authError).toBe('Invalid request.');
  });

  it('blocks both button-driven and direct submissions during a login cooldown', async () => {
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);
    act(() => result.current.cooldown.start(5));

    await act(async () => { await submit(result); });

    expect(result.current.cooldown.isActive).toBe(true);
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('surfaces the backend error message for any other failure', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { message: 'Server down' } },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(result.current.authError).toBe('Server down');
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
