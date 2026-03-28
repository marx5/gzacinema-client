// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-[900] w-full border-b border-[#ddcbb6] bg-white/90 shadow-sm backdrop-blur-md">
            <nav className="mx-auto flex h-[72px] w-full max-w-[1080px] items-center justify-between px-5 md:px-4">

                {/* LOGO BÊN TRÁI */}
                <Link to="/" className="font-display text-[32px] font-extrabold text-[#3b2b19] transition hover:opacity-80">
                    Gzacinema<span className="text-brand-500">.</span>
                </Link>

                {/* USER BÊN PHẢI */}
                <div>
                    {isAuthenticated ? (
                        <div className="relative flex items-center gap-3" ref={menuRef}>
                            {/* Chữ Xin chào */}
                            <span className="text-sm text-[#7b6446] md:visible invisible">
                                Xin chào, <strong className="text-[#3b2b19]">{user?.full_name}</strong>
                            </span>

                            {/* Nút bấm mở Dropdown */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddcbb6] bg-[#f6efe3] font-bold text-[#3b2b19] transition hover:border-brand-500 hover:bg-brand-500 hover:text-white cursor-pointer"
                            >
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 top-[110%] z-[999] w-[220px] overflow-hidden rounded-md border border-[#ddcbb6] bg-white shadow-xl">

                                    <div className="border-b border-[#ddcbb6] bg-[#fcf9f4] px-4 py-3">
                                        <p className="m-0 text-xs text-[#7b6446]">Tài khoản</p>
                                        <p className="m-0 truncate font-bold text-[#3b2b19]">{user?.email}</p>
                                    </div>

                                    <div className="flex flex-col py-1">
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-[#3b2b19] transition hover:bg-[#fff6ec] hover:text-brand-600">Hồ sơ cá nhân</Link>
                                        <Link to="/history" onClick={() => setIsMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-[#3b2b19] transition hover:bg-[#fff6ec] hover:text-brand-600">Vé của tôi</Link>
                                        {(user?.role === 'admin' || user?.role === 'staff') && (
                                            <>
                                                <div className="my-1 border-t border-dashed border-[#ddcbb6]"></div>
                                                <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8c7356]">Khu vực Quản trị</div>
                                                {user?.role === 'admin' && (
                                                    <>
                                                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-[#3b2b19] transition hover:bg-brand-500 hover:text-white">Thống kê</Link>
                                                        <Link to="/admin/movies" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-[#3b2b19] transition hover:bg-brand-500 hover:text-white">Phim</Link>
                                                        <Link to="/admin/showtimes" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-[#3b2b19] transition hover:bg-brand-500 hover:text-white">Lịch chiếu</Link>
                                                        <Link to="/admin/cinemas" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-[#3b2b19] transition hover:bg-brand-500 hover:text-white">Rạp</Link>
                                                        <Link to="/admin/bookings" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-[#3b2b19] transition hover:bg-brand-500 hover:text-white">Hóa đơn</Link>
                                                    </>
                                                )}
                                                <Link to="/staff/checkin" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-[#3b2b19] transition hover:bg-brand-500 hover:text-white">Soát vé QR</Link>
                                            </>
                                        )}

                                        <div className="my-1 border-t border-[#ddcbb6]"></div>
                                        <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-sm font-bold text-[#b0232f] transition hover:bg-[#fceceb]">Đăng xuất</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-3 py-2 text-sm font-bold text-[#3b2b19] transition hover:text-brand-500">Đăng nhập</Link>
                            <Link to="/register" className="bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600 rounded-sm">Đăng ký</Link>
                        </div>
                    )}
                </div>

            </nav>
        </header>
    );
}