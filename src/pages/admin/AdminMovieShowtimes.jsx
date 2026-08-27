import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '../../api/cinemaApi';
import { movieApi } from '../../api/movieApi';
import { systemApi } from '../../api/systemApi';
import { Film, Calendar, Clock, Building2, Plus, ArrowLeft, Trash2, Sparkles, MapPin } from 'lucide-react';
import { Button, Badge, Select, Input, DatePicker, MoneyInput } from '../../components/core';
import { formatCurrency } from '../../utils/formatters';

export default function AdminMovieShowtimes() {
    const { id: movieId } = useParams();
    const queryClient = useQueryClient();

    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [startTime, setStartTime] = useState('');
    const [basePrice, setBasePrice] = useState(70000);

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
            const dateObj = new Date(st.start_time);
            const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const cinemaName = st.room?.cinema?.name || 'Rạp chưa xác định';

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
    }, [showtimes]);

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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold" />
                <p className="mt-4 font-medium text-cinema-text-muted">Đang tải thông tin phim...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Movie Banner */}
            <div className="glass-card rounded-md border border-white/10 p-5 shadow-cinematic relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-full bg-gold-gradient" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <img
                            src={movie.thumbnail}
                            alt={movie.title}
                            loading="lazy"
                            className="h-24 w-16 object-cover rounded-md border border-white/10 shadow-md"
                        />
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="gold" size="sm">
                                    {movie.genre || 'Điện ảnh'}
                                </Badge>
                                {movie.age_rating && (
                                    <Badge variant="rose" size="sm">
                                        {movie.age_rating}
                                    </Badge>
                                )}
                            </div>
                            <h2 className="m-0 font-display text-xl sm:text-2xl font-bold text-cinema-text">
                                {movie.title}
                            </h2>
                            <p className="text-xs text-cinema-text-muted flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-cinema-gold" />
                                <span>Thời lượng: {movie.duration_minutes} phút</span>
                            </p>
                        </div>
                    </div>

                    <Link to="/admin/movies">
                        <Button variant="secondary" size="sm" className="rounded-md shrink-0" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Về Danh Sách Phim
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Lên Lịch Cho Phim Này */}
                <div className="lg:col-span-4">
                    <div className="glass-card rounded-md border border-white/10 p-5 shadow-cinematic space-y-4 lg:sticky lg:top-24">
                        <h3 className="m-0 font-display text-base font-bold text-cinema-text border-b border-white/10 pb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-cinema-gold" />
                            Tạo Suất Chiếu Cho Phim
                        </h3>

                        <form onSubmit={handleCreate} className="space-y-3.5">
                            <div>
                                <Select
                                    label="Cụm rạp:"
                                    icon={Building2}
                                    size="sm"
                                    value={selectedCinema}
                                    onChange={(val) => { setSelectedCinema(val); setSelectedRoom(''); }}
                                    options={[
                                        { value: '', label: '-- Chọn rạp chiếu --' },
                                        ...cinemas.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />
                            </div>

                            <div>
                                <Select
                                    label="Phòng chiếu:"
                                    icon={Clock}
                                    size="sm"
                                    value={selectedRoom}
                                    onChange={(val) => setSelectedRoom(val)}
                                    disabled={!selectedCinema}
                                    options={[
                                        { value: '', label: isRoomsLoading ? 'Đang tải...' : '-- Chọn phòng --' },
                                        ...rooms.map(r => ({ value: r.id, label: `${r.name} (${r.total_seats || 50} ghế)` }))
                                    ]}
                                />
                            </div>

                            <DatePicker
                                label="Ngày & Giờ chiếu:"
                                size="sm"
                                showTime
                                required
                                value={startTime}
                                onChange={val => setStartTime(val)}
                                placeholder="Chọn ngày & giờ chiếu"
                            />

                            <MoneyInput
                                label="Giá vé cơ bản (VNĐ):"
                                size="sm"
                                required
                                min={1000}
                                value={basePrice}
                                onChange={val => setBasePrice(val)}
                                placeholder="Ví dụ: 70.000"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={createMutation.isLoading}
                                className="w-full rounded-md font-bold tracking-wide shadow-glow-gold-sm mt-2"
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                TẠO SUẤT CHIẾU
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Danh Sách Lịch Chiếu Theo Ngày */}
                <div className="lg:col-span-8 space-y-4">
                    <h3 className="m-0 font-display text-lg font-bold text-cinema-text border-b border-white/10 pb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cinema-gold" />
                        Danh Sách Suất Chiếu Của Phim
                    </h3>

                    {isShowtimesLoading ? (
                        <div className="py-12 text-center text-cinema-text-muted">Đang tải lịch chiếu...</div>
                    ) : Object.keys(groupedShowtimes).length === 0 ? (
                        <div className="glass-card rounded-md border border-white/10 p-12 text-center text-cinema-text-muted space-y-2">
                            <Calendar className="w-10 h-10 text-cinema-text-dim mx-auto" />
                            <p className="text-sm font-semibold">Chưa có lịch chiếu nào cho bộ phim này.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(groupedShowtimes).sort().map(dateStr => (
                                <div key={dateStr} className="glass-card rounded-md border border-white/10 overflow-hidden shadow-sm">
                                    <div className="bg-cinema-surface-elevated/80 border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
                                        <h4 className="m-0 text-sm font-bold text-cinema-gold flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Ngày: {dateStr}
                                        </h4>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {Object.keys(groupedShowtimes[dateStr]).map(cinemaName => (
                                            <div key={cinemaName} className="border-l-2 border-cinema-gold/60 pl-3.5 space-y-2">
                                                <h5 className="m-0 text-xs font-bold uppercase tracking-wider text-cinema-text flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
                                                    {cinemaName}
                                                </h5>

                                                <div className="flex flex-wrap gap-2.5 pt-1">
                                                    {groupedShowtimes[dateStr][cinemaName].map(st => (
                                                        <div
                                                            key={st.id}
                                                            className="group relative flex min-w-[110px] flex-col overflow-hidden rounded-md border border-white/10 bg-cinema-surface-elevated/60 transition-all hover:border-cinema-gold/50"
                                                        >
                                                            <div className="p-2 text-center space-y-0.5">
                                                                <strong className="text-base font-black text-white">
                                                                    {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                </strong>
                                                                <span className="block text-[10px] font-bold uppercase tracking-wider text-cinema-text-muted">
                                                                    {st.room?.name}
                                                                </span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => window.confirm('Bạn chắc chắn muốn xóa suất chiếu này?') && deleteMutation.mutate(st.id)}
                                                                className="h-0 w-full bg-red-500/80 text-[10px] font-bold text-white transition-all duration-200 group-hover:h-6 group-hover:py-0.5 flex items-center justify-center gap-1"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Xóa
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