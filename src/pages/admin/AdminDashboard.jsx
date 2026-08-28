import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { systemApi } from '@/api/systemApi';
import { cinemaApi } from '@/api/cinemaApi';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatters';
import {
    DollarSign,
    Ticket,
    Users,
    Filter,
    Calendar,
    Building2,
    Film,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { Badge, Select, DatePicker } from '@/components/core';

export default function AdminDashboard() {
    const [filterType, setFilterType] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedCinema, setSelectedCinema] = useState('');

    const { data: cinemas = [] } = useQuery({
        queryKey: ['admin-cinemas-list'],
        queryFn: async () => {
            const res = await cinemaApi.getAll();
            return res.data;
        },
        onError: () => toast.error("Không thể tải danh sách rạp")
    });

    const { data: stats, isLoading, isFetching } = useQuery({
        queryKey: ['admin-stats', filterType, customStartDate, customEndDate, selectedCinema],
        queryFn: async () => {
            let params = {};

            if (selectedCinema) params.cinemaId = selectedCinema;

            const today = new Date();
            if (filterType === 'today') {
                params.startDate = today.toISOString().split('T')[0];
                params.endDate = params.startDate;
            } else if (filterType === 'week') {
                const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
                params.startDate = firstDay.toISOString().split('T')[0];
                params.endDate = lastDay.toISOString().split('T')[0];
            } else if (filterType === 'month') {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                params.startDate = firstDay.toISOString().split('T')[0];
                params.endDate = lastDay.toISOString().split('T')[0];
            } else if (filterType === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }

            const res = await systemApi.getStats(params);
            return res.data;
        },
        enabled: filterType !== 'custom' || (Boolean(customStartDate) && Boolean(customEndDate)),
        placeholderData: keepPreviousData,
    });

    if (isLoading && !stats) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold"></div>
                <p className="mt-4 font-medium text-cinema-text-muted">Đang phân tích dữ liệu hệ thống...</p>
            </div>
        );
    }

    const totalRevenue = stats?.overview?.total_revenue ? parseInt(stats.overview.total_revenue, 10) : 0;
    const totalTickets = stats?.overview?.total_tickets_sold || 0;
    const totalUsers = stats?.overview?.total_users || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Standardized Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="gold" size="sm" className="rounded-md shrink-0">
                    Live Analytics
                </Badge>

                {/* Filter Controls on 1 Row - Aligned Right */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 ml-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-cinema-surface text-cinema-gold shrink-0">
                        <Filter className="w-4 h-4" />
                    </div>

                    <div className="w-44 sm:w-52">
                        <Select
                            size="sm"
                            icon={Building2}
                            value={selectedCinema}
                            onChange={(val) => setSelectedCinema(val)}
                            options={[
                                { value: '', label: '-- Tất cả cụm rạp --' },
                                ...cinemas.map(c => ({ value: c.id, label: c.name }))
                            ]}
                        />
                    </div>

                    <div className="w-44 sm:w-52">
                        <Select
                            size="sm"
                            icon={Calendar}
                            value={filterType}
                            onChange={(val) => setFilterType(val)}
                            options={[
                                { value: 'all', label: 'Toàn bộ thời gian' },
                                { value: 'today', label: 'Hôm nay' },
                                { value: 'week', label: 'Tuần này' },
                                { value: 'month', label: 'Tháng này' },
                                { value: 'custom', label: 'Tùy chỉnh ngày...' }
                            ]}
                        />
                    </div>

                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2">
                            <div className="w-32">
                                <DatePicker
                                    size="sm"
                                    value={customStartDate}
                                    onChange={(val) => setCustomStartDate(val)}
                                    placeholder="Từ ngày"
                                />
                            </div>
                            <div className="w-32">
                                <DatePicker
                                    size="sm"
                                    value={customEndDate}
                                    onChange={(val) => setCustomEndDate(val)}
                                    placeholder="Đến ngày"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics Section */}
            {stats && (
                <div className="relative space-y-8">
                    {/* Loading Overlay */}
                    {isFetching && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-cinema-bg/60 backdrop-blur-[2px] transition-all">
                            <div className="flex items-center gap-2 rounded-md border border-cinema-gold/40 bg-cinema-surface px-4 py-2 text-xs font-bold text-cinema-gold shadow-glow-gold-sm">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                                Đang làm mới dữ liệu...
                            </div>
                        </div>
                    )}

                    {/* 3 Main KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* KPI 1: Revenue */}
                        <div className="glass-card rounded-md border border-white/10 p-6 shadow-cinematic relative overflow-hidden group hover:border-cinema-gold/40 transition-all duration-300">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gold-gradient" />
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                                    Tổng Doanh Thu
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cinema-gold/15 border border-cinema-gold/30 text-cinema-gold">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="font-display text-2xl sm:text-3xl font-black gold-text-gradient tracking-tight">
                                    {totalRevenue.toLocaleString('vi-VN')} <span className="text-sm font-bold text-cinema-gold">VNĐ</span>
                                </p>
                                <p className="mt-1 text-xs text-cinema-text-dim flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Doanh thu tính theo bộ lọc hiện tại</span>
                                </p>
                            </div>
                        </div>

                        {/* KPI 2: Tickets */}
                        <div className="glass-card rounded-md border border-white/10 p-6 shadow-cinematic relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                                    Vé Đã Bán
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-400">
                                    <Ticket className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {totalTickets.toLocaleString('vi-VN')} <span className="text-sm font-bold text-purple-400">vé</span>
                                </p>
                                <p className="mt-1 text-xs text-cinema-text-dim">
                                    Số ghế đã thanh toán thành công
                                </p>
                            </div>
                        </div>

                        {/* KPI 3: Users */}
                        <div className="glass-card rounded-md border border-white/10 p-6 shadow-cinematic relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                                    Khách Hàng Hệ Thống
                                </span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {totalUsers.toLocaleString('vi-VN')} <span className="text-sm font-bold text-emerald-400">người</span>
                                </p>
                                <p className="mt-1 text-xs text-cinema-text-dim">
                                    Tài khoản thành viên đã đăng ký
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Revenue Movies Leaderboard */}
                    <div className="glass-card rounded-md border border-white/10 p-6 shadow-cinematic space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="m-0 font-display text-lg font-bold text-cinema-text flex items-center gap-2">
                                <Film className="w-5 h-5 text-cinema-gold" />
                                Top Phim Đạt Doanh Thu Cao Nhất
                            </h3>
                            <span className="text-xs text-cinema-text-dim">
                                Xếp hạng theo doanh thu thực tế
                            </span>
                        </div>

                        {stats.revenue_by_movie.length === 0 ? (
                            <div className="py-12 text-center text-cinema-text-muted space-y-2">
                                <Film className="w-10 h-10 text-cinema-text-dim mx-auto" />
                                <p className="text-sm font-semibold">Chưa có dữ liệu giao dịch trong khoảng thời gian này.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.revenue_by_movie.map((movie, index) => {
                                    const maxRevenue = stats.revenue_by_movie[0]?.total_revenue || 1;
                                    const percentage = Math.round((movie.total_revenue / maxRevenue) * 100);

                                    return (
                                        <div
                                            key={movie.movie_id}
                                            className="rounded-md border border-white/5 bg-cinema-surface-elevated/40 p-4 transition-all duration-200 hover:border-cinema-gold/30 hover:bg-cinema-surface-elevated/70"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-display font-black text-xs ${
                                                        index === 0
                                                            ? 'bg-gold-gradient text-cinema-bg shadow-glow-gold-sm'
                                                            : index === 1
                                                            ? 'bg-slate-300 text-slate-900'
                                                            : index === 2
                                                            ? 'bg-amber-700 text-white'
                                                            : 'bg-white/10 text-cinema-text-muted'
                                                    }`}>
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="m-0 text-sm font-bold text-cinema-text line-clamp-1">
                                                            {movie.title}
                                                        </h4>
                                                        <p className="m-0 text-xs text-cinema-text-dim mt-0.5">
                                                            {movie.booking_count} lượt đặt vé
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-left sm:text-right">
                                                    <p className="m-0 text-sm font-black text-cinema-gold">
                                                        {formatCurrency(movie.total_revenue)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full bg-gold-gradient rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}