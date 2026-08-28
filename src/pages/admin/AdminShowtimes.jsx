import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '@/api/cinemaApi';
import { movieApi } from '@/api/movieApi';
import { systemApi } from '@/api/systemApi';
import { Calendar, Plus, Building2, Film, Clock, Trash2, Sparkles, DollarSign } from 'lucide-react';
import { Button, Badge, Select, Input, DatePicker, MoneyInput } from '@/components/core';
import { formatCurrency } from '@/utils/formatters';

export default function AdminShowtimes() {
    const queryClient = useQueryClient();

    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [startTime, setStartTime] = useState('');
    const [basePrice, setBasePrice] = useState(70000);

    const { data: initData, isLoading: isInitLoading } = useQuery({
        queryKey: ['admin-showtimes-init'],
        queryFn: async () => {
            const [cinemasRes, moviesRes] = await Promise.all([
                cinemaApi.getAll(),
                movieApi.getAll()
            ]);
            const moviesData = moviesRes.data?.movie || moviesRes.data?.movies || moviesRes.data;
            return {
                cinemas: cinemasRes.data,
                movies: moviesData
            };
        },
        onError: () => toast.error('Lỗi tải dữ liệu Rạp/Phim')
    });

    const { data: rooms = [], isFetching: isRoomsLoading } = useQuery({
        queryKey: ['admin-rooms-by-cinema', selectedCinema],
        queryFn: async () => {
            const res = await cinemaApi.getRooms(selectedCinema);
            return res.data;
        },
        enabled: Boolean(selectedCinema),
        onError: () => toast.error('Lỗi tải danh sách phòng')
    });

    const { data: showtimes = [], isLoading: isShowtimesLoading } = useQuery({
        queryKey: ['admin-showtimes-list'],
        queryFn: async () => {
            const res = await systemApi.getShowtimesAdmin({ limit: 50 });
            return res.data?.showtimes || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: (newShowtime) => systemApi.createShowtime(newShowtime),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-showtimes-list']);
            toast.success('Thêm suất chiếu thành công! Đã tự động mở bán ghế.');
            setStartTime('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi thêm suất chiếu')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => systemApi.deleteShowtime(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-showtimes-list']);
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

    if (isInitLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold" />
                <p className="mt-4 font-medium text-cinema-text-muted">Đang tải hệ thống rạp & phim...</p>
            </div>
        );
    }

    const { cinemas = [], movies = [] } = initData || {};

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Lên Lịch Chiếu Mới */}
                <div className="lg:col-span-5">
                    <div className="glass-card rounded-md border border-white/10 p-6 shadow-cinematic space-y-5 lg:sticky lg:top-24">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                            <Plus className="w-5 h-5 text-cinema-gold" />
                            <h3 className="m-0 font-display text-base font-bold text-cinema-text">
                                Lên Lịch Chiếu Mới
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Select
                                    label="1. Chọn Cụm Rạp *"
                                    icon={Building2}
                                    value={selectedCinema}
                                    onChange={(val) => { setSelectedCinema(val); setSelectedRoom(''); }}
                                    options={[
                                        { value: '', label: '-- Chọn cụm rạp --' },
                                        ...cinemas.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />
                            </div>

                            <div>
                                <Select
                                    label="2. Chọn Phòng Chiếu *"
                                    icon={Clock}
                                    value={selectedRoom}
                                    onChange={(val) => setSelectedRoom(val)}
                                    disabled={!selectedCinema || isRoomsLoading}
                                    options={[
                                        { value: '', label: isRoomsLoading ? 'Đang tải phòng...' : '-- Chọn phòng chiếu --' },
                                        ...rooms.map(r => ({ value: r.id, label: `${r.name} (${r.total_seats || 50} ghế)` }))
                                    ]}
                                />
                            </div>

                            <div>
                                <Select
                                    label="3. Chọn Phim *"
                                    icon={Film}
                                    value={selectedMovie}
                                    onChange={(val) => setSelectedMovie(val)}
                                    options={[
                                        { value: '', label: '-- Chọn phim --' },
                                        ...movies.map(m => ({ value: m.id, label: m.title }))
                                    ]}
                                />
                            </div>

                            <DatePicker
                                label="4. Ngày & Giờ Bắt Đầu *"
                                showTime
                                required
                                value={startTime}
                                onChange={(val) => setStartTime(val)}
                                placeholder="Chọn ngày & giờ bắt đầu"
                            />

                            <MoneyInput
                                label="5. Giá Vé Cơ Bản (VNĐ) *"
                                required
                                min={1000}
                                value={basePrice}
                                onChange={(val) => setBasePrice(val)}
                                placeholder="70.000"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={createMutation.isPending}
                                className="w-full rounded-md font-bold tracking-wide shadow-glow-gold-sm mt-2"
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                TẠO SUẤT CHIẾU
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Danh Sách Suất Chiếu Gần Đây */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="m-0 font-display text-lg font-bold text-cinema-text flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cinema-gold" />
                            Suất Chiếu Đang Lên Sóng
                        </h3>
                    </div>

                    {isShowtimesLoading ? (
                        <div className="py-12 text-center text-cinema-text-muted">Đang tải danh sách suất chiếu...</div>
                    ) : showtimes.length === 0 ? (
                        <div className="glass-card rounded-md border border-white/10 p-12 text-center text-cinema-text-muted space-y-2">
                            <Calendar className="w-10 h-10 text-cinema-text-dim mx-auto" />
                            <p className="text-sm font-semibold">Chưa có suất chiếu nào được tạo.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {showtimes.map((st) => (
                                <div
                                    key={st.id}
                                    className="glass-card rounded-md border border-white/10 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cinema-gold/30 transition-all"
                                >
                                    <div className="space-y-1">
                                        <h4 className="m-0 text-base font-bold text-cinema-text line-clamp-1">
                                            {st.movie?.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-cinema-text-muted">
                                            <span className="flex items-center gap-1 text-cinema-gold">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {st.room?.cinema?.name} - {st.room?.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(st.start_time).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        title="Xóa suất chiếu"
                                        onClick={() => handleDelete(st.id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-red-300 shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}