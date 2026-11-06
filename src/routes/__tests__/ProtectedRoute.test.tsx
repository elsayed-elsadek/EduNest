import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '../../store/authStore';

interface RenderOptions {
  isHydrated?: boolean;
  isAuthenticated?: boolean;
  userRole?: string;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

function renderProtectedRoute({
  isHydrated = true,
  isAuthenticated = false,
  userRole = '',
  allowedRoles,
  requireAuth,
}: RenderOptions = {}) {
  useAuthStore.setState({ isHydrated, isAuthenticated, userRole });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/mentor/dashboard" element={<p>mentor dashboard</p>} />
        <Route path="/student/dashboard" element={<p>student dashboard</p>} />
        <Route path="/admin/dashboard" element={<p>admin dashboard</p>} />
        <Route
          element={<ProtectedRoute allowedRoles={allowedRoles} requireAuth={requireAuth} />}
        >
          <Route path="/protected" element={<p>secret content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
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

    expect(screen.getByText('login page')).toBeInTheDocument();
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

  it('redirects an admin away from an admin-only route when the role is missing', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: '',
      allowedRoles: ['ROLE_ADMIN'],
    });

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('lets an admin through an admin-only route', () => {
    renderProtectedRoute({
      isAuthenticated: true,
      userRole: 'ROLE_ADMIN',
      allowedRoles: ['ROLE_ADMIN'],
    });

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });

  it('renders public nested routes when requireAuth is false', () => {
    renderProtectedRoute({
      isAuthenticated: false,
      userRole: '',
      requireAuth: false,
    });

    expect(screen.getByText('secret content')).toBeInTheDocument();
  });
});
