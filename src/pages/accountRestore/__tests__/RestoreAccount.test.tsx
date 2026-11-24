import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendRestoreOtpMock, navigateMock, toastMock } = vi.hoisted(() => ({
  sendRestoreOtpMock: vi.fn(),
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/authService', () => ({
  sendRestoreOtp: sendRestoreOtpMock,
  confirmRestore: vi.fn(),
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigateMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import RestoreAccount from '../RestoreAccount';

function renderRestore() {
  return render(
    <MemoryRouter initialEntries={['/restore-account']}>
      <Routes>
        <Route path="/restore-account" element={<RestoreAccount />} />
        <Route path="/confirm-restore" element={<p>Confirm restore</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.removeItem('restoreEmail');
  sendRestoreOtpMock.mockReset();
  navigateMock.mockReset();
  toastMock.mockClear();
});

describe('RestoreAccount page integration', () => {
  it('validates required and malformed email without requesting a restore code', async () => {
    renderRestore();
    const email = screen.getByLabelText('E-mail');

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Restore Code' })));
    expect(screen.getByText(/email is required/i)).toBeVisible();

    fireEvent.change(email, { target: { value: 'bad-address' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Restore Code' })));
    expect(screen.getByText(/valid email/i)).toBeVisible();
    expect(sendRestoreOtpMock).not.toHaveBeenCalled();
  });

  it('uses a saved email, requests a code and navigates with the current email', async () => {
    localStorage.setItem('restoreEmail', 'restore-test@example.invalid');
    sendRestoreOtpMock.mockResolvedValue(true);
    renderRestore();

    expect(screen.getByLabelText('E-mail')).toHaveValue('restore-test@example.invalid');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Restore Code' })));

    expect(sendRestoreOtpMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/confirm-restore', {
      state: { email: 'restore-test@example.invalid' },
    });
  });

  it('keeps the page and announces failed OTP requests', async () => {
    sendRestoreOtpMock.mockRejectedValue({ response: { data: { message: 'Request unavailable.' } } });
    renderRestore();
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'restore-test@example.invalid' },
    });

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Restore Code' })));

    expect(sendRestoreOtpMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalled();
  });

  it('disables repeat requests during a server cooldown', async () => {
    sendRestoreOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
        headers: { 'Retry-After': '8' },
      },
    });
    renderRestore();
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'restore-test@example.invalid' },
    });

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Restore Code' })));
    expect(sendRestoreOtpMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Send Restore Code' })).toBeDisabled();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Send Restore Code' })));
    expect(sendRestoreOtpMock).toHaveBeenCalledTimes(1);
  });
});
