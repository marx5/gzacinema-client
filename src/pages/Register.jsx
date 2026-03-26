import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: (data) => authApi.register(data),
        onSuccess: () => {
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Lỗi đăng ký');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Mật khẩu xác nhận không khớp');
        }
        registerMutation.mutate({ full_name: fullName, email, password });
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[480px] px-5 md:mt-8 md:px-4">
            <div className="border border-[#ddcbb6] border-t-4 border-t-brand-500 bg-white p-8 shadow-[0_8px_22px_rgba(76,45,17,0.10)] md:p-6">
                <h2 className="m-0 text-center font-display text-[32px] font-bold tracking-[0.01em] text-[#3b2b19] md:text-[28px]">Đăng Ký</h2>
                <p className="mb-6 mt-2 text-center text-sm text-[#7b6446]">Tạo tài khoản để bắt đầu đặt vé tại Gzacinema</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text" placeholder="Họ và tên" required
                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 text-sm outline-none focus:outline-brand-500"
                    />
                    <input
                        type="email" placeholder="Email" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 text-sm text-[#3b2b19] outline-none placeholder:text-[#8c7356] focus:outline focus:outline-2 focus:outline-brand-500"
                    />
                    <input
                        type="password" placeholder="Mật khẩu" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 text-sm text-[#3b2b19] outline-none placeholder:text-[#8c7356] focus:outline focus:outline-2 focus:outline-brand-500"
                    />
                    <input
                        type="password" placeholder="Xác nhận mật khẩu" required
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="min-h-[42px] w-full border border-[#cfb596] bg-white px-[14px] py-3 text-sm text-[#3b2b19] outline-none placeholder:text-[#8c7356] focus:outline focus:outline-2 focus:outline-brand-500"
                    />
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