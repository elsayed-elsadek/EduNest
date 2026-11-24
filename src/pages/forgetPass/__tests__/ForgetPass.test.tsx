import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { forgetPasswordMock, navigateMock, toastMock } = vi.hoisted(() => ({
  forgetPasswordMock: vi.fn(),
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/authService', () => ({ forgetPassword: forgetPasswordMock }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigateMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import ForgetPass from '../ForgetPass';

function renderForgetPass() {
  return render(<MemoryRouter><ForgetPass /></MemoryRouter>);
}

async function submitRequest() {
  const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
  if (!form) throw new Error('Forgot-password form not rendered');
  await act(async () => { fireEvent.submit(form); });
}

beforeEach(() => {
  forgetPasswordMock.mockReset();
  navigateMock.mockReset();
  toastMock.mockClear();
});

describe('ForgetPass page integration', () => {
  it('renders an accessible email control and validates empty or malformed addresses', async () => {
    renderForgetPass();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();

    await submitRequest();
    expect(screen.getByText(/email is required/i)).toBeVisible();

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'not-an-email' } });
    await submitRequest();
    expect(screen.getByText(/valid email address/i)).toBeVisible();
    expect(forgetPasswordMock).not.toHaveBeenCalled();
  });

  it('shows success feedback and navigates with the entered email in router state', async () => {
    forgetPasswordMock.mockResolvedValue(undefined);
    renderForgetPass();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'forgot-test@example.invalid' },
    });

    await submitRequest();

    expect(forgetPasswordMock).toHaveBeenCalledWith('forgot-test@example.invalid');
    expect(toastMock.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/check-email', {
      state: { email: 'forgot-test@example.invalid' },
    });
  });

  it('reports an API failure through the existing toast feedback', async () => {
    forgetPasswordMock.mockRejectedValue({ response: { data: { message: 'Request unavailable.' } } });
    renderForgetPass();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'forgot-test@example.invalid' },
    });

    await submitRequest();

    expect(toastMock.error).toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('disables repeat requests during an API cooldown', async () => {
    forgetPasswordMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
        headers: { 'Retry-After': '8' },
      },
    });
    renderForgetPass();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'forgot-test@example.invalid' },
    });

    await submitRequest();

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDisabled();
    await submitRequest();
    expect(forgetPasswordMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the submit control disabled while the request is pending', async () => {
    let resolveRequest!: () => void;
    forgetPasswordMock.mockReturnValue(new Promise<void>((resolve) => { resolveRequest = resolve; }));
    renderForgetPass();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'forgot-test@example.invalid' },
    });

    await act(async () => {
      const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
      if (!form) throw new Error('Forgot-password form not rendered');
      fireEvent.submit(form);
    });

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    await act(async () => resolveRequest());
  });
});
