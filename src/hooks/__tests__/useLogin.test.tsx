import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { useLogin } from '../useLogin';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../config/env';
import { loginUser, sendOtp } from '../../services/authService';
import { getStudentProfile } from '../../services/student-roleService/Studentprofileservice';

const { navigateMock, toastMock } = vi.hoisted(() => {
  const toast = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  });
  return { navigateMock: vi.fn(), toastMock: toast };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
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
    expect(result.current.errors.password).toBe('Password must be at least 6 characters');
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than six characters', async () => {
    const { result } = renderHook(() => useLogin());
    fillCredentials(result, 'sara@example.com', '123');

    await act(async () => {
      await submit(result);
    });

    expect(result.current.errors.password).toBe('Password must be at least 6 characters');
    expect(loginUserMock).not.toHaveBeenCalled();
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
    expect(navigateMock).toHaveBeenCalledWith('/mentor/dashboard');
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
    expect(navigateMock).toHaveBeenCalledWith('/student/dashboard');
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
    expect(navigateMock).toHaveBeenCalledWith('/student/dashboard');
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

  it('falls back to the mentor dashboard for an unknown role', async () => {
    loginUserMock.mockResolvedValue({ apiResponse: { jwt: makeToken({ sub: '1' }) } });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(navigateMock).toHaveBeenCalledWith('/mentor/dashboard');
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

  it('redirects a deleted account to the restore page', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { errorMessages: { error: 'Account is deleted' } } },
    });
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(window.localStorage.getItem('restoreEmail')).toBe('sara@example.com');
    expect(navigateMock).toHaveBeenCalledWith('/restore-account');
  });

  it('requests a fresh OTP for an unverified account', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { message: 'Email not verified, please request a new OTP' } },
    });
    sendOtpMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(sendOtpMock).toHaveBeenCalledWith('sara@example.com');
    expect(window.localStorage.getItem('registrationEmail')).toBe('sara@example.com');
    expect(navigateMock).toHaveBeenCalledWith('/verify');
  });

  it('shows an error when the OTP resend fails', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { message: 'unverified account' } },
    });
    sendOtpMock.mockRejectedValue(new Error('smtp down'));
    const { result } = renderHook(() => useLogin());
    fillCredentials(result);

    await act(async () => {
      await submit(result);
    });

    expect(toastMock.error).toHaveBeenCalledWith('Failed to send the code. Please try again.');
    expect(navigateMock).not.toHaveBeenCalled();
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

    expect(toastMock.error).toHaveBeenCalledWith('Server down');
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
