import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { forgetResetPasswordMock, extractBackendMessageMock, navigateMock, toastMock, loggerErrorMock } = vi.hoisted(() => ({
  forgetResetPasswordMock: vi.fn(),
  extractBackendMessageMock: vi.fn(),
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
  loggerErrorMock: vi.fn(),
}));

vi.mock('../../../services/authService', () => ({
  forgetResetPassword: forgetResetPasswordMock,
  extractBackendMessage: extractBackendMessageMock,
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigateMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));
vi.mock('../../../utils/logger', () => ({
  default: { error: loggerErrorMock },
}));

import ResetPassword from '../ResetPassword';

const RESET_TOKEN = 'synthetic-reset-token';
const NEW_PASSWORD = 'ValidPass1!';
const TEST_EMAIL = 'reset-user@example.invalid';

function CurrentLocation() {
  const location = useLocation();
  return <output data-testid="current-location">{`${location.pathname}${location.search}`}</output>;
}

function renderResetPage(state: Record<string, unknown> = {
  email: TEST_EMAIL,
  resetToken: RESET_TOKEN,
  capturedAt: Date.now(),
}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/reset-password', state }]}>
      <ResetPassword />
      <CurrentLocation />
    </MemoryRouter>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByPlaceholderText('Create new password'), {
    target: { value: NEW_PASSWORD },
  });
  fireEvent.change(screen.getByPlaceholderText('Re-enter password'), {
    target: { value: NEW_PASSWORD },
  });
}

function submitForm() {
  const form = screen.getByRole('heading', { name: /reset your password/i }).closest('form');
  if (!form) throw new Error('Reset password form was not rendered');
  fireEvent.submit(form);
}

function expectResetTokenNotPersisted() {
  for (const storage of [localStorage, sessionStorage]) {
    const persistedValues = Array.from({ length: storage.length }, (_, index) => {
      const key = storage.key(index);
      return key ? storage.getItem(key) : null;
    });
    expect(persistedValues.join(' ')).not.toContain(RESET_TOKEN);
  }
}

beforeEach(() => {
  forgetResetPasswordMock.mockReset();
  extractBackendMessageMock.mockReset();
  extractBackendMessageMock.mockReturnValue('The reset request was rejected.');
  navigateMock.mockReset();
  toastMock.mockClear();
  loggerErrorMock.mockReset();
});

describe('ResetPassword page', () => {
  it('renders the reset form and password inputs', () => {
    renderResetPage();

    expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create new password')).toHaveAttribute('type', 'password');
    expect(screen.getByPlaceholderText('Re-enter password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /reset password/i })).toBeEnabled();
  });

  it('shows validation feedback and does not submit invalid fields', async () => {
    renderResetPage();

    await act(async () => submitForm());

    expect(screen.getByText('Password is required')).toBeVisible();
    expect(screen.getByText('Please confirm your password')).toBeVisible();
    expect(forgetResetPasswordMock).not.toHaveBeenCalled();
  });

  it('returns to the start of reset when router state has no reset token', async () => {
    renderResetPage({ email: TEST_EMAIL, capturedAt: Date.now() });
    fillValidForm();

    await act(async () => submitForm());

    expect(forgetResetPasswordMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/forget-password');
    expect(screen.getByTestId('current-location')).toHaveTextContent('/reset-password');
  });

  it('submits the router-state token with the reset payload, then navigates on success', async () => {
    forgetResetPasswordMock.mockResolvedValue('Password updated.');
    renderResetPage();
    fillValidForm();

    await act(async () => submitForm());

    expect(forgetResetPasswordMock).toHaveBeenCalledWith(TEST_EMAIL, RESET_TOKEN, NEW_PASSWORD);
    expect(toastMock.success).toHaveBeenCalledWith('Password updated.');
    expect(navigateMock).toHaveBeenCalledWith('/reset-success');
    expectResetTokenNotPersisted();
    expect(screen.getByTestId('current-location')).toHaveTextContent('/reset-password');
    expect(screen.getByTestId('current-location')).not.toHaveTextContent(RESET_TOKEN);
  });

  it('disables submission while pending and ignores duplicate submits', async () => {
    let resolveRequest!: (message: string) => void;
    forgetResetPasswordMock.mockReturnValue(new Promise<string>((resolve) => {
      resolveRequest = resolve;
    }));
    renderResetPage();
    fillValidForm();

    await act(async () => {
      submitForm();
    });

    expect(forgetResetPasswordMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled();

    await act(async () => submitForm());
    expect(forgetResetPasswordMock).toHaveBeenCalledTimes(1);

    await act(async () => resolveRequest('Updated.'));
  });

  it('shows extracted error feedback without logging or persisting the reset token', async () => {
    const apiError = { response: { data: { message: 'Reset rejected.' } } };
    forgetResetPasswordMock.mockRejectedValue(apiError);
    extractBackendMessageMock.mockReturnValue('Reset rejected.');
    renderResetPage();
    fillValidForm();

    await act(async () => submitForm());

    expect(extractBackendMessageMock).toHaveBeenCalledWith(
      apiError,
      expect.any(String),
    );
    expect(toastMock.error).toHaveBeenCalledWith('Reset rejected.');
    expect(navigateMock).toHaveBeenCalledWith('/forget-password');
    expect(loggerErrorMock).toHaveBeenCalledWith('Reset password error:', 'Reset rejected.');
    expect(loggerErrorMock.mock.calls.flat().join(' ')).not.toContain(RESET_TOKEN);
    expectResetTokenNotPersisted();
    expect(screen.getByTestId('current-location')).not.toHaveTextContent(RESET_TOKEN);
  });
});
