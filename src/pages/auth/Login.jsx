import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Film, LogIn, Lock, Mail } from 'lucide-react';
import { Button, Input } from '@/components/core';

const loginSchema = z.object({
    email: z.string().email("Email không đúng định dạng"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
});

const getDefaultRouteByRole = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/admin/checkin';
    return '/';
};

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema)
    });
    const { login: loginStore, isAuthenticated, isLoading, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const loginMutation = useMutation({
        mutationFn: (credentials) => authApi.login(credentials),
        onSuccess: (res) => {
            loginStore(res.data, res.accessToken);
            toast.success('Đăng nhập thành công!');
            const fromPath = location.state?.from?.pathname;
            const role = res.data?.role;
            const isDisallowedAdminRedirect =
                fromPath?.startsWith('/admin') &&
                (role !== 'admin' && !(role === 'staff' && fromPath.replace(/\/+$/, '') === '/admin/checkin'));
            // Nếu có trang trước đó phù hợp với quyền của user thì quay lại, ngược lại điều hướng theo role
            if (fromPath && !isDisallowedAdminRedirect) {
                navigate(fromPath, { replace: true });
            } else {
                navigate(getDefaultRouteByRole(role), { replace: true });
            }
        },
        onError: (error) => {
            toast.error(error.friendlyMessage || 'Lỗi đăng nhập');
        }
    });

    if (!isLoading && isAuthenticated) {
        return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
    }

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="mx-auto mt-12 w-full max-w-[480px] px-4 md:px-6 mb-24 animate-in fade-in duration-300">
            <div className="glass-card relative overflow-hidden rounded-md border border-white/10 p-6 sm:p-8 shadow-cinematic">
                {/* Gold Top Accent */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gold-gradient"></div>

                <div className="text-center space-y-2 mb-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold mb-2 shadow-glow-gold-sm">
                        <Film className="w-6 h-6" />
                    </div>
                    <h2 className="m-0 font-display text-2xl sm:text-3xl font-extrabold text-cinema-text tracking-tight">
                        Đăng Nhập
                    </h2>
                    <p className="text-xs sm:text-sm text-cinema-text-muted">
                        Truy cập tài khoản để đặt vé và nhận ưu đãi độc quyền
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        leftIcon={Mail}
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <Input
                        label="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        leftIcon={Lock}
                        error={errors.password?.message}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                className="text-cinema-text-dim hover:text-cinema-gold transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                        {...register('password')}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={loginMutation.isPending}
                            className="w-full rounded-md font-bold tracking-wide shadow-glow-gold-sm"
                            leftIcon={<LogIn className="w-4 h-4" />}
                        >
                            ĐĂNG NHẬP
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs sm:text-sm text-cinema-text-muted">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-bold text-cinema-gold hover:text-cinema-gold-light transition-colors underline-offset-4 hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
