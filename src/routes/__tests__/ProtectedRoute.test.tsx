import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '../../store/authStore';

interface RenderOptions {
  isHydrated?: boolean;
  isAuthenticated?: boolean;
  userRole?: string;
  token?: string;
  allowedRoles?: string[];
  requireAuth?: boolean;
  initialPath?: string;
}

/** Login route that surfaces the `reason` query param so expired-session redirects can be asserted. */
function LoginProbe(): ReactElement {
  const [params] = useSearchParams();
  const location = useLocation();
  const reason = params.get('reason');
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  return <p>login page{reason ? `:${reason}` : ''}{from ? ` from:${from}` : ''}</p>;
}

function renderProtectedRoute({
  isHydrated = true,
  isAuthenticated = false,
  userRole = '',
  token = '',
  allowedRoles,
  requireAuth,
  initialPath = '/protected',
}: RenderOptions = {}) {
  useAuthStore.setState({ isHydrated, isAuthenticated, userRole, token });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route path="/unauthorized" element={<p>unauthorized page</p>} />
        <Route path="/mentor/dashboard" element={<p>mentor dashboard</p>} />
        <Route path="/student/dashboard" element={<p>student dashboard</p>} />
        <Route path="/admin/dashboard" element={<p>admin dashboard</p>} />
        <Route
          element={<ProtectedRoute allowedRoles={allowedRoles} requireAuth={requireAuth} />}
        >
          <Route path="/protected" element={<p>secret content</p>} />
          <Route path="/admin/users" element={<p>admin users</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

/** Base64URL-encodes a UTF-8 string. */
function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload: Record<string, unknown>): string {
  return [
    toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
    toBase64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // The persisted store starts empty; reset it before every scenario.
    useAuthStore.setState({
      token: '',
      isAuthenticated: false,
      isHydrated: true,
      userRole: '',
    });
  });

  it('renders nothing while the auth store is still hydrating', () => {
    const { container } = renderProtectedRoute({ isHydrated: false });

    expect(container).toBeEmptyDOMElement();
  });

  it('redirects an unauthenticated visitor to /login', () => {
    renderProtectedRoute({ isAuthenticated: false });

    expect(screen.getByText('login page from:/protected')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('renders the nested route for an authenticated user without role restrictions', () => {
    renderProtectedRoute({ isAuthenticated: true, userRole: 'ROLE_STUDENT' });

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('renders the nested route when the user role is allowed', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: 'ROLE_MENTOR',
      allowedRoles: ['ROLE_MENTOR'],
    });

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('redirects a student away from a mentor-only route to the student dashboard', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: 'ROLE_STUDENT',
      allowedRoles: ['ROLE_MENTOR'],
    });

    expect(screen.getByText('student dashboard')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('redirects a mentor away from a student-only route to the mentor dashboard', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: 'ROLE_MENTOR',
      allowedRoles: ['ROLE_STUDENT'],
    });

    expect(screen.getByText('mentor dashboard')).toBeInTheDocument();
  });

  it('sends a signed-in account with an unknown role to the unauthorized page', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: '',
      allowedRoles: ['ROLE_ADMIN'],
    });

    expect(screen.getByText('unauthorized page')).toBeInTheDocument();
  });

  it('lets an admin through an admin-only route', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: 'ROLE_ADMIN',
      allowedRoles: ['ROLE_ADMIN'],
    });

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('keeps a student out of an admin route without rendering protected content', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: 'ROLE_STUDENT',
      allowedRoles: ['ROLE_ADMIN'],
    });

    expect(screen.getByText('student dashboard')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
    expect(screen.queryByText('admin dashboard')).not.toBeInTheDocument();
  });

  it('preserves a guest deep link through the login redirect', () => {
    renderProtectedRoute({
      isAuthenticated: false,
      initialPath: '/admin/users',
    });

    expect(screen.getByText('login page from:/admin/users')).toBeInTheDocument();
  });

  it('renders public nested routes when requireAuth is false', () => {
    renderProtectedRoute({
      isAuthenticated: false,
      userRole: '',
      requireAuth: false,
    });

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  describe('FE-008 — token validity', () => {
    it('sends a user with an expired token to /login with a session-expired reason', () => {
      const expiredToken = makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });

      renderProtectedRoute({
        isAuthenticated: true,
        userRole: 'ROLE_STUDENT',
        token: expiredToken,
      });

      expect(screen.getByText('login page:expired from:/protected')).toBeInTheDocument();
      expect(screen.queryByText('secret content')).not.toBeInTheDocument();
    });

    it('treats a malformed token as unauthenticated', () => {
      renderProtectedRoute({
        isAuthenticated: true,
        userRole: 'ROLE_STUDENT',
        token: 'garbage',
      });

      expect(screen.getByText('login page:expired from:/protected')).toBeInTheDocument();
      expect(screen.queryByText('secret content')).not.toBeInTheDocument();
    });

    it('keeps the session for a user whose token has a future expiry', () => {
      const validToken = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });

      renderProtectedRoute({
        isAuthenticated: true,
        userRole: 'ROLE_STUDENT',
        token: validToken,
      });

      expect(screen.getByText('secret content')).toBeInTheDocument();
    });

    it('keeps the session for a token without an exp claim (defer to 401s)', () => {
      renderProtectedRoute({
        isAuthenticated: true,
        userRole: 'ROLE_STUDENT',
        token: makeToken({ sub: '1' }),
      });

      expect(screen.getByText('secret content')).toBeInTheDocument();
    });
  });
});
