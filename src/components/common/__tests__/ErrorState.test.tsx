import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from '../ErrorState';

describe('ErrorState', () => {
  it('renders the default title and the message', () => {
    render(<ErrorState message="Could not load mentorships." />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Could not load mentorships.')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<ErrorState title="Network error" message="Please try again." />);

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('renders a retry button and calls onRetry', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="Failed" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when no handler is supplied', () => {
    render(<ErrorState message="Failed" />);

    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
  });

  it('applies the full-size layout only when requested', () => {
    const { container, rerender } = render(<ErrorState message="Failed" />);
    expect(container.firstElementChild).toHaveClass('p-8');
    expect(container.firstElementChild).not.toHaveClass('min-h-[400px]');

    rerender(<ErrorState message="Failed" fullSize />);
    expect(container.firstElementChild).toHaveClass('min-h-[400px]');
  });
});
