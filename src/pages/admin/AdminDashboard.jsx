import { useState, useMemo, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { systemApi } from '@/api/systemApi';
import { cinemaApi } from '@/api/cinemaApi';
import toast from 'react-hot-toast';
import { toLocalDateString } from '@/utils/formatters';
import {
    Building2,
    RefreshCw
} from 'lucide-react';
import { Select, DatePicker } from '@/components/core';
import { DashboardKpiGrid, DashboardRevenueSection } from './components/DashboardStatsSections';

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

    const { data: cinemas = [], isError: isCinemasError } = useQuery({
        queryKey: ['admin-cinemas-list'],
        queryFn: async () => {
            const res = await cinemaApi.getAll();
            return res.data;
        }
    });

    useEffect(() => {
        if (isCinemasError) toast.error('Không thể tải danh sách rạp');
    }, [isCinemasError]);

    const { data: stats, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-stats', filterType, customStartDate, customEndDate, selectedCinema],
        queryFn: async () => {
            const params = {};

            if (selectedCinema) params.cinemaId = selectedCinema;

            const now = new Date();
            if (filterType === 'today') {
                params.startDate = toLocalDateString(now);
                params.endDate = params.startDate;
            } else if (filterType === 'week') {
                const day = now.getDay() || 7;
                const firstDay = new Date(now);
                firstDay.setDate(now.getDate() - day + 1);
                const lastDay = new Date(firstDay);
                lastDay.setDate(firstDay.getDate() + 6);
                params.startDate = toLocalDateString(firstDay);
                params.endDate = toLocalDateString(lastDay);
            } else if (filterType === 'month') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                params.startDate = toLocalDateString(firstDay);
                params.endDate = toLocalDateString(lastDay);
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
            <DashboardKpiGrid
                totalRevenue={totalRevenue}
                totalBookingsCount={totalBookingsCount}
                totalTickets={totalTickets}
                avgTicketValue={avgTicketValue}
                revenueMovieCount={revenueByMovie.length}
                totalUsers={totalUsers}
            />

            {/* Main Analytics Content: 2 Columns */}
            <DashboardRevenueSection
                filteredMovieStats={filteredMovieStats}
                revenueByMovie={revenueByMovie}
                totalRevenue={totalRevenue}
                movieSearch={movieSearch}
                onMovieSearchChange={setMovieSearch}
            />
        </div>
    );
}