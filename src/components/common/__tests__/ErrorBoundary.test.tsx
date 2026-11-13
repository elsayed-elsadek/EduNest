import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { reportError } from '../../../utils/errorReporting';

vi.mock('../../../utils/errorReporting', () => ({
  reportError: vi.fn(),
}));

function ThrowingChild(): React.ReactElement {
  throw new Error('boom');
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.location.hash = '';
});

describe('ErrorBoundary', () => {
  it('renders children untouched when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>fine content</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('fine content')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('shows the fallback when a child throws, while siblings outside the boundary keep working', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <div>
        {/* Simulates the app shell (navbar/sidebar) outside the boundary */}
        <p>shell is still here</p>
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>
      </div>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go home' })).toBeTruthy();
    expect(screen.getByText('shell is still here')).toBeTruthy();

    consoleSpy.mockRestore();
  });

  it('reports the caught error through the single reporting sink', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(reportError).toHaveBeenCalledTimes(1);
    const [errorArg, contextArg] = vi.mocked(reportError).mock.calls[0];
    expect(errorArg).toBeInstanceOf(Error);
    expect((errorArg as Error).message).toBe('boom');
    expect(contextArg?.componentStack).toBeTruthy();

    consoleSpy.mockRestore();
  });

  it('Reload and Go home buttons use window.location without the router', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const reloadSpy = vi.fn();

    // jsdom's window.location.reload cannot be spied on directly — replace
    // the whole location object with a controllable fake, then restore.
    const realLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...realLocation, reload: reloadSpy, href: 'http://localhost/' },
      writable: true,
    });

    try {
      render(
        <ErrorBoundary>
          <ThrowingChild />
        </ErrorBoundary>,
      );

      await user.click(screen.getByRole('button', { name: 'Reload page' }));
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: realLocation,
        writable: true,
      });
      consoleSpy.mockRestore();
    }
  });

  it('renders a custom fallback when one is provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('custom fallback')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();

    consoleSpy.mockRestore();
  });
});
