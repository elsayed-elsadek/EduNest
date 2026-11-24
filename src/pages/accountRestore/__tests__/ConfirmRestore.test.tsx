import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { confirmRestoreMock, sendRestoreOtpMock, toastMock } = vi.hoisted(() => ({
  confirmRestoreMock: vi.fn(),
  sendRestoreOtpMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/authService', () => ({
  confirmRestore: confirmRestoreMock,
  sendRestoreOtp: sendRestoreOtpMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import ConfirmRestore from '../ConfirmRestore';

beforeEach(() => {
  confirmRestoreMock.mockReset();
  sendRestoreOtpMock.mockReset();
  toastMock.mockClear();
});

describe('ConfirmRestore rate limits', () => {
  it('shows Retry-After and disables repeat confirmation during cooldown', async () => {
    confirmRestoreMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_ACCOUNT_LOCKED', message: 'Backend wording is not used for the countdown.' },
        headers: { 'Retry-After': '299' },
      },
    });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirm-restore', state: { email: 'restore@example.com' } }]}>
        <ConfirmRestore />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByRole('textbox');
    for (const input of inputs) fireEvent.change(input, { target: { value: '1' } });
    const confirm = screen.getByRole('button', { name: 'Restore Account' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(false);

    await act(async () => { fireEvent.click(confirm); });
    expect(confirmRestoreMock).toHaveBeenCalledTimes(1);
    expect(confirm.disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toBe('Account temporarily locked. Try again in 4:59.');

    fireEvent.click(confirm);
    expect(confirmRestoreMock).toHaveBeenCalledTimes(1);
  });

  it('names each restore-code field and announces a failed confirmation accessibly', async () => {
    confirmRestoreMock.mockRejectedValue({ response: { data: { message: 'Code was rejected.' } } });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirm-restore', state: { email: 'restore-test@example.invalid' } }]}>
        <ConfirmRestore />
      </MemoryRouter>,
    );
    const inputs = Array.from({ length: 6 }, (_, index) => screen.getByRole('textbox', {
      name: `Restore code digit ${index + 1} of 6`,
    }));
    inputs.forEach((input, index) => fireEvent.change(input, { target: { value: String(index + 1) } }));

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Restore Account' })));

    expect(confirmRestoreMock).toHaveBeenCalledWith('restore-test@example.invalid', '123456');
    expect(screen.getByRole('alert')).toHaveTextContent('Code was rejected.');
  });

  it('confirms successfully and navigates to login', async () => {
    confirmRestoreMock.mockResolvedValue(undefined);
    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirm-restore', state: { email: 'restore-test@example.invalid' } }]}>
        <ConfirmRestore />
      </MemoryRouter>,
    );
    Array.from({ length: 6 }, (_, index) => screen.getByRole('textbox', {
      name: `Restore code digit ${index + 1} of 6`,
    })).forEach((input, index) => fireEvent.change(input, { target: { value: String(index + 1) } }));

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Restore Account' })));

    expect(confirmRestoreMock).toHaveBeenCalledWith('restore-test@example.invalid', '123456');
    expect(toastMock.success).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Restore Account' })).toBeInTheDocument();
  });

  it('resends the code after the initial timer expires', async () => {
    vi.useFakeTimers();
    sendRestoreOtpMock.mockResolvedValue(undefined);
    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirm-restore', state: { email: 'restore-test@example.invalid' } }]}>
        <ConfirmRestore />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /resend code in/i })).toBeDisabled();
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Resend restore code' })));

    expect(sendRestoreOtpMock).toHaveBeenCalledWith('restore-test@example.invalid');
    expect(toastMock.success).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
