import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { verifyOtpMock, forgetPasswordMock } = vi.hoisted(() => ({
  verifyOtpMock: vi.fn(),
  forgetPasswordMock: vi.fn(),
}));

vi.mock('../../../services/authService', () => ({
  forgetPasswordVerifyOtp: verifyOtpMock,
  forgetPassword: forgetPasswordMock,
  extractBackendMessage: () => 'Backend error',
}));

import CheckEmail from '../CheckEmail';

beforeEach(() => {
  verifyOtpMock.mockReset();
  forgetPasswordMock.mockReset();
});

describe('CheckEmail rate limits', () => {
  it('shows the rate-limit countdown and disables repeat OTP verification', async () => {
    verifyOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Backend wording.' },
        headers: { 'Retry-After': '47' },
      },
    });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/check-email', state: { email: 'user@example.com' } }]}>
        <CheckEmail />
      </MemoryRouter>,
    );

    for (const input of screen.getAllByRole('textbox')) {
      fireEvent.change(input, { target: { value: '1' } });
    }
    const confirm = screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement;
    await act(async () => { fireEvent.click(confirm); });
    expect(verifyOtpMock).toHaveBeenCalledTimes(1);
    expect(confirm.disabled).toBe(true);
    expect(screen.getByText('You can try again in 0:47')).toBeTruthy();

    fireEvent.click(confirm);
    expect(verifyOtpMock).toHaveBeenCalledTimes(1);
  });
});
