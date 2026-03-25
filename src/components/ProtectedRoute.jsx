import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return <div className="page-loading">Đang tải dữ liệu...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}