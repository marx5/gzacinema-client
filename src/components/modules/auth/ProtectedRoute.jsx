import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <div className="page-loading">Đang tải dữ liệu...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}