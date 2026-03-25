import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '../../api/cinemaApi';
import { movieApi } from '../../api/movieApi';
import { systemApi } from '../../api/systemApi';

export default function AdminShowtimes() {
    const queryClient = useQueryClient();

    // State cho Form tạo lịch chiếu
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [startTime, setStartTime] = useState('');
    const [basePrice, setBasePrice] = useState(70000);

    // 1. Tải dữ liệu ban đầu (Rạp và Phim)
    const { data: initData, isLoading: isInitLoading } = useQuery({
        queryKey: ['admin-showtimes-init'],
        queryFn: async () => {
            const [cinemasRes, moviesRes] = await Promise.all([
                cinemaApi.getAll(),
                movieApi.getAll()
            ]);
            return {
                cinemas: cinemasRes.data,
                movies: moviesRes.data
            };
        },
        onError: () => toast.error('Lỗi tải dữ liệu Rạp/Phim')
    });

    // 2. Tải danh sách Phòng (Dependent Query: Chỉ chạy khi selectedCinema có giá trị)
    const { data: rooms = [], isFetching: isRoomsLoading } = useQuery({
        queryKey: ['admin-rooms-by-cinema', selectedCinema],
        queryFn: async () => {
            const res = await cinemaApi.getRooms(selectedCinema);
            return res.data;
        },
        enabled: !!selectedCinema, // 🚀 Chỉ kích hoạt khi đã chọn rạp
        onError: () => toast.error('Lỗi tải danh sách phòng')
    });

    // 3. Mutation để tạo Suất chiếu
    const createMutation = useMutation({
        mutationFn: (newShowtime) => systemApi.createShowtime(newShowtime),
        onSuccess: () => {
            toast.success('Thêm suất chiếu thành công! Đã mở bán 50 ghế.');
            setStartTime(''); // Chỉ reset giờ chiếu để admin có thể tạo tiếp cho phim khác/phòng khác
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Lỗi thêm suất chiếu');
        }
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

    if (isInitLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải hệ thống...</div>;

    const { cinemas = [], movies = [] } = initData || {};
    const isSubmitting = createMutation.isLoading;

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19] min-[0px]:max-[420px]:text-[28px]">Quản Lý Lịch Chiếu</h1>

            <div className="mt-5 border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                <h3 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-lg text-[#3b2b19]">Lên lịch suất chiếu mới</h3>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">

                    {/* Chọn Rạp */}
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-2">1. Chọn Rạp Chiếu:</label>
                        <select
                            value={selectedCinema}
                            onChange={(e) => setSelectedCinema(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        >
                            <option value="">-- Vui lòng chọn rạp --</option>
                            {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Chọn Phòng */}
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-2">2. Chọn Phòng Chiếu:</label>
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            disabled={!selectedCinema || rooms.length === 0 || isRoomsLoading}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        >
                            <option value="">{isRoomsLoading ? 'Đang tải phòng...' : '-- Vui lòng chọn phòng --'}</option>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        {selectedCinema && !isRoomsLoading && rooms.length === 0 && (
                            <span className="mt-2 block text-xs text-[#b0232f]">
                                Rạp này chưa có phòng nào. Vui lòng tạo phòng trước!
                            </span>
                        )}
                    </div>

                    {/* Chọn Phim */}
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-2">3. Chọn Phim:</label>
                        <select
                            value={selectedMovie}
                            onChange={(e) => setSelectedMovie(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        >
                            <option value="">-- Vui lòng chọn phim --</option>
                            {movies.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.title} ({m.duration_minutes} phút)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Chọn Giờ và Giá */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">4. Giờ chiếu:</label>
                            <input
                                type="datetime-local"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">5. Giá vé gốc (VNĐ):</label>
                            <input
                                type="number"
                                required
                                min="1000" step="1000"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 bg-brand-500 px-6 py-[10px] text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Đang kiểm tra lịch...' : 'Tạo Suất Chiếu & Mở Bán Ghế'}
                    </button>
                </form>
            </div>
        </div>
    );
}