import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '@/api/cinemaApi';
import { movieApi } from '@/api/movieApi';
import { systemApi } from '@/api/systemApi';
import {
    Calendar,
    Plus,
    Building2,
    Film,
    Trash2,
    Search,
    LayoutList,
    CalendarDays,
    X,
    Tv
} from 'lucide-react';
import { Button, Badge, Select, DatePicker, MoneyInput } from '@/components/core';
import { formatCurrency } from '@/utils/formatters';

const QUICK_PRICES = [60000, 70000, 85000, 100000, 120000];

export default function AdminShowtimes() {
    const queryClient = useQueryClient();

    // Form state
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [startTime, setStartTime] = useState('');
    const [basePrice, setBasePrice] = useState(70000);

    // Filter & View state for list
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCinemaId, setFilterCinemaId] = useState('');
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'table'

    const { data: initData, isLoading: isInitLoading, isError: isInitError } = useQuery({
        queryKey: ['admin-showtimes-init'],
        queryFn: async () => {
            const [cinemasRes, moviesRes] = await Promise.all([
                cinemaApi.getAll(),
                movieApi.getAll({ limit: 100 })
            ]);
            const moviesData = moviesRes.data?.movie || moviesRes.data?.movies || moviesRes.data || [];
            return {
                cinemas: cinemasRes.data || [],
                movies: Array.isArray(moviesData) ? moviesData : []
            };
        }
    });

    const { data: rooms = [], isFetching: isRoomsLoading, isError: isRoomsError } = useQuery({
        queryKey: ['admin-rooms-by-cinema', selectedCinema],
        queryFn: async () => {
            const res = await cinemaApi.getRooms(selectedCinema);
            return res.data;
        },
        enabled: Boolean(selectedCinema)
    });

    useEffect(() => {
        if (isInitError) toast.error('Lỗi tải dữ liệu Rạp/Phim');
    }, [isInitError]);

    useEffect(() => {
        if (isRoomsError) toast.error('Lỗi tải danh sách phòng');
    }, [isRoomsError]);

    const { data: showtimes = [], isLoading: isShowtimesLoading } = useQuery({
        queryKey: ['admin-showtimes-list'],
        queryFn: async () => {
            const res = await systemApi.getShowtimesAdmin({ limit: 100 });
            return res.data?.showtimes || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: (newShowtime) => systemApi.createShowtime(newShowtime),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-showtimes-list'] });
            toast.success('Thêm suất chiếu thành công! Đã tự động mở bán ghế.');
            setStartTime('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi thêm suất chiếu')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => systemApi.deleteShowtime(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-showtimes-list'] });
            toast.success('Đã xóa suất chiếu thành công');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa suất chiếu này (đã có vé bán ra)')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedMovie || !selectedRoom || !startTime || !basePrice) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        createMutation.mutate({
            movie_id: selectedMovie,
            room_id: selectedRoom,
            start_time: new Date(startTime).toISOString(),
            base_price: parseInt(basePrice, 10)
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa suất chiếu này?')) {
            deleteMutation.mutate(id);
        }
    };

    const { cinemas = [], movies = [] } = initData || {};

    const filteredShowtimes = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return showtimes.filter((st) => {
            if (filterCinemaId && String(st.room?.cinema?.id || st.room?.cinema_id || '') !== String(filterCinemaId)) {
                const matchedCinema = cinemas.find(c => String(c.id) === String(filterCinemaId));
                if (matchedCinema && st.room?.cinema?.name !== matchedCinema.name) {
                    return false;
                }
            }
            if (!q) return true;
            const movieTitle = (st.movie?.title || '').toLowerCase();
            const cinemaName = (st.room?.cinema?.name || '').toLowerCase();
            const roomName = (st.room?.name || '').toLowerCase();
            return movieTitle.includes(q) || cinemaName.includes(q) || roomName.includes(q);
        });
    }, [showtimes, searchQuery, filterCinemaId, cinemas]);

    const groupedByDate = useMemo(() => {
        const groups = {};
        filteredShowtimes.forEach((st) => {
            const d = new Date(st.start_time);
            const dateKey = d.toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(st);
        });
        Object.keys(groups).forEach((k) => {
            groups[k].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        });
        return groups;
    }, [filteredShowtimes]);

    if (isInitLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cinema-gold" />
                <p className="mt-3 text-xs font-medium text-cinema-text-muted">Đang tải hệ thống rạp & phim...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 4 Cols: Form Lên Lịch Chiếu Mới */}
            <div className="lg:col-span-4">
                <div className="rounded-md border border-white/10 bg-[#121324] p-5 space-y-4 lg:sticky lg:top-20">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-cinema-gold" />
                            <h3 className="m-0 font-display text-sm font-bold text-white">
                                Lên Lịch Suất Chiếu Mới
                            </h3>
                        </div>
                        <Badge variant="gold" size="sm">Tự động tạo ghế</Badge>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <Select
                            label="1. Cụm rạp *"
                            icon={Building2}
                            size="sm"
                            value={selectedCinema}
                            onChange={(val) => { setSelectedCinema(val); setSelectedRoom(''); }}
                            options={[
                                { value: '', label: '-- Chọn cụm rạp --' },
                                ...cinemas.map(c => ({ value: c.id, label: c.name }))
                            ]}
                        />

                        <Select
                            label="2. Phòng chiếu *"
                            icon={Tv}
                            size="sm"
                            value={selectedRoom}
                            onChange={(val) => setSelectedRoom(val)}
                            disabled={!selectedCinema || isRoomsLoading}
                            options={[
                                { value: '', label: isRoomsLoading ? 'Đang tải phòng...' : '-- Chọn phòng chiếu --' },
                                ...rooms.map(r => ({ value: r.id, label: `${r.name} (${r.total_seats || 50} ghế)` }))
                            ]}
                        />

                        <Select
                            label="3. Phim điện ảnh *"
                            icon={Film}
                            size="sm"
                            value={selectedMovie}
                            onChange={(val) => setSelectedMovie(val)}
                            options={[
                                { value: '', label: '-- Chọn bộ phim --' },
                                ...movies.map(m => ({ value: m.id, label: m.title }))
                            ]}
                        />

                        <DatePicker
                            label="4. Ngày & Giờ bắt đầu *"
                            size="sm"
                            showTime
                            required
                            value={startTime}
                            onChange={(val) => setStartTime(val)}
                            placeholder="Chọn ngày & giờ bắt đầu"
                        />

                        <div className="space-y-1.5">
                            <MoneyInput
                                label="5. Giá vé cơ bản (VNĐ) *"
                                size="sm"
                                required
                                min={1000}
                                value={basePrice}
                                onChange={(val) => setBasePrice(val)}
                                placeholder="70.000"
                            />
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                {QUICK_PRICES.map((p) => {
                                    const active = Number(basePrice) === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setBasePrice(p)}
                                            className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums transition cursor-pointer ${
                                                active
                                                    ? 'bg-cinema-gold text-cinema-bg font-bold'
                                                    : 'bg-white/5 border border-white/10 text-cinema-text-muted hover:text-white'
                                            }`}
                                        >
                                            {p / 1000}k
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            isLoading={createMutation.isPending}
                            className="w-full rounded-md font-bold tracking-wide mt-2"
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Tạo Suất Chiếu
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right 8 Cols: Danh Sách Suất Chiếu */}
            <div className="lg:col-span-8 space-y-4">
                {/* Filter & View Switcher Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-md border border-white/10 bg-[#121324] p-3">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="w-3.5 h-3.5 text-cinema-text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo tên phim, rạp hoặc phòng..."
                                className="w-full rounded-md border border-white/10 bg-[#0E101E] pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-cinema-text-dim outline-none focus:border-cinema-gold"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-cinema-text-dim hover:text-white cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="w-44">
                            <Select
                                size="sm"
                                value={filterCinemaId}
                                onChange={(val) => setFilterCinemaId(val)}
                                options={[
                                    { value: '', label: 'Tất cả cụm rạp' },
                                    ...cinemas.map(c => ({ value: c.id, label: c.name }))
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <span className="text-xs text-cinema-text-dim tabular-nums">
                            <strong className="text-white">{filteredShowtimes.length}</strong> suất
                        </span>

                        <div className="flex items-center bg-[#0B0C16] p-1 rounded-md border border-white/[0.06]">
                            <button
                                type="button"
                                onClick={() => setViewMode('timeline')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                    viewMode === 'timeline'
                                        ? 'bg-[#1F223D] text-cinema-gold border border-white/10'
                                        : 'text-cinema-text-dim hover:text-white'
                                }`}
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>Theo ngày</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                    viewMode === 'table'
                                        ? 'bg-[#1F223D] text-cinema-gold border border-white/10'
                                        : 'text-cinema-text-dim hover:text-white'
                                }`}
                            >
                                <LayoutList className="w-3.5 h-3.5" />
                                <span>Bảng</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Showtimes Content */}
                {isShowtimesLoading ? (
                    <div className="rounded-md border border-white/10 bg-[#121324] py-16 text-center text-xs text-cinema-text-muted">
                        Đang tải danh sách suất chiếu...
                    </div>
                ) : filteredShowtimes.length === 0 ? (
                    <div className="rounded-md border border-white/10 bg-[#121324] py-14 text-center text-cinema-text-muted space-y-2">
                        <Calendar className="w-8 h-8 text-cinema-text-dim mx-auto" />
                        <p className="text-xs font-medium">Không tìm thấy suất chiếu nào phù hợp.</p>
                    </div>
                ) : viewMode === 'timeline' ? (
                    <div className="space-y-4">
                        {Object.keys(groupedByDate).map((dateLabel) => (
                            <div key={dateLabel} className="rounded-md border border-white/10 bg-[#121324] overflow-hidden">
                                <div className="flex items-center justify-between border-b border-white/10 bg-[#16182D] px-4 py-2.5">
                                    <span className="text-xs font-bold text-cinema-gold flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {dateLabel}
                                    </span>
                                    <span className="text-[11px] text-cinema-text-dim font-medium">
                                        {groupedByDate[dateLabel].length} suất chiếu
                                    </span>
                                </div>

                                <div className="divide-y divide-white/[0.06]">
                                    {groupedByDate[dateLabel].map((st) => {
                                        const startObj = new Date(st.start_time);
                                        const timeStr = startObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <div
                                                key={st.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="flex flex-col items-center justify-center rounded border border-cinema-gold/30 bg-cinema-gold/10 px-2.5 py-1.5 min-w-[64px] shrink-0">
                                                        <span className="font-mono text-sm font-black text-cinema-gold tabular-nums leading-none">
                                                            {timeStr}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-white truncate">
                                                            {st.movie?.title || 'Phim chưa xác định'}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-cinema-text-muted mt-0.5">
                                                            <span className="inline-flex items-center gap-1 text-cinema-text">
                                                                <Building2 className="w-3 h-3 text-cinema-gold" />
                                                                {st.room?.cinema?.name}
                                                            </span>
                                                            <span className="text-cinema-text-dim">•</span>
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-semibold">
                                                                {st.room?.name}
                                                            </span>
                                                            {st.base_price && (
                                                                <>
                                                                    <span className="text-cinema-text-dim">•</span>
                                                                    <span className="font-semibold text-cinema-gold tabular-nums">
                                                                        {formatCurrency(st.base_price)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-1.5 shrink-0">
                                                    {st.movie_id && (
                                                        <Link
                                                            to={`/admin/movies/${st.movie_id}/showtimes`}
                                                            title="Xem tất cả lịch của phim này"
                                                            className="px-2.5 py-1 rounded border border-white/10 bg-[#1B1E36] text-[11px] font-medium text-cinema-text-muted hover:text-white transition"
                                                        >
                                                            Theo phim
                                                        </Link>
                                                    )}
                                                    <button
                                                        type="button"
                                                        title="Xóa suất chiếu"
                                                        onClick={() => handleDelete(st.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:border-red-400/50 hover:text-red-400 transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="rounded-md border border-white/10 bg-[#121324] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[640px]">
                                <thead className="bg-[#181A30] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted">
                                    <tr>
                                        <th className="px-4 py-3 w-36">Thời gian</th>
                                        <th className="px-4 py-3">Bộ phim</th>
                                        <th className="px-4 py-3">Cụm rạp & Phòng</th>
                                        <th className="px-4 py-3 w-28 text-right">Giá cơ bản</th>
                                        <th className="px-4 py-3 w-20 text-center">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.06] text-[13px]">
                                    {filteredShowtimes.map((st) => {
                                        const d = new Date(st.start_time);
                                        return (
                                            <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3 tabular-nums">
                                                    <div className="font-mono font-bold text-cinema-gold">
                                                        {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-[11px] text-cinema-text-dim">
                                                        {d.toLocaleDateString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-white">
                                                    {st.movie?.title}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-cinema-text font-medium">{st.room?.cinema?.name}</div>
                                                    <div className="text-[11px] text-cinema-text-dim">{st.room?.name}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-cinema-gold tabular-nums">
                                                    {st.base_price ? formatCurrency(st.base_price) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(st.id)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:border-red-400/50 hover:text-red-400 transition cursor-pointer"
                                                        title="Xóa suất chiếu"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}