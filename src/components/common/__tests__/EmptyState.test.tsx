import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title and message', () => {
    render(<EmptyState title="No mentorships yet" message="Join a mentorship to get started." />);

    expect(screen.getByText('No mentorships yet')).toBeInTheDocument();
    expect(screen.getByText('Join a mentorship to get started.')).toBeInTheDocument();
  });

  it('renders a custom icon when one is provided', () => {
    render(
      <EmptyState icon={<span data-testid="custom-icon">★</span>} title="Empty" message="Nothing here" />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders a default icon when no icon is provided', () => {
    const { container } = render(<EmptyState title="Empty" message="Nothing here" />);

    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders an action button and calls its handler', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(
      <EmptyState
        title="Empty"
        message="Nothing here"
        actionLabel="Browse all"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Browse all' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omits the action button when no handler is supplied', () => {
    render(<EmptyState title="Empty" message="Nothing here" actionLabel="Browse all" />);

    expect(screen.queryByRole('button', { name: 'Browse all' })).not.toBeInTheDocument();
  });

  it('applies the full-size layout only when requested', () => {
    const { container, rerender } = render(<EmptyState title="Empty" message="Nothing here" />);
    expect(container.firstElementChild).not.toHaveClass('min-h-[400px]');

    rerender(<EmptyState title="Empty" message="Nothing here" fullSize />);
    expect(container.firstElementChild).toHaveClass('min-h-[400px]');
  });
});
