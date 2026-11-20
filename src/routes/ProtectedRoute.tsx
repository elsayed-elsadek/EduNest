import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isTokenValid } from '../utils/jwt';
import { getDashboardPath } from './routeUtils';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requireAuth = true
}) => {
  const location = useLocation();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);
  const token = useAuthStore((state) => state.token);

  // Return a generic loader or null while Zustand restores state from local storage
  if (!isHydrated) {
    return null;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // FE-008: an expired or malformed token must be treated as unauthenticated —
  // land on /login with a "session expired" reason instead of rendering content.
  if (requireAuth && token && !isTokenValid(token)) {
    return <Navigate to="/login?reason=expired" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Client-side role checks are UX only; API authorization remains
      // authoritative. Unknown or missing roles have no dashboard to redirect to.
      const redirectPath = getDashboardPath(userRole) ?? '/unauthorized';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;



