import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyOtpMock, sendOtpMock, toastMock } = vi.hoisted(() => ({
  verifyOtpMock: vi.fn(),
  sendOtpMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/authService', () => ({
  verifyOtp: verifyOtpMock,
  sendOtp: sendOtpMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import { Verify } from '../Verify';

function renderVerify() {
  return render(
    <MemoryRouter initialEntries={['/verify']}>
      <Routes>
        <Route path="/verify" element={<Verify />} />
        <Route path="/success" element={<p>Verification complete</p>} />
        <Route path="/register" element={<p>Registration page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function enterCode(code = '123456') {
  [...screen.getAllByRole('textbox')].forEach((input, index) => {
    fireEvent.change(input, { target: { value: code[index] } });
  });
}

beforeEach(() => {
  localStorage.setItem('registrationEmail', 'verify-test@example.invalid');
  verifyOtpMock.mockReset();
  sendOtpMock.mockReset();
  toastMock.mockClear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Verify page integration', () => {
  it('provides named OTP controls and exposes invalid-code feedback as an alert', async () => {
    verifyOtpMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errorCode: 'ERR_VALIDATION',
          message: 'Invalid code.',
          fields: { otp: 'The code was not accepted.' },
        },
      },
    });
    renderVerify();
    enterCode();

    expect(screen.getByRole('textbox', { name: 'Verification code digit 1 of 6' })).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Confirm' })));

    expect(screen.getByRole('alert')).toHaveTextContent('The code was not accepted.');
    expect(verifyOtpMock).toHaveBeenCalledWith('verify-test@example.invalid', '123456');
    expect(screen.queryByText('Verification complete')).not.toBeInTheDocument();
  });

  it('shows success and follows the existing delayed success navigation without assuming a token response', async () => {
    vi.useFakeTimers();
    verifyOtpMock.mockResolvedValue({ apiResponse: { message: 'Verified.' } });
    renderVerify();
    enterCode();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Confirm' })));

    expect(screen.getByText(/code verified/i)).toBeVisible();
    expect(verifyOtpMock).toHaveBeenCalledWith('verify-test@example.invalid', '123456');
    expect(localStorage.getItem('registrationEmail')).toBeNull();
    expect(screen.queryByText('Verification complete')).not.toBeInTheDocument();

    await act(async () => vi.advanceTimersByTimeAsync(1500));
    expect(screen.getByText('Verification complete')).toBeInTheDocument();
  });

  it('keeps resend disabled during the initial timer, then reports resend success', async () => {
    vi.useFakeTimers();
    sendOtpMock.mockResolvedValue(undefined);
    const view = renderVerify();

    expect(screen.getByRole('button', { name: /resend code/i })).toBeDisabled();
    await act(async () => vi.advanceTimersByTimeAsync(120_000));
    const resend = screen.getByRole('button', { name: 'Resend code' });
    expect(resend).toBeEnabled();

    await act(async () => fireEvent.click(resend));
    expect(sendOtpMock).toHaveBeenCalledWith('verify-test@example.invalid');
    expect(toastMock.success).toHaveBeenCalled();
    view.unmount();
  });

  it('shows resend failure feedback without navigating away', async () => {
    vi.useFakeTimers();
    sendOtpMock.mockRejectedValue({ response: { data: { message: 'Resend unavailable.' } } });
    const view = renderVerify();
    await act(async () => vi.advanceTimersByTimeAsync(120_000));

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Resend code' })));

    expect(screen.getByText('Resend unavailable.')).toBeVisible();
    expect(screen.queryByText('Registration page')).not.toBeInTheDocument();
    view.unmount();
  });

  it('respects a server retry cooldown and disables confirm and resend controls', async () => {
    vi.useFakeTimers();
    verifyOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
        headers: { 'Retry-After': '2' },
      },
    });
    const view = renderVerify();
    enterCode();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Confirm' })));

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /resend code/i })).toBeDisabled();
    view.unmount();
  });
});
