import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { forgetPasswordMock, navigateMock, toastMock } = vi.hoisted(() => ({
  forgetPasswordMock: vi.fn(),
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../services/authService', () => ({ forgetPassword: forgetPasswordMock }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigateMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import { useForgetPassForm } from '../useForgetPassForm';

beforeEach(() => {
  forgetPasswordMock.mockReset();
  navigateMock.mockReset();
  toastMock.mockClear();
});

describe('useForgetPassForm cooldown behavior', () => {
  it('applies Retry-After and guards repeated password-reset OTP requests', async () => {
    forgetPasswordMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
        headers: { 'Retry-After': '9' },
      },
    });
    const { result } = renderHook(() => useForgetPassForm());
    act(() => result.current.handleInputChange('email', 'user@example.com'));
    const event = { preventDefault: vi.fn() } as never;

    await act(async () => { await result.current.handleSubmit(event); });
    expect(result.current.cooldown.remainingSeconds).toBe(9);
    expect(result.current.requestError).toBe('You can try again in 0:09');

    await act(async () => { await result.current.handleSubmit(event); });
    expect(forgetPasswordMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
