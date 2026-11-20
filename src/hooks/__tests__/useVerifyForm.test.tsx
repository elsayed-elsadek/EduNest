import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyOtpMock, sendOtpMock, toastMock } = vi.hoisted(() => ({
  verifyOtpMock: vi.fn(),
  sendOtpMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../services/authService', () => ({ verifyOtp: verifyOtpMock, sendOtp: sendOtpMock }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import { useVerifyForm } from '../useVerifyForm';

beforeEach(() => {
  localStorage.setItem('registrationEmail', 'student@example.com');
  verifyOtpMock.mockReset();
  sendOtpMock.mockReset();
  toastMock.mockClear();
});

describe('useVerifyForm cooldown behavior', () => {
  it('applies a 429 cooldown and protects verify and resend handlers from repeat calls', async () => {
    verifyOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_ACCOUNT_LOCKED', message: 'Locked.' },
        headers: { 'Retry-After': '2' },
      },
    });
    const { result } = renderHook(() => useVerifyForm());
    for (const index of [0, 1, 2, 3, 4, 5]) {
      act(() => result.current.handleChange(index, '1'));
    }

    await act(async () => { await result.current.handleSubmit(); });
    expect(result.current.cooldown.remainingSeconds).toBe(2);
    expect(verifyOtpMock).toHaveBeenCalledTimes(1);

    await act(async () => { await result.current.handleSubmit(); });
    await act(async () => { await result.current.handleResend(); });
    expect(verifyOtpMock).toHaveBeenCalledTimes(1);
    expect(sendOtpMock).not.toHaveBeenCalled();
  });
});
