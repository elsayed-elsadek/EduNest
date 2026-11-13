import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotFound from '../NotFound';

afterEach(() => {
  cleanup();
});

function renderNotFound(initialEntry = '/some/unknown/deep/link') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div id="home-stub">home stub</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NotFound (404)', () => {
  it('offers a direct path home that works from a deep link (no history loop)', () => {
    renderNotFound();

    const goHome = screen.getByRole('button', { name: 'Go home' });
    expect(goHome).toBeTruthy();

    // Directly opening a deep link means history.length may be 1 — the home
    // CTA must still navigate, which is exactly what it does here.
    fireEvent.click(goHome);

    expect(screen.getByText('home stub')).toBeTruthy();
  });

  it('keeps a secondary go-back affordance', () => {
    renderNotFound();

    expect(screen.getByRole('button', { name: 'Go back' })).toBeTruthy();
  });

  it('shows a friendly message for unknown pages', () => {
    renderNotFound();

    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeTruthy();
  });
});
