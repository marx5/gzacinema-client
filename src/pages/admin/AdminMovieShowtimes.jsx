import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '../../api/cinemaApi';
import { movieApi } from '../../api/movieApi';
import { systemApi } from '../../api/systemApi';
import { optimizeCloudinaryUrl } from '../../utils/cloudinary';

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
        enabled: !!selectedCinema
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
            toast.success('Đã xóa suất chiếu');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa suất chiếu này')
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!selectedRoom || !startTime || !basePrice) return toast.error('Vui lòng điền đủ thông tin');
        createMutation.mutate({
            movie_id: movieId,
            room_id: selectedRoom,
            start_time: new Date(startTime).toISOString(),
            base_price: parseInt(basePrice)
        });
    };

    if (!movie) return <div className="py-20 text-center font-bold text-brand-text">Đang tải dữ liệu...</div>;

    return (
        <div className="mx-auto mt-6 w-full max-w-[1200px] px-4 md:mt-8 mb-20">
            {/* 1. BREADCRUMBS & THÔNG TIN PHIM */}
            <div className="mb-8 border border-brand-border border-t-4 border-t-brand-500 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-sm text-brand-text-muted">
                    <Link to="/admin/movies" className="font-bold hover:text-brand-600 hover:underline">Phim</Link>
                    <span>/</span>
                    <span className="font-bold text-brand-dark">Quản lý Lịch Chiếu</span>
                </div>

                <div className="flex items-center gap-5 sm:flex-row sm:items-start">
                    <img src={optimizeCloudinaryUrl(movie.thumbnail, 120)} alt={movie.title} loading="lazy" className="h-[120px] w-[80px] object-cover shadow-md" />
                    <div>
                        <h1 className="m-0 font-display text-[28px] font-bold text-brand-dark">{movie.title}</h1>
                        <div className="mt-2 flex gap-4 text-sm font-bold text-brand-text">
                            <span>Thời lượng: {movie.duration_minutes} phút</span>
                            <span>Thể loại: {movie.genre || 'Đang cập nhật'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KHU VỰC CHÍNH: FORM THÊM & DANH SÁCH LỊCH CHIẾU */}
            <div className="grid grid-cols-[340px_1fr] gap-6 lg:grid-cols-[300px_1fr] md:grid-cols-1">

                {/* CỘT TRÁI: FORM THÊM MỚI */}
                <div className="h-fit lg:sticky lg:top-[90px]">
                    <div className="border border-brand-border bg-[#fffaf3] p-5 shadow-[0_8px_22px_rgba(76,45,17,0.08)]">
                        <h3 className="m-0 mb-4 border-b border-brand-border pb-3 font-display text-xl text-brand-dark">
                            Tạo Suất Chiếu
                        </h3>
                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-bold text-brand-dark">Rạp chiếu:</label>
                                <select value={selectedCinema} onChange={e => setSelectedCinema(e.target.value)} className="w-full border border-brand-border bg-white px-3 py-[10px] text-sm focus:border-brand-500 focus:outline-none">
                                    <option value="">-- Chọn rạp --</option>
                                    {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-brand-dark">Phòng chiếu:</label>
                                <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} disabled={!selectedCinema} className="w-full border border-brand-border bg-white px-3 py-[10px] text-sm focus:border-brand-500 focus:outline-none disabled:bg-gray-100">
                                    <option value="">{isRoomsLoading ? 'Đang tải...' : '-- Chọn phòng --'}</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-brand-dark">Ngày & Giờ chiếu:</label>
                                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full border border-brand-border bg-white px-3 py-[10px] text-sm focus:border-brand-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-bold text-brand-dark">Giá vé gốc (VNĐ):</label>
                                <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} min="1000" step="1000" required className="w-full border border-brand-border bg-white px-3 py-[10px] text-sm focus:border-brand-500 focus:outline-none" />
                            </div>
                            <button type="submit" disabled={createMutation.isLoading} className="mt-2 w-full bg-brand-500 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-brand-600 disabled:opacity-70">
                                {createMutation.isLoading ? 'ĐANG XỬ LÝ...' : 'TẠO SUẤT CHIẾU'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI: DANH SÁCH LỊCH CHIẾU ĐÃ NHÓM */}
                <div>
                    <h2 className="m-0 mb-5 font-display text-[26px] text-brand-dark">Lịch chiếu đã lên</h2>

                    {isShowtimesLoading ? (
                        <div className="text-brand-text">Đang tải dữ liệu...</div>
                    ) : Object.keys(groupedShowtimes).length === 0 ? (
                        <div className="border border-dashed border-[#cfb596] bg-white py-12 text-center text-brand-text-muted">
                            Chưa có suất chiếu nào cho bộ phim này.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Vòng lặp Ngày */}
                            {Object.keys(groupedShowtimes).sort().map(dateStr => (
                                <div key={dateStr} className="border border-[#ddcbb6] bg-white shadow-sm overflow-hidden">
                                    {/* Header Ngày */}
                                    <div className="bg-[#fff6ec] border-b border-[#ddcbb6] px-5 py-3">
                                        <h3 className="m-0 text-lg font-bold text-brand-600">📅 Ngày: {dateStr}</h3>
                                    </div>

                                    {/* Vòng lặp Rạp trong ngày đó */}
                                    <div className="p-5 flex flex-col gap-5">
                                        {Object.keys(groupedShowtimes[dateStr]).map(cinemaName => (
                                            <div key={cinemaName} className="border-l-4 border-[#cfb596] pl-4">
                                                <h4 className="m-0 mb-3 text-base font-bold text-brand-dark">{cinemaName}</h4>

                                                {/* Danh sách các Giờ chiếu (Chips) */}
                                                <div className="flex flex-wrap gap-3">
                                                    {groupedShowtimes[dateStr][cinemaName].map(st => (
                                                        <div key={st.id} className="group relative flex min-w-[100px] flex-col overflow-hidden border border-[#ddcbb6] bg-white transition-all hover:border-brand-500 hover:shadow-md">
                                                            {/* Khối hiển thị Giờ & Phòng */}
                                                            <div className="flex flex-col items-center justify-center p-2 text-center">
                                                                <strong className="text-xl text-[#3b2b19]">
                                                                    {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                </strong>
                                                                <span className="mt-[2px] text-[11px] font-bold uppercase tracking-wider text-brand-text">
                                                                    {st.room?.name}
                                                                </span>
                                                            </div>

                                                            {/* Nút Xóa (Dạng trượt từ dưới lên khi Hover) */}
                                                            <button
                                                                onClick={() => window.confirm('Xóa suất chiếu này chứ?') && deleteMutation.mutate(st.id)}
                                                                className="h-0 w-full bg-brand-error text-[11px] font-bold text-white transition-all duration-300 group-hover:h-7 group-hover:py-1"
                                                            >
                                                                XÓA BỎ
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