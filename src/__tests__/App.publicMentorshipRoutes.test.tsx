import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

vi.mock('../pages/student-pages/ExploreMentorships', () => ({
  default: () => <div>public mentorship catalog</div>,
}));

import App from '../App';

describe('public mentorship catalog routes', () => {
  beforeEach(() => {
    useAuthStore.setState({ isHydrated: true, isAuthenticated: false, token: '', userRole: '' });
  });
  afterEach(() => cleanup());

  it.each(['/mentorships', '/explore-mentorships'])(
    'renders the public catalog at %s without authentication', async (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );

      expect(await screen.findByText('public mentorship catalog')).toBeInTheDocument();
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    },
  );
});
