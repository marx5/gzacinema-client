import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Film,
    Calendar,
    Building2,
    Ticket,
    QrCode,
    X,
    Shield
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
    const navItems = [
        {
            to: '/admin',
            end: true,
            label: 'Tổng Quan & Thống Kê',
            icon: LayoutDashboard,
        },
        {
            to: '/admin/movies',
            label: 'Quản Lý Phim',
            icon: Film,
        },
        {
            to: '/admin/showtimes',
            label: 'Lịch Chiếu Phim',
            icon: Calendar,
        },
        {
            to: '/admin/cinemas',
            label: 'Cụm Rạp & Phòng',
            icon: Building2,
        },
        {
            to: '/admin/bookings',
            label: 'Đơn Đặt Vé',
            icon: Ticket,
        },
        {
            to: '/admin/checkin',
            label: 'Soát Vé QR Code',
            icon: QrCode,
        },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-white/10 bg-cinema-surface/95 backdrop-blur-2xl shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Logo */}
                <div>
                    <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                        <Link to="/admin" className="flex items-center gap-3 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-gradient text-cinema-bg shadow-glow-gold-sm transition-transform group-hover:scale-105">
                                <Film className="h-5 w-5 stroke-[2.5]" />
                            </div>
                            <div>
                                <span className="font-display font-black text-lg tracking-wider gold-text-gradient block leading-none">
                                    GZACINEMA
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-cinema-gold/80 flex items-center gap-1 mt-1">
                                    <Shield className="w-2.5 h-2.5" /> Admin Panel
                                </span>
                            </div>
                        </Link>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-cinema-text-muted hover:text-white lg:hidden rounded-md hover:bg-white/5 cursor-pointer active:scale-95"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="p-4 space-y-1">
                        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cinema-text-dim">
                            Quản lý hệ thống
                        </p>

                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex min-h-[44px] items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                                                isActive
                                                    ? 'bg-gold-gradient text-cinema-bg shadow-glow-gold-sm font-bold'
                                                    : 'text-cinema-text-muted hover:text-white hover:bg-cinema-surface-elevated/70'
                                            }`
                                        }
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    );
}
