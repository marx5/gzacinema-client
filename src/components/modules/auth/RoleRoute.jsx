import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import NotFound from '@/pages/not-found';

export default function RoleRoute({ allowedRoles }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return <div className="py-20 text-center text-[#7b6446]">Đang kiểm tra quyền truy cập...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
        if (user?.role === 'staff' && location.pathname === '/admin') {
            return <Navigate to="/admin/checkin" replace />;
        }
        return <NotFound />;
    }

    return <Outlet />;
}