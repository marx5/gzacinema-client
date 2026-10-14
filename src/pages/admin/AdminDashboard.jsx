import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { systemApi } from '@/api/systemApi';
import { cinemaApi } from '@/api/cinemaApi';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatters';
import {
    DollarSign,
    Ticket,
    Users,
    Calendar,
    Building2,
    Film,
    TrendingUp,
    RefreshCw,
    Search,
    ArrowUpRight,
    QrCode,
    BarChart3,
    Layers
} from 'lucide-react';
import { Select, DatePicker } from '@/components/core';

const TIME_FILTERS = [
    { value: 'all', label: 'Toàn thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chỉnh' },
];

export default function AdminDashboard() {
    const [filterType, setFilterType] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedCinema, setSelectedCinema] = useState('');
    const [movieSearch, setMovieSearch] = useState('');

    const { data: cinemas = [] } = useQuery({
        queryKey: ['admin-cinemas-list'],
        queryFn: async () => {
            const res = await cinemaApi.getAll();
            return res.data;
        },
        onError: () => toast.error('Không thể tải danh sách rạp')
    });

    const { data: stats, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-stats', filterType, customStartDate, customEndDate, selectedCinema],
        queryFn: async () => {
            const params = {};

            if (selectedCinema) params.cinemaId = selectedCinema;

            const now = new Date();
            if (filterType === 'today') {
                params.startDate = now.toISOString().split('T')[0];
                params.endDate = params.startDate;
            } else if (filterType === 'week') {
                const day = now.getDay() || 7;
                const firstDay = new Date(now);
                firstDay.setDate(now.getDate() - day + 1);
                const lastDay = new Date(firstDay);
                lastDay.setDate(firstDay.getDate() + 6);
                params.startDate = firstDay.toISOString().split('T')[0];
                params.endDate = lastDay.toISOString().split('T')[0];
            } else if (filterType === 'month') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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

    const revenueByMovie = useMemo(() => {
        return (stats?.revenue_by_movie || []).map(item => ({
            ...item,
            total_revenue: Number(item.total_revenue || 0),
            booking_count: Number(item.booking_count || 0),
        }));
    }, [stats]);

    const totalRevenue = stats?.overview?.total_revenue ? parseInt(stats.overview.total_revenue, 10) : 0;
    const totalTickets = Number(stats?.overview?.total_tickets_sold || 0);
    const totalUsers = Number(stats?.overview?.total_users || 0);
    const totalBookingsCount = useMemo(
        () => revenueByMovie.reduce((acc, m) => acc + m.booking_count, 0),
        [revenueByMovie]
    );
    const avgTicketValue = totalTickets > 0 ? Math.round(totalRevenue / totalTickets) : 0;

    const filteredMovieStats = useMemo(() => {
        const q = movieSearch.trim().toLowerCase();
        if (!q) return revenueByMovie;
        return revenueByMovie.filter(m => (m.title || '').toLowerCase().includes(q));
    }, [revenueByMovie, movieSearch]);

    if (isLoading && !stats) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cinema-gold" />
                <p className="mt-3 text-xs font-medium text-cinema-text-muted">Đang tải dữ liệu thống kê...</p>
            </div>
        );
    }

    const barColors = [
        'bg-cinema-gold',
        'bg-blue-500',
        'bg-purple-500',
        'bg-emerald-500',
        'bg-rose-500',
    ];

    return (
        <div className="space-y-5">
            {/* Top Filter & Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-md border border-white/10 bg-[#121324] p-3">
                {/* Segmented Time Filter */}
                <div className="flex flex-wrap items-center gap-1 bg-[#0B0C16] p-1 rounded-md border border-white/[0.06]">
                    {TIME_FILTERS.map((tab) => {
                        const active = filterType === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setFilterType(tab.value)}
                                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                                    active
                                        ? 'bg-cinema-gold text-cinema-bg font-bold'
                                        : 'text-cinema-text-muted hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Right Controls: Custom Date + Cinema Select + Refresh */}
                <div className="flex flex-wrap items-center gap-2">
                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2">
                            <div className="w-36">
                                <DatePicker
                                    size="sm"
                                    value={customStartDate}
                                    onChange={(val) => setCustomStartDate(val)}
                                    placeholder="Từ ngày"
                                />
                            </div>
                            <span className="text-xs text-cinema-text-dim">-</span>
                            <div className="w-36">
                                <DatePicker
                                    size="sm"
                                    value={customEndDate}
                                    onChange={(val) => setCustomEndDate(val)}
                                    placeholder="Đến ngày"
                                />
                            </div>
                        </div>
                    )}

                    <div className="w-48 sm:w-56">
                        <Select
                            size="sm"
                            icon={Building2}
                            value={selectedCinema}
                            onChange={(val) => setSelectedCinema(val)}
                            options={[
                                { value: '', label: 'Tất cả cụm rạp' },
                                ...cinemas.map(c => ({ value: c.id, label: c.name }))
                            ]}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Làm mới số liệu"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-cinema-surface text-cinema-text-muted hover:text-white hover:border-white/20 transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-cinema-gold' : ''}`} />
                    </button>
                </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* KPI 1: Revenue */}
                <div className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted">
                            Tổng Doanh Thu
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/30">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="m-0 font-display text-2xl font-black text-cinema-gold tabular-nums tracking-tight">
                            {formatCurrency(totalRevenue)}
                        </p>
                        <p className="mt-1 text-[11px] text-cinema-text-dim flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>Từ {totalBookingsCount.toLocaleString('vi-VN')} đơn thanh toán thành công</span>
                        </p>
                    </div>
                </div>

                {/* KPI 2: Tickets Sold */}
                <div className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted">
                            Tổng Vé Đã Bán
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            <Ticket className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="m-0 font-display text-2xl font-black text-white tabular-nums tracking-tight">
                            {totalTickets.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-cinema-text-muted">ghế</span>
                        </p>
                        <p className="mt-1 text-[11px] text-cinema-text-dim">
                            Trung bình {totalBookingsCount > 0 ? (totalTickets / totalBookingsCount).toFixed(1) : 0} vé / đơn hàng
                        </p>
                    </div>
                </div>

                {/* KPI 3: Average Ticket Price */}
                <div className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted">
                            Đơn Giá Vé Trung Bình
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="m-0 font-display text-2xl font-black text-white tabular-nums tracking-tight">
                            {formatCurrency(avgTicketValue)}
                        </p>
                        <p className="mt-1 text-[11px] text-cinema-text-dim">
                            {revenueByMovie.length} phim phát sinh doanh thu
                        </p>
                    </div>
                </div>

                {/* KPI 4: Customers */}
                <div className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted">
                            Khách Hàng Thành Viên
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="m-0 font-display text-2xl font-black text-white tabular-nums tracking-tight">
                            {totalUsers.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-cinema-text-muted">tài khoản</span>
                        </p>
                        <p className="mt-1 text-[11px] text-cinema-text-dim">
                            Người dùng đăng ký trên hệ thống
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Analytics Content: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 8 Cols: Detailed Movie Revenue Leaderboard Table */}
                <div className="lg:col-span-8 rounded-md border border-white/10 bg-[#121324] overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5 bg-[#16182D]">
                        <div>
                            <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                                <Film className="w-4 h-4 text-cinema-gold" />
                                Bảng Xếp Hạng Doanh Thu Theo Phim ({filteredMovieStats.length})
                            </h3>
                            <p className="m-0 text-[11px] text-cinema-text-dim mt-0.5">
                                Chi tiết số đơn đặt vé, tỷ trọng đóng góp và tổng doanh thu từng phim
                            </p>
                        </div>

                        {/* Quick Search Movie in Stats */}
                        <div className="relative w-full sm:w-56">
                            <Search className="w-3.5 h-3.5 text-cinema-text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={movieSearch}
                                onChange={(e) => setMovieSearch(e.target.value)}
                                placeholder="Lọc nhanh tên phim..."
                                className="w-full rounded-md border border-white/10 bg-[#0E101E] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-cinema-text-dim outline-none focus:border-cinema-gold"
                            />
                        </div>
                    </div>

                    {filteredMovieStats.length === 0 ? (
                        <div className="py-14 text-center text-cinema-text-muted space-y-2">
                            <Film className="w-8 h-8 text-cinema-text-dim mx-auto" />
                            <p className="text-xs font-medium">Chưa có dữ liệu giao dịch phù hợp với bộ lọc hiện tại.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-[#181A30] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted">
                                    <tr>
                                        <th className="px-4 py-3 w-14 text-center">Hạng</th>
                                        <th className="px-4 py-3">Phim điện ảnh</th>
                                        <th className="px-4 py-3 w-28 text-right">Số đơn</th>
                                        <th className="px-4 py-3 w-44">Tỷ trọng</th>
                                        <th className="px-4 py-3 w-36 text-right">Doanh thu</th>
                                        <th className="px-4 py-3 w-16 text-center">Lịch</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06] text-[13px]">
                                    {filteredMovieStats.map((movie, index) => {
                                        const sharePercent = totalRevenue > 0
                                            ? Math.round((movie.total_revenue / totalRevenue) * 100)
                                            : 0;
                                        const maxRev = revenueByMovie[0]?.total_revenue || 1;
                                        const barWidth = Math.max(4, Math.round((movie.total_revenue / maxRev) * 100));

                                        return (
                                            <tr key={movie.movie_id || index} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-black tabular-nums ${
                                                        index === 0
                                                            ? 'bg-cinema-gold text-cinema-bg'
                                                            : index === 1
                                                            ? 'bg-slate-300 text-slate-900'
                                                            : index === 2
                                                            ? 'bg-amber-700 text-white'
                                                            : 'bg-white/5 text-cinema-text-muted'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-white line-clamp-1">
                                                        {movie.title}
                                                    </div>
                                                    <div className="text-[11px] text-cinema-text-dim tabular-nums">
                                                        TB: {movie.booking_count > 0 ? formatCurrency(Math.round(movie.total_revenue / movie.booking_count)) : '0 ₫'} / đơn
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums font-medium text-cinema-text">
                                                    {movie.booking_count.toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                            <div
                                                                className="h-full bg-cinema-gold rounded-full"
                                                                style={{ width: `${barWidth}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-9 text-right text-xs font-semibold text-cinema-text-muted tabular-nums">
                                                            {sharePercent}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-cinema-gold tabular-nums">
                                                    {formatCurrency(movie.total_revenue)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {movie.movie_id && (
                                                        <Link
                                                            to={`/admin/movies/${movie.movie_id}/showtimes`}
                                                            title="Xem lịch chiếu phim này"
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-cinema-surface text-cinema-text-muted hover:text-cinema-gold hover:border-cinema-gold/40 transition"
                                                        >
                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right 4 Cols: Revenue Share Visual & Quick Operations */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Top 5 Revenue Distribution Card */}
                    <div className="rounded-md border border-white/10 bg-[#121324] p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-cinema-gold" />
                                Cơ Cấu Doanh Thu Top Đầu
                            </h3>
                            <span className="text-[11px] text-cinema-text-dim">Top 5 phim</span>
                        </div>

                        {revenueByMovie.length === 0 || totalRevenue === 0 ? (
                            <p className="text-xs text-cinema-text-dim py-4 text-center">
                                Chưa có dữ liệu phân bổ doanh thu
                            </p>
                        ) : (
                            <>
                                {/* Stacked Horizontal Bar */}
                                <div className="flex h-3 w-full overflow-hidden rounded bg-white/5 gap-0.5">
                                    {revenueByMovie.slice(0, 5).map((m, idx) => {
                                        const pct = Math.max(2, Math.round((m.total_revenue / totalRevenue) * 100));
                                        return (
                                            <div
                                                key={m.movie_id || idx}
                                                className={`${barColors[idx % barColors.length]} h-full transition-all`}
                                                style={{ width: `${pct}%` }}
                                                title={`${m.title}: ${pct}%`}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Legend List */}
                                <div className="space-y-2 pt-1">
                                    {revenueByMovie.slice(0, 5).map((m, idx) => {
                                        const pct = totalRevenue > 0
                                            ? ((m.total_revenue / totalRevenue) * 100).toFixed(1)
                                            : '0.0';
                                        return (
                                            <div key={m.movie_id || idx} className="flex items-center justify-between text-xs gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`h-2.5 w-2.5 rounded-sm shrink-0 ${barColors[idx % barColors.length]}`} />
                                                    <span className="text-cinema-text truncate">{m.title}</span>
                                                </div>
                                                <span className="font-bold text-cinema-text-muted tabular-nums shrink-0">
                                                    {pct}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Management Shortcuts */}
                    <div className="rounded-md border border-white/10 bg-[#121324] p-4 space-y-3">
                        <div className="border-b border-white/10 pb-2.5">
                            <h3 className="m-0 font-display text-sm font-bold text-white">
                                Lối Tắt Vận Hành Nhanh
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Link
                                to="/admin/movies"
                                className="flex items-center justify-between rounded-md border border-white/[0.07] bg-[#17192E] hover:border-cinema-gold/40 hover:bg-[#1C1F38] p-3 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-cinema-gold/15 text-cinema-gold">
                                        <Film className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-cinema-gold transition-colors">
                                            Quản lý danh mục Phim
                                        </div>
                                        <div className="text-[11px] text-cinema-text-dim">
                                            Thêm phim mới, cập nhật poster & trailer
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-cinema-text-dim group-hover:text-cinema-gold" />
                            </Link>

                            <Link
                                to="/admin/showtimes"
                                className="flex items-center justify-between rounded-md border border-white/[0.07] bg-[#17192E] hover:border-cinema-gold/40 hover:bg-[#1C1F38] p-3 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/15 text-blue-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-cinema-gold transition-colors">
                                            Lên lịch suất chiếu
                                        </div>
                                        <div className="text-[11px] text-cinema-text-dim">
                                            Mở bán vé theo cụm rạp và phòng chiếu
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-cinema-text-dim group-hover:text-cinema-gold" />
                            </Link>

                            <Link
                                to="/admin/bookings"
                                className="flex items-center justify-between rounded-md border border-white/[0.07] bg-[#17192E] hover:border-cinema-gold/40 hover:bg-[#1C1F38] p-3 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/15 text-purple-400">
                                        <Ticket className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-cinema-gold transition-colors">
                                            Tra cứu đơn đặt vé
                                        </div>
                                        <div className="text-[11px] text-cinema-text-dim">
                                            Kiểm tra trạng thái thanh toán & mã QR vé
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-cinema-text-dim group-hover:text-cinema-gold" />
                            </Link>

                            <Link
                                to="/admin/checkin"
                                className="flex items-center justify-between rounded-md border border-white/[0.07] bg-[#17192E] hover:border-cinema-gold/40 hover:bg-[#1C1F38] p-3 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/15 text-emerald-400">
                                        <QrCode className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-cinema-gold transition-colors">
                                            Bàn soát vé QR Code
                                        </div>
                                        <div className="text-[11px] text-cinema-text-dim">
                                            Xác thực vé nhanh bằng Camera hoặc mã vé
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-cinema-text-dim group-hover:text-cinema-gold" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}