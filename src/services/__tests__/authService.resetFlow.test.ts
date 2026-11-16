import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiPost = vi.fn();

vi.mock('../api', () => ({
  default: { post: (...args: unknown[]) => apiPost(...args) },
}));

import {
  extractBackendMessage,
  forgetPasswordVerifyOtp,
  forgetResetPassword,
} from '../authService';

describe('forgetPasswordVerifyOtp', () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it('posts email + otp and returns the resetToken and message from the apiResponse envelope', async () => {
    apiPost.mockResolvedValue({
      data: { apiResponse: { resetToken: 'tok_abc', message: 'OTP verified' } },
    });

    const result = await forgetPasswordVerifyOtp('a@b.com', '123456');

    expect(apiPost).toHaveBeenCalledWith('forget-password/verify-otp', {
      email: 'a@b.com',
      otp: '123456',
    });
    expect(result).toEqual({ resetToken: 'tok_abc', message: 'OTP verified' });
  });

  it('falls back to an empty message when the backend omits it', async () => {
    apiPost.mockResolvedValue({ data: { apiResponse: { resetToken: 'tok_abc' } } });

    const result = await forgetPasswordVerifyOtp('a@b.com', '123456');

    expect(result.message).toBe('');
  });

  it('rejects when the response carries no resetToken (never returns an empty token)', async () => {
    apiPost.mockResolvedValue({ data: { apiResponse: { message: 'ok' } } });

    await expect(forgetPasswordVerifyOtp('a@b.com', '123456')).rejects.toThrow(
      /no reset token/i
    );
    await expect(forgetPasswordVerifyOtp('a@b.com', '123456')).rejects.toThrow(
      /no reset token/i
    );
  });
});

describe('forgetResetPassword', () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it('posts email + resetToken + newPassword (the required ResetPasswordRequestDto)', async () => {
    apiPost.mockResolvedValue({ data: { apiResponse: { message: 'Password updated' } } });

    const message = await forgetResetPassword('a@b.com', 'tok_abc', 'NewP@ssw0rd');

    expect(apiPost).toHaveBeenCalledWith('forget-password/reset', {
      email: 'a@b.com',
      resetToken: 'tok_abc',
      newPassword: 'NewP@ssw0rd',
    });
    expect(message).toBe('Password updated');
  });

  it('returns an empty string when the backend omits the success message', async () => {
    apiPost.mockResolvedValue({ data: {} });

    const message = await forgetResetPassword('a@b.com', 'tok_abc', 'NewP@ssw0rd');

    expect(message).toBe('');
  });
});

describe('extractBackendMessage', () => {
  it('prefers the unified error envelope (errorMessages.error)', () => {
    const error = { response: { data: { errorMessages: { error: 'field issue' } } } };
    expect(extractBackendMessage(error, 'fallback')).toBe('field issue');
  });

  it('reads apiResponse.message and plain message shapes', () => {
    expect(
      extractBackendMessage({ response: { data: { apiResponse: { message: 'expired' } } } }, 'x')
    ).toBe('expired');
    expect(extractBackendMessage({ response: { data: { message: 'bad otp' } } }, 'x')).toBe(
      'bad otp'
    );
    expect(extractBackendMessage({ message: 'Network Error' }, 'x')).toBe('Network Error');
  });

  it('falls back when nothing usable exists', () => {
    expect(extractBackendMessage(undefined, 'Something went wrong.')).toBe(
      'Something went wrong.'
    );
    expect(extractBackendMessage({}, 'fallback')).toBe('fallback');
  });
});
