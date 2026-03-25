import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    // State quản lý việc đóng/mở menu Dropdown
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <div className="sticky top-0 z-50 border-b border-[#d8c8b4] bg-[linear-gradient(180deg,#fffaf3_0%,#f6ecde_100%)] shadow-[0_6px_20px_rgba(76,45,17,0.08)]">
            <nav className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-4 md:gap-3 md:px-4 sm:px-3">
                <Link to="/" className="shrink-0 font-display text-[36px] font-extrabold tracking-[0.02em] text-brand-600 hover:text-brand-700">Gzacinema</Link>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-3 md:w-full md:justify-end sm:gap-2">
                    {isAuthenticated ? (
                        <>
                            <span className="max-w-[320px] truncate text-sm text-[#73593d] sm:max-w-[160px]">
                                Xin chào, <strong className="text-[#3f2f1f]">{user?.email}</strong>
                            </span>
                            <Link to="/history" className="border border-[#d8c8b4] bg-white px-3 py-2 text-sm font-bold text-[#3f2f1f] transition hover:border-brand-500 hover:text-brand-700">Vé của tôi</Link>

                            {/* MENU QUẢN LÝ DÀNH CHO ADMIN & STAFF */}
                            {(user?.role === 'admin' || user?.role === 'staff') && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="min-w-[132px] border border-[#d8c8b4] bg-white px-4 py-[10px] text-sm font-bold text-[#3f2f1f] transition hover:border-brand-500 hover:bg-[#fff6ec]"
                                    >
                                        Quản lý
                                    </button>

                                    {/* Khối Dropdown */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-[calc(100%+6px)] z-[100] flex min-w-[220px] flex-col border border-[#d8c8b4] bg-white shadow-[0_10px_28px_rgba(76,45,17,0.14)] md:right-0 md:min-w-[280px]">
                                            {user?.role === 'admin' && (
                                                <>
                                                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm text-[#3f2f1f] hover:bg-[#fff6ec] hover:text-brand-700">Thống kê</Link>
                                                    <Link to="/admin/movies" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm text-[#3f2f1f] hover:bg-[#fff6ec] hover:text-brand-700">Quản lý Phim</Link>
                                                    <Link to="/admin/showtimes" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm text-[#3f2f1f] hover:bg-[#fff6ec] hover:text-brand-700">Lịch chiếu</Link>
                                                    <Link to="/admin/cinemas" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm text-[#3f2f1f] hover:bg-[#fff6ec] hover:text-brand-700">Quản lý Rạp</Link>
                                                </>
                                            )}
                                            <Link to="/staff/checkin" onClick={() => setIsMenuOpen(false)} className="px-4 py-[11px] text-sm text-[#3f2f1f] hover:bg-[#fff6ec] hover:text-brand-700">Soát vé QR</Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button onClick={handleLogout} className="border border-[#9b2d30] bg-white px-3 py-2 text-sm font-bold text-[#9b2d30] transition hover:border-[#7e2326] hover:bg-[#7e2326] hover:text-white">Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="border border-[#d8c8b4] bg-white px-3 py-2 text-sm font-bold text-[#3f2f1f] transition hover:border-brand-500 hover:text-brand-700">Đăng nhập</Link>
                            <Link to="/register">
                                <button className="min-h-[42px] bg-brand-500 px-4 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600 md:w-full">Đăng ký</button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}