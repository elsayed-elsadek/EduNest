import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendContactMock, toastMock } = vi.hoisted(() => ({
  sendContactMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../services/contactService', () => ({ sendContact: sendContactMock }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import ContactUsSection from '../ContactUsSection';

describe('ContactUsSection validation mapping', () => {
  beforeEach(() => {
    sendContactMock.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it('maps verified contact DTO fields and sends strings instead of nulls', async () => {
    sendContactMock.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errorCode: 'ERR_VALIDATION',
          message: 'Validation failed.',
          fields: { email: 'Enter a valid email.', unexpected: 'Ignore this field.' },
        },
      },
    });
    render(<ContactUsSection />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'A' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '01012345678' } });
    fireEvent.change(screen.getByPlaceholderText('Message'), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(sendContactMock).toHaveBeenCalled());
    expect(sendContactMock.mock.calls[0][0]).toEqual({
      name: 'A', email: 'a@example.com', phone: '01012345678', message: 'Hello there',
    });
    expect(await screen.findByText('Enter a valid email.')).toBeTruthy();
    expect(screen.queryByText('Ignore this field.')).toBeNull();
  });
});
