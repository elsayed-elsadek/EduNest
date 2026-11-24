import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { refreshAccessToken } from '../services/authRefresh';
import { getTokenExpiration, isTokenValid } from '../utils/jwt';
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
  const refreshToken = useAuthStore((state) => state.refreshToken);

  // FE-008: a well-formed access token that is expired (or inside the 30s skew
  // window) is RECOVERABLE while a refresh token is still stored. The store
  // already marks this case as `authInit: 'recovering'`, so attempt the same
  // single-flight refresh the API layer uses instead of bouncing to /login.
  // Without this, a route render that issues no request redirects to
  // `/login?reason=expired` even though the session can be silently renewed.
  const tokenInvalid = requireAuth && !!token && !isTokenValid(token);
  const canRecover = tokenInvalid && getTokenExpiration(token) !== null && !!refreshToken;

  const attemptedTokenRef = useRef<string | null>(null);
  const [recoveryFailedFor, setRecoveryFailedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!canRecover || attemptedTokenRef.current === token) return;
    // One attempt per token value: a failed refresh either ends the session
    // (clearing the token) or replaces it, so a retry would only loop.
    attemptedTokenRef.current = token;
    void refreshAccessToken(token).catch(() => {
      setRecoveryFailedFor(token);
    });
  }, [canRecover, token]);

  // Return a generic loader or null while Zustand restores state from local storage
  if (!isHydrated) {
    return null;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    // A failed recovery already ended the session through the shared expiry
    // path — keep the "expired" reason so the banner is not lost on the
    // client-side redirect.
    return (
      <Navigate
        to={recoveryFailedFor ? '/login?reason=expired' : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  // FE-008: an expired or malformed token must be treated as unauthenticated —
  // land on /login with a "session expired" reason instead of rendering content.
  if (tokenInvalid) {
    if (canRecover && recoveryFailedFor !== token) {
      // Silent renewal is in flight; render nothing rather than flashing the
      // login page. The store update re-renders this route with the new token.
      return null;
    }
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
