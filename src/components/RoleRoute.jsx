import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import NotFound from '../pages/NotFound';

export default function RoleRoute({ allowedRoles }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return <div className="py-20 text-center text-[#7b6446]">Đang kiểm tra quyền truy cập...</div>;
    }

    if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
        return <NotFound />;
    }

    return <Outlet />;
}