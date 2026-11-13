import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders the default loading message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a custom message and submessage', () => {
    render(
      <LoadingSpinner
        message="Preparing your mentorship…"
        submessage="This will only take a moment."
      />,
    );

    expect(screen.getByText('Preparing your mentorship…')).toBeInTheDocument();
    expect(screen.getByText('This will only take a moment.')).toBeInTheDocument();
  });

  it('omits the submessage element when none is supplied', () => {
    const { container } = render(<LoadingSpinner message="Loading dashboard" />);

    // Only the message paragraph is rendered inside the text block.
    expect(container.querySelectorAll('p')).toHaveLength(1);
    expect(screen.getByText('Loading dashboard')).toBeInTheDocument();
  });

  it.each([
    ['sm', 'w-10 h-10'],
    ['md', 'w-14 h-14'],
    ['lg', 'w-16 h-16'],
  ])('applies the requested %s size', (size, expectedClass) => {
    const { container } = render(
      <LoadingSpinner size={size as 'sm' | 'md' | 'lg'} />,
    );

    const sizedWrapper = container.querySelector(`.${expectedClass.split(' ')[0]}`);
    expect(sizedWrapper).not.toBeNull();
  });

  it('renders the full-screen variant when requested', () => {
    const { container } = render(<LoadingSpinner fullScreen />);

    expect(container.firstElementChild).toHaveClass('min-h-screen');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the inline variant (not full screen) by default', () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.firstElementChild).toHaveClass('min-h-[400px]');
    expect(container.firstElementChild).not.toHaveClass('min-h-screen');
  });
});
