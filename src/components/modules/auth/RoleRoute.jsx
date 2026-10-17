import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LazyLoading } from '@/components/base';

const NotFound = React.lazy(() => import('@/pages/not-found'));

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
        const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
        if (user?.role === 'staff' && normalizedPath === '/admin') {
            return <Navigate to="/admin/checkin" replace />;
        }
        return (
            <Suspense fallback={<LazyLoading message="Đang tải trang..." />}>
                <NotFound />
            </Suspense>
        );
    }

    return <Outlet />;
}