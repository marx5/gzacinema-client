import { useState, useRef, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar as AdminSidebar } from '../../components/layouts';
import { Menu, Home, Sparkles, User, Ticket, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

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

    // Map current path to page title
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Tổng Quan & Thống Kê';
        if (path.startsWith('/admin/movies') && path.includes('/showtimes')) return 'Lịch Chiếu Phim Chi Tiết';
        if (path.startsWith('/admin/movies')) return 'Quản Lý Phim';
        if (path.startsWith('/admin/showtimes')) return 'Lịch Chiếu Toàn Hệ Thống';
        if (path.startsWith('/admin/cinemas') && path.includes('/rooms')) return 'Quản Lý Phòng Chiếu';
        if (path.startsWith('/admin/cinemas')) return 'Cụm Rạp & Phòng Chiếu';
        if (path.startsWith('/admin/bookings')) return 'Quản Lý Đơn Đặt Vé';
        if (path.startsWith('/admin/checkin') || path.startsWith('/staff/checkin')) return 'Soát Vé QR Code';
        return 'Quản Trị Hệ Thống';
    };

    return (
        <div className="flex min-h-screen bg-cinema-bg text-cinema-text">
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Topbar */}
                <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/10 bg-cinema-bg/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-md border border-white/10 bg-cinema-surface text-cinema-text-muted hover:text-white lg:hidden cursor-pointer"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="m-0 font-display text-lg sm:text-xl font-black text-cinema-text flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cinema-gold" />
                                {getPageTitle()}
                            </h1>
                            <p className="text-[11px] text-cinema-text-dim hidden sm:block">
                                Hệ thống điều hành & quản lý cụm rạp GZACINEMA
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* User Profile Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2.5 rounded-md border border-white/10 bg-cinema-surface px-2.5 py-1.5 text-xs font-bold text-cinema-text transition hover:border-cinema-gold/50 hover:bg-cinema-surface-elevated cursor-pointer"
                                aria-expanded={isMenuOpen}
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-gradient text-cinema-bg font-black text-xs shadow-inner">
                                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="text-xs font-bold text-cinema-text hidden md:inline-block max-w-[120px] truncate">
                                    {user?.full_name || 'Admin'}
                                </span>
                                <ChevronDown className={`h-3.5 w-3.5 text-cinema-text-muted transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-cinema-gold' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 top-[120%] z-[999] w-64 overflow-hidden rounded-md border border-white/10 bg-cinema-surface/95 shadow-cinematic backdrop-blur-xl animate-scaleUp">
                                    {/* Header */}
                                    <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-bold text-cinema-text">{user?.full_name || 'Quản trị viên'}</p>
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/30">
                                                Admin
                                            </span>
                                        </div>
                                        <p className="truncate text-xs text-cinema-text-dim mt-0.5">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="flex flex-col p-1.5 space-y-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-cinema-text-muted hover:bg-white/5 hover:text-cinema-gold transition"
                                        >
                                            <User className="h-4 w-4" />
                                            Hồ sơ cá nhân
                                        </Link>
                                        <Link
                                            to="/history"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-cinema-text-muted hover:bg-white/5 hover:text-cinema-gold transition"
                                        >
                                            <Ticket className="h-4 w-4" />
                                            Vé của tôi
                                        </Link>
                                        <Link
                                            to="/"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-cinema-text-muted hover:bg-white/5 hover:text-cinema-gold transition"
                                        >
                                            <Home className="h-4 w-4" />
                                            Xem trang web
                                        </Link>

                                        <div className="my-1 border-t border-white/10"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Suspense
                        fallback={
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="flex items-center gap-3 rounded-md border border-cinema-gold/30 bg-cinema-surface/90 px-5 py-3 text-sm font-bold text-cinema-gold shadow-glow-gold-sm backdrop-blur-md">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                                    <span>Đang tải nội dung...</span>
                                </div>
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
