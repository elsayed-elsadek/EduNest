import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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

  // Return a generic loader or null while Zustand restores state from local storage
  if (!isHydrated) {
    return null;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = getDefaultDashboardPath(userRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
};

/**
 * Gets the default dashboard path for a user role
 */
const getDefaultDashboardPath = (role: string): string => {
  switch (role) {
    case 'ROLE_MENTOR':
      return '/mentor/dashboard';
    case 'ROLE_STUDENT':
      return '/student/dashboard';
    case 'ROLE_ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export default ProtectedRoute;



