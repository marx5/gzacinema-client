import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Film, UserPlus, Lock, Mail, User } from 'lucide-react';
import { Button, Input } from '@/components/core';

const registerSchema = z.object({
    full_name: z.string().min(2, "Họ tên phải từ 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema)
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: (data) => authApi.register(data),
        onSuccess: () => {
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        },
        onError: (error) => toast.error(error.friendlyMessage || 'Đăng ký thất bại')
    });

    if (!isLoading && isAuthenticated) {
        const target = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/admin/checkin' : '/';
        return <Navigate to={target} replace />;
    }

    const onSubmit = (data) => {
        const { confirmPassword, ...payload } = data;
        registerMutation.mutate(payload);
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[480px] px-4 md:px-6 mb-24 animate-in fade-in duration-300">
            <div className="glass-card relative overflow-hidden rounded-md border border-white/10 p-6 sm:p-8 shadow-cinematic">
                {/* Gold Top Accent */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gold-gradient"></div>

                <div className="text-center space-y-2 mb-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold mb-2 shadow-glow-gold-sm">
                        <Film className="w-6 h-6" />
                    </div>
                    <h2 className="m-0 font-display text-2xl sm:text-3xl font-extrabold text-cinema-text tracking-tight">
                        Đăng Ký
                    </h2>
                    <p className="text-xs sm:text-sm text-cinema-text-muted">
                        Tạo tài khoản để bắt đầu trải nghiệm điện ảnh đỉnh cao tại GZACINEMA
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Họ và tên"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        leftIcon={User}
                        error={errors.full_name?.message}
                        {...register('full_name')}
                    />

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
                        placeholder="Tối thiểu 6 ký tự"
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

                    <Input
                        label="Xác nhận mật khẩu"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        leftIcon={Lock}
                        error={errors.confirmPassword?.message}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                                className="text-cinema-text-dim hover:text-cinema-gold transition-colors cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                        {...register('confirmPassword')}
                    />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={registerMutation.isPending}
                            className="w-full rounded-md font-bold tracking-wide shadow-glow-gold-sm"
                            leftIcon={<UserPlus className="w-4 h-4" />}
                        >
                            ĐĂNG KÝ TÀI KHOẢN
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs sm:text-sm text-cinema-text-muted">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-bold text-cinema-gold hover:text-cinema-gold-light transition-colors underline-offset-4 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
