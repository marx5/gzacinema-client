import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: (data) => authApi.register(data),
        onSuccess: () => {
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        },
        onError: (error) => toast.error(error.friendlyMessage)
    });

    const onSubmit = (data) => {
        const { confirmPassword, ...payload } = data;
        registerMutation.mutate(payload);
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[480px] px-5 md:mt-8 md:px-4">
            <div className="border border-[#ddcbb6] border-t-4 border-t-brand-500 bg-white p-8 shadow-[0_8px_22px_rgba(76,45,17,0.10)] md:p-6">
                <h2 className="m-0 text-center font-display text-[32px] font-bold tracking-[0.01em] text-[#3b2b19] md:text-[28px]">Đăng Ký</h2>
                <p className="mb-6 mt-2 text-center text-sm text-[#7b6446]">Tạo tài khoản để bắt đầu đặt vé tại Gzacinema</p>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <input {...register('full_name')}
                        type="text" placeholder="Họ và tên" required
                        className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 text-sm outline-none focus:outline-brand-500"
                    />
                    {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message}</p>}

                    <input {...register('email')}
                        type="email" placeholder="Email" required
                        className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 text-sm text-[#3b2b19] outline-none placeholder:text-[#8c7356] focus:outline focus:outline-2 focus:outline-brand-500"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}

                    <div className="relative">
                        <input {...register('password')}
                            type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" required
                            className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 pr-11 text-sm text-[#3b2b19] outline-none placeholder:text-[#8c7356] focus:outline focus:outline-2 focus:outline-brand-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b6446] hover:text-[#3b2b19]"
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.83 2.92-5.05 5.32-6.47" />
                                    <path d="M1 1l22 22" />
                                    <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.74 0 1.42-.23 1.97-.62" />
                                    <path d="M14.47 14.47A3.5 3.5 0 0 0 9.53 9.53" />
                                    <path d="M21.17 14.83A10.96 10.96 0 0 0 23 12c-.74-2.08-1.89-3.84-3.31-5.17" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}

                    <div className="relative">
                        <input {...register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'} placeholder="Xác nhận mật khẩu" required
                            className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 pr-11 text-sm text-[#3b2b19] outline-none placeholder:text-[#8c7356] focus:outline focus:outline-2 focus:outline-brand-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b6446] hover:text-[#3b2b19]"
                        >
                            {showConfirmPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.83 2.92-5.05 5.32-6.47" />
                                    <path d="M1 1l22 22" />
                                    <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.74 0 1.42-.23 1.97-.62" />
                                    <path d="M14.47 14.47A3.5 3.5 0 0 0 9.53 9.53" />
                                    <path d="M21.17 14.83A10.96 10.96 0 0 0 23 12c-.74-2.08-1.89-3.84-3.31-5.17" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}

                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={registerMutation.isLoading}
                            className="min-h-[42px] w-full bg-brand-500 px-4 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {registerMutation.isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-[#7b6446]">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}