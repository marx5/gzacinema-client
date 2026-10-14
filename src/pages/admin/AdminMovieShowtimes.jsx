import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '@/api/cinemaApi';
import { movieApi } from '@/api/movieApi';
import { systemApi } from '@/api/systemApi';
import {
    Calendar,
    Clock,
    Building2,
    Plus,
    ArrowLeft,
    Trash2,
    MapPin,
    Tv
} from 'lucide-react';
import { Button, Badge, Select, DatePicker, MoneyInput } from '@/components/core';
import { formatCurrency } from '@/utils/formatters';

const QUICK_PRICES = [60000, 70000, 85000, 100000, 120000];

export default function AdminMovieShowtimes() {
    const { id: movieId } = useParams();
    const queryClient = useQueryClient();

    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [startTime, setStartTime] = useState('');
    const [basePrice, setBasePrice] = useState(70000);
    const [filterCinemaName, setFilterCinemaName] = useState('');

    const { data: movie } = useQuery({
        queryKey: ['admin-movie-detail', movieId],
        queryFn: async () => (await movieApi.getById(movieId)).data
    });

    const { data: cinemas = [] } = useQuery({
        queryKey: ['admin-cinemas-list'],
        queryFn: async () => (await cinemaApi.getAll()).data
    });

    const { data: rooms = [], isFetching: isRoomsLoading } = useQuery({
        queryKey: ['admin-rooms-by-cinema', selectedCinema],
        queryFn: async () => (await cinemaApi.getRooms(selectedCinema)).data,
        enabled: Boolean(selectedCinema)
    });

    const { data: showtimes = [], isLoading: isShowtimesLoading } = useQuery({
        queryKey: ['admin-showtimes', movieId],
        queryFn: async () => {
            const res = await systemApi.getShowtimesAdmin({ movie_id: movieId, limit: 200 });
            return res.data?.showtimes || [];
        }
    });

    const groupedShowtimes = useMemo(() => {
        if (!showtimes.length) return {};

        const groups = {};

        showtimes.forEach(st => {
            const cinemaName = st.room?.cinema?.name || 'Rạp chưa xác định';
            if (filterCinemaName && cinemaName !== filterCinemaName) return;

            const dateObj = new Date(st.start_time);
            const dateStr = dateObj.toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            if (!groups[dateStr]) groups[dateStr] = {};
            if (!groups[dateStr][cinemaName]) groups[dateStr][cinemaName] = [];

            groups[dateStr][cinemaName].push(st);
        });

        Object.keys(groups).forEach(date => {
            Object.keys(groups[date]).forEach(cinema => {
                groups[date][cinema].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            });
        });

        return groups;
    }, [showtimes, filterCinemaName]);

    const createMutation = useMutation({
        mutationFn: (newShowtime) => systemApi.createShowtime(newShowtime),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-showtimes', movieId]);
            toast.success('Đã thêm suất chiếu mới!');
            setStartTime('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi thêm suất chiếu')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => systemApi.deleteShowtime(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-showtimes', movieId]);
            toast.success('Đã xóa suất chiếu thành công');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa suất chiếu này (đã có khách mua vé)')
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!selectedRoom || !startTime || !basePrice) return toast.error('Vui lòng điền đủ thông tin');
        createMutation.mutate({
            movie_id: movieId,
            room_id: selectedRoom,
            start_time: new Date(startTime).toISOString(),
            base_price: parseInt(basePrice, 10)
        });
    };

    if (!movie) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cinema-gold" />
                <p className="mt-3 text-xs font-medium text-cinema-text-muted">Đang tải thông tin phim...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Compact Header Movie Banner */}
            <div className="rounded-md border border-white/10 bg-[#121324] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        loading="lazy"
                        className="h-20 w-14 object-cover rounded border border-white/10 shrink-0 bg-[#1B1E36]"
                    />
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="gold" size="sm">
                                {movie.genre || 'Điện ảnh'}
                            </Badge>
                            {movie.age_rating && (
                                <Badge variant="rose" size="sm">
                                    {movie.age_rating}
                                </Badge>
                            )}
                            <span className="text-xs text-cinema-text-dim tabular-nums">
                                • Tổng {showtimes.length} suất chiếu
                            </span>
                        </div>
                        <h2 className="m-0 font-display text-lg sm:text-xl font-bold text-white truncate">
                            {movie.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-cinema-text-muted tabular-nums">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-cinema-gold" />
                                Thời lượng: {movie.duration_minutes} phút
                            </span>
                            {movie.release_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
                                    Khởi chiếu: {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <Link to="/admin/movies" className="shrink-0">
                    <Button variant="secondary" size="sm" className="rounded-md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Danh sách phim
                    </Button>
                </Link>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 4 Cols: Form Tạo Suất Chiếu */}
                <div className="lg:col-span-4">
                    <div className="rounded-md border border-white/10 bg-[#121324] p-5 space-y-4 lg:sticky lg:top-20">
                        <h3 className="m-0 font-display text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-cinema-gold" />
                            Thêm Suất Chiếu Cho Phim
                        </h3>

                        <form onSubmit={handleCreate} className="space-y-3.5">
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
                                disabled={!selectedCinema}
                                options={[
                                    { value: '', label: isRoomsLoading ? 'Đang tải...' : '-- Chọn phòng chiếu --' },
                                    ...rooms.map(r => ({ value: r.id, label: `${r.name} (${r.total_seats || 50} ghế)` }))
                                ]}
                            />

                            <DatePicker
                                label="3. Ngày & Giờ chiếu *"
                                size="sm"
                                showTime
                                required
                                value={startTime}
                                onChange={val => setStartTime(val)}
                                placeholder="Chọn ngày & giờ chiếu"
                            />

                            <div className="space-y-1.5">
                                <MoneyInput
                                    label="4. Giá vé cơ bản (VNĐ) *"
                                    size="sm"
                                    required
                                    min={1000}
                                    value={basePrice}
                                    onChange={val => setBasePrice(val)}
                                    placeholder="Ví dụ: 70.000"
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

                {/* Right 8 Cols: Danh Sách Lịch Chiếu Theo Ngày */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-white/10 bg-[#121324] px-4 py-3">
                        <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cinema-gold" />
                            Lịch Chiếu Đã Lên Sóng
                        </h3>

                        <div className="w-full sm:w-52">
                            <Select
                                size="sm"
                                value={filterCinemaName}
                                onChange={(val) => setFilterCinemaName(val)}
                                options={[
                                    { value: '', label: 'Tất cả cụm rạp' },
                                    ...cinemas.map(c => ({ value: c.name, label: c.name }))
                                ]}
                            />
                        </div>
                    </div>

                    {isShowtimesLoading ? (
                        <div className="rounded-md border border-white/10 bg-[#121324] py-16 text-center text-xs text-cinema-text-muted">
                            Đang tải lịch chiếu...
                        </div>
                    ) : Object.keys(groupedShowtimes).length === 0 ? (
                        <div className="rounded-md border border-white/10 bg-[#121324] p-12 text-center text-cinema-text-muted space-y-2">
                            <Calendar className="w-8 h-8 text-cinema-text-dim mx-auto" />
                            <p className="text-xs font-medium">Chưa có lịch chiếu nào cho bộ phim này.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(groupedShowtimes).map(dateStr => (
                                <div key={dateStr} className="rounded-md border border-white/10 bg-[#121324] overflow-hidden">
                                    <div className="bg-[#16182D] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
                                        <h4 className="m-0 text-xs font-bold text-cinema-gold flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {dateStr}
                                        </h4>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {Object.keys(groupedShowtimes[dateStr]).map(cinemaName => (
                                            <div key={cinemaName} className="border-l-2 border-cinema-gold/50 pl-3.5 space-y-2.5">
                                                <h5 className="m-0 text-xs font-bold text-white flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
                                                    {cinemaName}
                                                </h5>

                                                <div className="flex flex-wrap gap-2.5">
                                                    {groupedShowtimes[dateStr][cinemaName].map(st => (
                                                        <div
                                                            key={st.id}
                                                            className="flex items-center justify-between gap-2.5 rounded-md border border-white/10 bg-[#17192E] px-3 py-2 hover:border-cinema-gold/40 transition-colors"
                                                        >
                                                            <div>
                                                                <div className="font-mono text-sm font-black text-white tabular-nums leading-none">
                                                                    {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cinema-text-muted">
                                                                    <span className="font-bold uppercase text-cinema-gold">{st.room?.name}</span>
                                                                    {st.base_price && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="tabular-nums">{formatCurrency(st.base_price)}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                title="Xóa suất chiếu"
                                                                onClick={() => window.confirm('Bạn chắc chắn muốn xóa suất chiếu này?') && deleteMutation.mutate(st.id)}
                                                                className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-white/5 text-cinema-text-dim hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-400 transition cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}