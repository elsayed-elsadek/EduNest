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
});
