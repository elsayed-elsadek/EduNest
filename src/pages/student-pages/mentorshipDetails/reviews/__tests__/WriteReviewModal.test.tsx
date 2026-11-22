import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutateMock } = vi.hoisted(() => ({ mutateMock: vi.fn() }));

vi.mock('../../../../../services/student-roleService/mentorshipReviews.api', () => ({
  useRateMentorship: () => ({ mutate: mutateMock, isPending: false, isError: false, error: null }),
}));
vi.mock('../StarPicker', () => ({
  StarPicker: ({ onChange }: { onChange: (rating: number) => void }) => (
    <button type="button" onClick={() => onChange(4)}>Choose rating</button>
  ),
}));

import { WriteReviewModal } from '../WriteReviewModal';

describe('WriteReviewModal validation field mapping', () => {
  beforeEach(() => mutateMock.mockReset());

  it('maps verified rating and feedback DTO errors to their controls', async () => {
    render(<WriteReviewModal mentorshipId={7} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose rating' }));
    fireEvent.change(screen.getByPlaceholderText('Share your experience with this mentorship...'), {
      target: { value: 'My review' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    const onError = mutateMock.mock.calls[0][1].onError as (error: unknown) => void;
    await act(async () => onError({
      response: {
        status: 400,
        data: {
          errorCode: 'ERR_VALIDATION',
          message: 'Validation failed.',
          fields: { rating: 'Rating must be between 1 and 5.', feedback: 'Feedback is too long.', unknown: 'Ignore.' },
        },
      },
    }));

    expect(screen.getByText('Rating must be between 1 and 5.')).toBeTruthy();
    expect(screen.getByText('Feedback is too long.')).toBeTruthy();
    expect(screen.queryByText('Ignore.')).toBeNull();
  });
});
