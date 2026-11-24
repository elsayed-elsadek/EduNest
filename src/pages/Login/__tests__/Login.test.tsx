import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loginUserMock, toastMock } = vi.hoisted(() => ({
  loginUserMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/authService', () => ({ loginUser: loginUserMock }));
vi.mock('../../../services/student-roleService/Studentprofileservice', () => ({
  getStudentProfile: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import Login from '../Login';
import { useAuthStore } from '../../../store/authStore';

function makeToken(payload: Record<string, unknown>) {
  const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mentor/dashboard" element={<p>Mentor dashboard</p>} />
        <Route path="/verify" element={<p>Verify page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillLogin(email = 'login-test@example.invalid', password = 'synthetic-password') {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
}

function submitLogin() {
  fireEvent.submit(screen.getByRole('form', { name: 'Login form' }));
}

beforeEach(() => {
  loginUserMock.mockReset();
  toastMock.mockClear();
  useAuthStore.getState().clearAuth();
});

describe('Login page integration', () => {
  it('exposes labeled fields and shows required-field validation without calling the API', async () => {
    renderLogin();

    expect(screen.getByLabelText('E-mail')).toHaveAttribute('id', 'login-email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'login-password');
    await act(async () => submitLogin());

    expect(screen.getByText('Email is required')).toBeVisible();
    expect(screen.getByText('Password is required')).toBeVisible();
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it('announces invalid credentials and does not create an authenticated session', async () => {
    loginUserMock.mockRejectedValue({
      response: { status: 401, data: { errorCode: 'ERR_INVALID_CREDENTIALS', message: 'Rejected.' } },
    });
    renderLogin();
    fillLogin();

    await act(async () => submitLogin());

    expect(screen.getByRole('alert')).toBeVisible();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBe('');
    expect(screen.queryByText('Verify page')).not.toBeInTheDocument();
  });

  it('prevents duplicate submissions while login is pending', async () => {
    let resolveLogin!: (response: unknown) => void;
    loginUserMock.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve; }));
    renderLogin();
    fillLogin();

    await act(async () => submitLogin());
    const submit = screen.getByRole('form', { name: 'Login form' }).querySelector('button[type="submit"]');
    expect(submit).toBeDisabled();

    await act(async () => submitLogin());
    expect(loginUserMock).toHaveBeenCalledTimes(1);

    await act(async () => resolveLogin({ apiResponse: {} }));
  });

  it('navigates to the role dashboard after successful login', async () => {
    loginUserMock.mockResolvedValue({
      apiResponse: {
        jwt: makeToken({ sub: 'synthetic-user', authorities: ['ROLE_MENTOR'] }),
        refreshToken: 'synthetic-refresh-token',
      },
    });
    renderLogin();
    fillLogin();

    await act(async () => submitLogin());

    expect(await screen.findByText('Mentor dashboard')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('keeps an unverified login failure on the login page rather than inferring a verify route', async () => {
    loginUserMock.mockRejectedValue({
      response: { data: { message: 'Email not verified; request a new OTP.' } },
    });
    renderLogin();
    fillLogin();

    await act(async () => submitLogin());

    expect(screen.getByRole('alert')).toHaveTextContent(/not verified/i);
    expect(screen.queryByText('Verify page')).not.toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
