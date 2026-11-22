import { fireEvent, render, screen, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { registerStudentMock, registerMentorMock, sendOtpMock, navigateMock, toastMock } = vi.hoisted(() => ({
  registerStudentMock: vi.fn(),
  registerMentorMock: vi.fn(),
  sendOtpMock: vi.fn(),
  navigateMock: vi.fn(),
  toastMock: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/authService', () => ({
  registerStudent: registerStudentMock,
  registerMentor: registerMentorMock,
  sendOtp: sendOtpMock,
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigateMock,
}));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import Register from '../Register';

beforeEach(() => {
  registerStudentMock.mockReset();
  registerMentorMock.mockReset();
  sendOtpMock.mockReset();
  navigateMock.mockReset();
  toastMock.mockClear();
});

describe('Register rate limits', () => {
  it('disables registration and guards repeated submits during a server cooldown', async () => {
    registerStudentMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
        headers: { 'Retry-After': '17' },
      },
    });
    const { container } = render(<MemoryRouter><Register /></MemoryRouter>);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Sara' } });
    fireEvent.change(inputs[1], { target: { value: 'Ali' } });
    fireEvent.change(inputs[2], { target: { value: 'sara@example.com' } });
    fireEvent.change(inputs[3], { target: { value: '01012345678' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'FRESH' } });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    const form = container.querySelector('form');
    if (!form) throw new Error('Registration form not rendered');
    await act(async () => { fireEvent.submit(form); });
    expect(registerStudentMock).toHaveBeenCalledTimes(1);
    const submit = screen.getByRole('button', { name: 'Register' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toBe('You can try again in 0:17');

    await act(async () => { fireEvent.submit(form); });
    expect(registerStudentMock).toHaveBeenCalledTimes(1);
  });
});

describe('Register ERR_VALIDATION field mapping', () => {
  it('maps verified registration DTO fields inline without sending UI-only fields', async () => {
    registerStudentMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errorCode: 'ERR_VALIDATION',
          message: 'Validation failed.',
          fields: { phoneNumber: 'Use a valid phone number.', unknownBackendField: 'Ignore this field.' },
        },
      },
    });
    const { container } = render(<MemoryRouter><Register /></MemoryRouter>);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Sara' } });
    fireEvent.change(inputs[1], { target: { value: 'Ali' } });
    fireEvent.change(inputs[2], { target: { value: 'sara@example.com' } });
    fireEvent.change(inputs[3], { target: { value: '01012345678' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'FRESH' } });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    const form = container.querySelector('form');
    if (!form) throw new Error('Registration form not rendered');
    await act(async () => { fireEvent.submit(form); });

    expect(await screen.findByText('Use a valid phone number.')).toBeTruthy();
    expect(screen.queryByText('Ignore this field.')).toBeNull();
  });
});

async function submitValidRegistration() {
  registerStudentMock.mockResolvedValue({ message: 'Registered.' });
  const { container } = render(<MemoryRouter><Register /></MemoryRouter>);
  const inputs = screen.getAllByRole('textbox');
  fireEvent.change(inputs[0], { target: { value: 'Sara' } });
  fireEvent.change(inputs[1], { target: { value: 'Ali' } });
  fireEvent.change(inputs[2], { target: { value: 'sara@example.com' } });
  fireEvent.change(inputs[3], { target: { value: '01012345678' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'secret1' } });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'FRESH' } });
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  const form = container.querySelector('form');
  if (!form) throw new Error('Registration form not rendered');
  await act(async () => { fireEvent.submit(form); });
}

describe('Register Send OTP contract', () => {
  it('shows fields.email inline and stays on Register when Send OTP validation fails', async () => {
    sendOtpMock.mockRejectedValue({
      response: {
        status: 400,
        data: { errorCode: 'ERR_VALIDATION', message: 'Validation failed.', fields: { email: 'Email cannot receive a code.' } },
      },
    });

    await submitValidRegistration();

    expect(await screen.findByText('Email cannot receive a code.')).toBeTruthy();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('navigates to Verify after Send OTP succeeds', async () => {
    sendOtpMock.mockResolvedValue({ message: 'Code sent.' });

    await submitValidRegistration();

    expect(sendOtpMock).toHaveBeenCalledWith('sara@example.com');
    expect(navigateMock).toHaveBeenCalledWith('/verify');
  });

  it('keeps the registration page and honors Retry-After when Send OTP is rate limited', async () => {
    sendOtpMock.mockRejectedValue({
      response: {
        status: 429,
        data: { errorCode: 'ERR_RATE_LIMITED', message: 'Slow down.' },
        headers: { 'Retry-After': '17' },
      },
    });

    await submitValidRegistration();

    expect(navigateMock).not.toHaveBeenCalled();
    expect((await screen.findByRole('status')).textContent).toBe('You can try again in 0:17');
  });
});
