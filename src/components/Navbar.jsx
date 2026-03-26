import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const menuRef = useRef(null);

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
        setIsMobileNavOpen(false);
    };

    return (
        <div className="sticky top-0 z-50 border-b border-[#d8c8b4] bg-[linear-gradient(180deg,#fffaf3_0%,#f6ecde_100%)] shadow-sm">
            <nav className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-3 md:px-4">
                <Link to="/" className="font-display text-[28px] md:text-[36px] font-extrabold text-brand-600 hover:text-brand-700">
                    Gzacinema
                </Link>

                <button
                    className="md:hidden p-2 text-[#3f2f1f]"
                    onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileNavOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* DANH SÁCH MENU (DESKTOP: Flex hàng ngang, MOBILE: Khối absolute xổ xuống) */}
                <div className={`${isMobileNavOpen ? 'absolute top-full left-0 right-0 flex flex-col bg-white border-b border-[#d8c8b4] p-5 shadow-lg gap-4' : 'hidden'} md:static md:flex md:flex-row md:items-center md:gap-3 md:bg-transparent md:p-0 md:shadow-none md:border-none`}>

                    {isAuthenticated ? (
                        <>
                            <span className="truncate text-sm text-[#73593d]">
                                Xin chào, <strong className="text-[#3f2f1f]">{user?.email}</strong>
                            </span>
                            <Link to="/history" onClick={() => setIsMobileNavOpen(false)} className="border border-[#d8c8b4] bg-white px-3 py-2 text-sm font-bold text-[#3f2f1f] hover:border-brand-500 hover:text-brand-700 text-center">Vé của tôi</Link>
                            <Link to="/profile" onClick={() => setIsMobileNavOpen(false)} className="border border-[#d8c8b4] bg-white px-3 py-2 text-sm font-bold text-[#3f2f1f] hover:border-brand-500 hover:text-brand-700 text-center">Hồ sơ</Link>

                            {(user?.role === 'admin' || user?.role === 'staff') && (
                                <div className="relative" ref={menuRef}>
                                    {/* Trên Mobile, ẩn nút Quản lý dạng Dropdown đi, show list ra luôn. Trên Desktop giữ nguyên Dropdown */}
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="hidden md:block w-full border border-[#d8c8b4] bg-white px-4 py-[10px] text-sm font-bold text-[#3f2f1f] hover:border-brand-500 hover:bg-[#fff6ec]"
                                    >
                                        Quản lý ▾
                                    </button>

                                    {/* Dropdown Desktop */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-[calc(100%+6px)] z-[100] hidden md:flex min-w-[220px] flex-col border border-[#d8c8b4] bg-white shadow-xl">
                                            {user?.role === 'admin' && (
                                                <>
                                                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm hover:bg-[#fff6ec]">Thống kê</Link>
                                                    <Link to="/admin/movies" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm hover:bg-[#fff6ec]">Phim</Link>
                                                    <Link to="/admin/showtimes" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm hover:bg-[#fff6ec]">Lịch chiếu</Link>
                                                    <Link to="/admin/cinemas" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm hover:bg-[#fff6ec]">Rạp</Link>
                                                    <Link to="/admin/bookings" onClick={() => setIsMenuOpen(false)} className="border-b border-[#eadfce] px-4 py-[11px] text-sm hover:bg-[#fff6ec]">Hóa đơn</Link>
                                                </>
                                            )}
                                            <Link to="/staff/checkin" onClick={() => setIsMenuOpen(false)} className="px-4 py-[11px] text-sm hover:bg-[#fff6ec]">Soát vé QR</Link>
                                        </div>
                                    )}

                                    {/* Menu Admin trên Mobile (Render trực tiếp) */}
                                    <div className="md:hidden mt-2 flex flex-col gap-2 border-t border-[#d8c8b4] pt-2">
                                        <span className="text-xs text-[#8c7356] font-bold">MENU QUẢN LÝ</span>
                                        {user?.role === 'admin' && (
                                            <>
                                                <Link to="/admin" onClick={() => setIsMobileNavOpen(false)} className="text-sm py-1 font-bold text-brand-600">Thống kê</Link>
                                                <Link to="/admin/movies" onClick={() => setIsMobileNavOpen(false)} className="text-sm py-1 font-bold text-brand-600">Phim</Link>
                                                <Link to="/admin/showtimes" onClick={() => setIsMobileNavOpen(false)} className="text-sm py-1 font-bold text-brand-600">Lịch chiếu</Link>
                                            </>
                                        )}
                                        <Link to="/staff/checkin" onClick={() => setIsMobileNavOpen(false)} className="text-sm py-1 font-bold text-brand-600">Soát vé QR</Link>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleLogout} className="mt-2 md:mt-0 border border-[#9b2d30] bg-white px-3 py-2 text-sm font-bold text-[#9b2d30] hover:bg-[#7e2326] hover:text-white">Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsMobileNavOpen(false)} className="border border-[#d8c8b4] bg-white px-3 py-2 text-sm font-bold text-[#3f2f1f] text-center">Đăng nhập</Link>
                            <Link to="/register" onClick={() => setIsMobileNavOpen(false)}>
                                <button className="w-full bg-brand-500 px-4 py-[10px] text-sm font-bold text-white hover:bg-brand-600">Đăng ký</button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}