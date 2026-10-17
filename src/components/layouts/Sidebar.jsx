import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Film,
    Calendar,
    Building2,
    Ticket,
    Users,
    QrCode,
    X,
    Shield,
    PanelLeftClose,
    PanelLeftOpen,
    ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminSidebar({
    isOpen,
    onClose,
    isCollapsed = false,
    onToggleCollapse
}) {
    const { user } = useAuthStore();
    const userRole = user?.role || 'user';
    const isStaffOnly = userRole === 'staff';

    const navGroups = [
        {
            title: 'Báo cáo',
            items: [
                {
                    to: '/admin',
                    end: true,
                    label: 'Tổng Quan & Thống Kê',
                    shortLabel: 'Tổng Quan',
                    icon: LayoutDashboard,
                    roles: ['admin'],
                },
            ]
        },
        {
            title: 'Nội dung & Hạ tầng',
            items: [
                {
                    to: '/admin/movies',
                    label: 'Quản Lý Phim',
                    shortLabel: 'Phim',
                    icon: Film,
                    roles: ['admin'],
                },
                {
                    to: '/admin/showtimes',
                    label: 'Lịch Chiếu Hệ Thống',
                    shortLabel: 'Lịch Chiếu',
                    icon: Calendar,
                    roles: ['admin'],
                },
                {
                    to: '/admin/cinemas',
                    label: 'Cụm Rạp & Phòng Chiếu',
                    shortLabel: 'Cụm Rạp',
                    icon: Building2,
                    roles: ['admin'],
                },
            ]
        },
        {
            title: 'Giao dịch & Tài khoản',
            items: [
                {
                    to: '/admin/bookings',
                    label: 'Đơn Đặt Vé',
                    shortLabel: 'Đơn Vé',
                    icon: Ticket,
                    roles: ['admin'],
                },
                {
                    to: '/admin/users',
                    label: 'Quản Lý Người Dùng',
                    shortLabel: 'Người Dùng',
                    icon: Users,
                    roles: ['admin'],
                },
                {
                    to: '/admin/checkin',
                    label: 'Soát Vé QR Code',
                    shortLabel: 'Soát Vé QR',
                    icon: QrCode,
                    roles: ['admin', 'staff'],
                },
            ]
        }
    ];

    const filteredGroups = navGroups
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.roles.includes(userRole))
        }))
        .filter(group => group.items.length > 0);

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/75 lg:hidden animate-in fade-in duration-150"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-white/10 bg-[#0E101E] transition-[width,transform] duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 shrink-0 select-none ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isCollapsed ? 'lg:w-[68px]' : 'w-64'}`}
            >
                {/* Top Section: Brand + Navigation */}
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Header Logo */}
                    <div className={`flex h-16 items-center border-b border-white/10 shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
                        <Link
                            to={isStaffOnly ? '/admin/checkin' : '/admin'}
                            className="flex items-center gap-2.5 group min-w-0"
                            title="GZACINEMA Admin"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cinema-gold text-cinema-bg font-black transition-transform group-hover:scale-105">
                                <Film className="h-4 w-4 stroke-[2.5]" />
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <span className="font-display font-black text-base tracking-wide text-white block leading-none truncate">
                                        GZACINEMA
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-cinema-gold flex items-center gap-1 mt-1">
                                        <Shield className="w-2.5 h-2.5" />
                                        {isStaffOnly ? 'Staff Workspace' : 'Admin Console'}
                                    </span>
                                </div>
                            )}
                        </Link>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center text-cinema-text-muted hover:text-white lg:hidden rounded-md hover:bg-white/5 cursor-pointer"
                            aria-label="Close sidebar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
                        {filteredGroups.map((group) => (
                            <div key={group.title} className="space-y-1">
                                {!isCollapsed && (
                                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cinema-text-dim">
                                        {group.title}
                                    </p>
                                )}

                                <nav className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                end={item.end}
                                                onClick={onClose}
                                                title={isCollapsed ? item.label : undefined}
                                                className={({ isActive }) =>
                                                    `group relative flex items-center rounded-md text-[13px] font-medium transition-colors duration-150 ${
                                                        isCollapsed
                                                            ? 'justify-center h-10 w-full px-0'
                                                            : 'gap-2.5 px-3 py-2.5'
                                                    } ${
                                                        isActive
                                                            ? 'bg-cinema-gold/15 text-cinema-gold font-bold border border-cinema-gold/30'
                                                            : 'text-cinema-text-muted hover:text-white hover:bg-white/[0.04] border border-transparent'
                                                    }`
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        {isActive && (
                                                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cinema-gold" />
                                                        )}
                                                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cinema-gold' : 'text-cinema-text-muted group-hover:text-white'}`} />
                                                        {!isCollapsed && (
                                                            <span className="truncate">{item.label}</span>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Footer Controls */}
                <div className="border-t border-white/10 p-2.5 space-y-1 shrink-0 bg-[#0B0C17]">
                    <Link
                        to="/"
                        title={isCollapsed ? 'Trang chủ khách hàng' : undefined}
                        className={`flex items-center rounded-md text-xs font-medium text-cinema-text-muted hover:text-white hover:bg-white/[0.04] transition-colors ${
                            isCollapsed ? 'justify-center h-9 w-full' : 'justify-between px-3 py-2'
                        }`}
                    >
                        <span className="flex items-center gap-2 truncate">
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-cinema-gold" />
                            {!isCollapsed && <span>Trang chủ Đặt vé</span>}
                        </span>
                    </Link>

                    {onToggleCollapse && (
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
                            className={`hidden lg:flex w-full items-center rounded-md text-xs font-medium text-cinema-text-dim hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer ${
                                isCollapsed ? 'justify-center h-9' : 'gap-2 px-3 py-2'
                            }`}
                        >
                            {isCollapsed ? (
                                <PanelLeftOpen className="w-4 h-4 shrink-0" />
                            ) : (
                                <>
                                    <PanelLeftClose className="w-4 h-4 shrink-0" />
                                    <span>Thu gọn menu</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
