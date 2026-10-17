import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar as AdminSidebar } from '@/components/layouts';
import {
    Menu,
    Home,
    User,
    Users,
    Ticket,
    LogOut,
    ChevronDown,
    ChevronRight,
    Search,
    LayoutDashboard,
    Film,
    Calendar,
    Building2,
    QrCode,
    Command,
    X
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const QUICK_NAV_ITEMS = [
    { label: 'Tổng Quan & Thống Kê', desc: 'Doanh thu, vé bán, bảng xếp hạng phim', to: '/admin', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'Quản Lý Phim', desc: 'Danh sách phim, thêm/sửa/xóa phim điện ảnh', to: '/admin/movies', icon: Film, roles: ['admin'] },
    { label: 'Lịch Chiếu Hệ Thống', desc: 'Tạo suất chiếu mới & quản lý toàn bộ lịch chiếu', to: '/admin/showtimes', icon: Calendar, roles: ['admin'] },
    { label: 'Cụm Rạp & Phòng Chiếu', desc: 'Quản lý danh sách rạp và sơ đồ phòng chiếu', to: '/admin/cinemas', icon: Building2, roles: ['admin'] },
    { label: 'Quản Lý Đơn Đặt Vé', desc: 'Tra cứu giao dịch, trạng thái thanh toán & mã vé', to: '/admin/bookings', icon: Ticket, roles: ['admin'] },
    { label: 'Quản Lý Người Dùng', desc: 'Quản lý tài khoản khách hàng, nhân viên & phân quyền', to: '/admin/users', icon: Users, roles: ['admin'] },
    { label: 'Soát Vé QR Code', desc: 'Quét mã QR hoặc nhập mã vé check-in tại quầy', to: '/admin/checkin', icon: QrCode, roles: ['admin', 'staff'] },
    { label: 'Trang Chủ Đặt Vé', desc: 'Chuyển sang giao diện khách hàng', to: '/', icon: Home, roles: ['admin', 'staff'] },
];

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('gza_admin_sidebar_collapsed') === '1';
        } catch {
            return false;
        }
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
    const [quickQuery, setQuickQuery] = useState('');

    const menuRef = useRef(null);
    const quickInputRef = useRef(null);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('gza_admin_sidebar_collapsed', next ? '1' : '0');
            } catch {
                // ignore storage errors
            }
            return next;
        });
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Phím tắt Ctrl+K / Cmd+K mở tìm kiếm điều hướng nhanh
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsQuickSearchOpen(prev => !prev);
            } else if (e.key === 'Escape') {
                setIsQuickSearchOpen(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isQuickSearchOpen) {
            setTimeout(() => quickInputRef.current?.focus(), 50);
        } else {
            setQuickQuery('');
        }
    }, [isQuickSearchOpen]);

    const handleLogout = async () => {
        await logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/');
        setIsMenuOpen(false);
    };

    // Breadcrumb & Page Title
    const pageMeta = useMemo(() => {
        const path = location.pathname;
        if (path === '/admin') {
            return {
                title: 'Tổng Quan & Thống Kê',
                breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Tổng Quan' }]
            };
        }
        if (path.startsWith('/admin/movies') && path.includes('/showtimes')) {
            return {
                title: 'Lịch Chiếu Phim Chi Tiết',
                breadcrumbs: [
                    { label: 'Admin', to: '/admin' },
                    { label: 'Quản Lý Phim', to: '/admin/movies' },
                    { label: 'Lịch Chiếu Theo Phim' }
                ]
            };
        }
        if (path.startsWith('/admin/movies')) {
            return {
                title: 'Quản Lý Phim',
                breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Quản Lý Phim' }]
            };
        }
        if (path.startsWith('/admin/showtimes')) {
            return {
                title: 'Lịch Chiếu Hệ Thống',
                breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Lịch Chiếu Hệ Thống' }]
            };
        }
        if (path.startsWith('/admin/cinemas') && path.includes('/rooms')) {
            return {
                title: 'Quản Lý Phòng Chiếu',
                breadcrumbs: [
                    { label: 'Admin', to: '/admin' },
                    { label: 'Cụm Rạp', to: '/admin/cinemas' },
                    { label: 'Phòng Chiếu & Sơ Đồ Ghế' }
                ]
            };
        }
        if (path.startsWith('/admin/cinemas')) {
            return {
                title: 'Cụm Rạp & Phòng Chiếu',
                breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Cụm Rạp & Phòng Chiếu' }]
            };
        }
        if (path.startsWith('/admin/bookings')) {
            return {
                title: 'Quản Lý Đơn Đặt Vé',
                breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Đơn Đặt Vé' }]
            };
        }
        if (path.startsWith('/admin/users')) {
            return {
                title: 'Quản Lý Người Dùng & Phân Quyền',
                breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: 'Người Dùng' }]
            };
        }
        if (path.startsWith('/admin/checkin') || path.startsWith('/staff/checkin')) {
            return {
                title: 'Soát Vé QR Code',
                breadcrumbs: [{ label: user?.role === 'staff' ? 'Staff' : 'Admin', to: user?.role === 'staff' ? '/admin/checkin' : '/admin' }, { label: 'Soát Vé QR Code' }]
            };
        }
        return {
            title: 'Quản Trị Hệ Thống',
            breadcrumbs: [{ label: 'Admin', to: '/admin' }]
        };
    }, [location.pathname, user?.role]);

    const filteredQuickNav = useMemo(() => {
        const userRole = user?.role || 'user';
        const q = quickQuery.trim().toLowerCase();
        return QUICK_NAV_ITEMS.filter(item => {
            if (!item.roles.includes(userRole)) return false;
            if (!q) return true;
            return (
                item.label.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q)
            );
        });
    }, [quickQuery, user?.role]);

    return (
        <div className="flex min-h-screen bg-[#0B0C16] text-cinema-text">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={toggleSidebarCollapse}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0E101E]/95 backdrop-blur-md px-4 sm:px-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-md border border-white/10 bg-cinema-surface text-cinema-text-muted hover:text-white lg:hidden cursor-pointer shrink-0"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        <div className="min-w-0">
                            {/* Breadcrumbs */}
                            <nav className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-cinema-text-dim mb-0.5">
                                {pageMeta.breadcrumbs.map((crumb, idx) => {
                                    const isLast = idx === pageMeta.breadcrumbs.length - 1;
                                    return (
                                        <span key={idx} className="flex items-center gap-1">
                                            {idx > 0 && <ChevronRight className="w-3 h-3 text-cinema-text-dim/60" />}
                                            {crumb.to && !isLast ? (
                                                <Link
                                                    to={crumb.to}
                                                    className="hover:text-cinema-gold transition-colors"
                                                >
                                                    {crumb.label}
                                                </Link>
                                            ) : (
                                                <span className="text-cinema-text-muted font-semibold">{crumb.label}</span>
                                            )}
                                        </span>
                                    );
                                })}
                            </nav>

                            <h1 className="m-0 font-display text-base sm:text-lg font-bold text-white truncate leading-tight">
                                {pageMeta.title}
                            </h1>
                        </div>
                    </div>

                    {/* Right Controls: Quick Search + User Profile */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        {/* Quick Navigation Trigger */}
                        <button
                            type="button"
                            onClick={() => setIsQuickSearchOpen(true)}
                            className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[#15172B] hover:bg-[#1C1F38] hover:border-white/20 px-3 py-1.5 text-xs text-cinema-text-muted transition-colors cursor-pointer"
                            title="Mở chuyển trang nhanh (Ctrl+K)"
                        >
                            <Search className="w-3.5 h-3.5 text-cinema-gold" />
                            <span className="hidden md:inline-block pr-4">Chuyển nhanh...</span>
                            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cinema-text-dim border border-white/10">
                                <Command className="w-2.5 h-2.5" />K
                            </kbd>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 rounded-md border border-white/10 bg-[#15172B] px-2.5 py-1.5 text-xs font-semibold text-cinema-text transition hover:border-white/20 hover:bg-[#1C1F38] cursor-pointer"
                                aria-expanded={isMenuOpen}
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-cinema-gold text-cinema-bg font-black text-xs">
                                    {user?.full_name?.charAt(0).toUpperCase() || (user?.role === 'staff' ? 'S' : 'A')}
                                </div>
                                <span className="text-xs font-semibold text-cinema-text hidden sm:inline-block max-w-[120px] truncate">
                                    {user?.full_name || (user?.role === 'staff' ? 'Nhân viên' : 'Admin')}
                                </span>
                                <ChevronDown className={`h-3.5 w-3.5 text-cinema-text-muted transition-transform duration-150 ${isMenuOpen ? 'rotate-180 text-cinema-gold' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 top-[115%] z-[999] w-60 overflow-hidden rounded-md border border-white/15 bg-[#141629] shadow-xl animate-in fade-in zoom-in-95 duration-100">
                                    <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-xs font-bold text-white">
                                                {user?.full_name || (user?.role === 'staff' ? 'Nhân viên' : 'Quản trị viên')}
                                            </p>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                user?.role === 'staff'
                                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                                    : 'bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/30'
                                            }`}>
                                                {user?.role === 'staff' ? 'Staff' : 'Admin'}
                                            </span>
                                        </div>
                                        <p className="truncate text-[11px] text-cinema-text-dim mt-0.5">{user?.email}</p>
                                    </div>

                                    <div className="flex flex-col p-1.5 space-y-0.5">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium text-cinema-text-muted hover:bg-white/5 hover:text-white transition"
                                        >
                                            <User className="h-3.5 w-3.5 text-cinema-gold" />
                                            Hồ sơ cá nhân
                                        </Link>
                                        <Link
                                            to="/history"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium text-cinema-text-muted hover:bg-white/5 hover:text-white transition"
                                        >
                                            <Ticket className="h-3.5 w-3.5 text-cinema-gold" />
                                            Lịch sử vé của tôi
                                        </Link>
                                        <Link
                                            to="/"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium text-cinema-text-muted hover:bg-white/5 hover:text-white transition"
                                        >
                                            <Home className="h-3.5 w-3.5 text-cinema-gold" />
                                            Xem trang khách hàng
                                        </Link>

                                        <div className="my-1 border-t border-white/10" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
                    <Suspense
                        fallback={
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[#141629] px-4 py-2.5 text-xs font-semibold text-cinema-gold">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                                    <span>Đang tải dữ liệu...</span>
                                </div>
                            </div>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </main>
            </div>

            {/* Quick Navigation Command Palette Modal (Ctrl+K) */}
            {isQuickSearchOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[12vh] p-4">
                    <div
                        className="fixed inset-0 bg-black/75 animate-in fade-in duration-100"
                        onClick={() => setIsQuickSearchOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-lg rounded-md border border-white/15 bg-[#141629] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100">
                        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3 bg-[#181A30]">
                            <Search className="w-4 h-4 text-cinema-gold shrink-0" />
                            <input
                                ref={quickInputRef}
                                type="text"
                                value={quickQuery}
                                onChange={(e) => setQuickQuery(e.target.value)}
                                placeholder="Tìm nhanh phân hệ quản trị (Phim, Rạp, Lịch chiếu, Đơn vé...)"
                                className="w-full bg-transparent text-sm text-white placeholder:text-cinema-text-dim outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setIsQuickSearchOpen(false)}
                                className="p-1 rounded text-cinema-text-dim hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                            {filteredQuickNav.length === 0 ? (
                                <div className="py-8 text-center text-xs text-cinema-text-dim">
                                    Không tìm thấy mục nào khớp với từ khóa &ldquo;{quickQuery}&rdquo;
                                </div>
                            ) : (
                                filteredQuickNav.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.to;
                                    return (
                                        <button
                                            key={item.to}
                                            type="button"
                                            onClick={() => {
                                                navigate(item.to);
                                                setIsQuickSearchOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                                isActive
                                                    ? 'bg-cinema-gold/15 border border-cinema-gold/30'
                                                    : 'hover:bg-white/[0.04] border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                                                    isActive
                                                        ? 'border-cinema-gold/40 bg-cinema-gold text-cinema-bg'
                                                        : 'border-white/10 bg-[#1B1E36] text-cinema-gold'
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-white truncate">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-[11px] text-cinema-text-dim truncate">
                                                        {item.desc}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-cinema-text-dim shrink-0 ml-2" />
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 bg-[#0E101E] px-4 py-2 text-[11px] text-cinema-text-dim">
                            <span>Mẹo: Nhấn <strong className="text-cinema-text-muted">Ctrl + K</strong> bất kỳ lúc nào để mở hộp thoại này</span>
                            <span>ESC để đóng</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
