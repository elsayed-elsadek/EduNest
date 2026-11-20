import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendRestoreOtpMock, confirmRestoreMock, navigateMock, toastMock } = vi.hoisted(() => ({
  sendRestoreOtpMock: vi.fn(),
  confirmRestoreMock: vi.fn(),
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../services/authService', () => ({
  sendRestoreOtp: sendRestoreOtpMock,
  confirmRestore: confirmRestoreMock,
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigateMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import { useRestoreForm } from '../useRestoreForm';

beforeEach(() => {
  sendRestoreOtpMock.mockReset();
  confirmRestoreMock.mockReset();
  navigateMock.mockReset();
  toastMock.mockClear();
});

describe('useRestoreForm cooldown behavior', () => {
  it('uses the account-lock fallback and guards duplicate restore OTP submissions', async () => {
    sendRestoreOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_ACCOUNT_LOCKED', message: 'Locked.' },
        headers: {},
      },
    });
    const { result } = renderHook(() => useRestoreForm());
    act(() => result.current.handleInputChange('email', 'restore@example.com'));

    await act(async () => { await result.current.sendOtpHandler(); });
    expect(result.current.cooldown.remainingSeconds).toBe(300);
    await act(async () => { await result.current.sendOtpHandler(); });
    expect(sendRestoreOtpMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
