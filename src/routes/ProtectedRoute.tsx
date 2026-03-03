import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Return a generic loader or null while Zustand restores state from local storage
    if (!isHydrated) {
        return null;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;



