import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import OfflineBanner from '../OfflineBanner';

afterEach(() => {
  cleanup();
});

describe('OfflineBanner', () => {
  it('is hidden while the browser is online', () => {
    render(<OfflineBanner />);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('appears when the browser goes offline and recovers on reconnect', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const banner = screen.getByRole('status');
    expect(banner.textContent).toContain("You're offline");

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('appears immediately when rendered while already offline', () => {
    const original = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toBeTruthy();

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: original });
  });
});
