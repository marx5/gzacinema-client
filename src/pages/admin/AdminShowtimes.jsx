import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '../../api/cinemaApi';
import { movieApi } from '../../api/movieApi';
import { systemApi } from '../../api/systemApi';

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
        enabled: !!selectedCinema,
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
            toast.success('Thêm suất chiếu thành công! Đã mở bán 50 ghế.');
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
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa suất chiếu này (đã có khách mua vé)')
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
            base_price: parseInt(basePrice)
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isInitLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải hệ thống...</div>;

    const { cinemas = [], movies = [] } = initData || {};
    const isSubmitting = createMutation.isLoading;

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19]">Quản Lý Lịch Chiếu</h1>

            <div className="mt-5 grid grid-cols-[380px_1fr] gap-6 md:grid-cols-1">
                {/* CỘT TRÁI: FORM TẠO */}
                <div className="h-fit border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                    <h3 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-lg text-[#3b2b19]">Lên lịch mới</h3>
                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">1. Chọn Rạp:</label>
                            <select value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm">
                                <option value="">-- Chọn rạp --</option>
                                {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">2. Chọn Phòng:</label>
                            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} disabled={!selectedCinema || isRoomsLoading} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm">
                                <option value="">{isRoomsLoading ? 'Đang tải...' : '-- Chọn phòng --'}</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">3. Chọn Phim:</label>
                            <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm">
                                <option value="">-- Chọn phim --</option>
                                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">4. Giờ chiếu:</label>
                            <input type="datetime-local" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">5. Giá vé gốc (VNĐ):</label>
                            <input type="number" required min="1000" step="1000" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="mt-2 bg-brand-500 px-6 py-[10px] text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                            {isSubmitting ? 'Đang tạo...' : 'Tạo Suất Chiếu'}
                        </button>
                    </form>
                </div>

                {/* CỘT PHẢI: DANH SÁCH */}
                <div>
                    <h3 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-2xl text-[#3b2b19]">Danh sách Suất chiếu</h3>
                    <div className="mt-4 flex flex-col gap-3">
                        {isShowtimesLoading ? <p>Đang tải...</p> : (showtimes.length === 0 ? <p>Chưa có suất chiếu nào.</p> : (
                            showtimes.map(st => (
                                <div key={st.id} className="flex justify-between items-center border border-[#ddcbb6] bg-white p-4 shadow-[0_8px_22px_rgba(76,45,17,0.10)] sm:flex-col sm:items-start sm:gap-3">
                                    <div>
                                        <h4 className="m-0 font-bold text-[#3b2b19]">{st.movie.title}</h4>
                                        <p className="m-0 mt-1 text-sm text-[#7b6446]">{st.room.cinema.name} - {st.room.name}</p>
                                        <p className="m-0 mt-1 text-sm font-bold text-brand-500">{new Date(st.start_time).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <button onClick={() => handleDelete(st.id)} className="bg-[#b0232f] px-4 py-2 text-xs font-bold text-white hover:bg-[#8a1924]">Xóa</button>
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}