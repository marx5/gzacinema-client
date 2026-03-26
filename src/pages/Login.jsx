import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const loginStore = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (credentials) => authApi.login(credentials),
        onSuccess: (res) => {
            loginStore(res.data, res.accessToken);
            toast.success('Đăng nhập thành công!');
            navigate('/');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Lỗi đăng nhập');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[480px] px-5 md:mt-8 md:px-4">
            <div className="border border-[#ddcbb6] border-t-4 border-t-brand-500 bg-white p-8 shadow-[0_8px_22px_rgba(76,45,17,0.10)] md:p-6">
                <h2 className="m-0 text-center font-display text-[32px] font-bold tracking-[0.01em] text-[#3b2b19] md:text-[28px]">Đăng Nhập</h2>
                <p className="mb-6 mt-2 text-center text-sm text-[#7b6446]">Truy cập tài khoản để đặt vé nhanh hơn</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={loginMutation.isLoading}
                            className="min-h-[42px] w-full bg-brand-500 px-4 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loginMutation.isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-[#7b6446]">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
}