import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../api/movieApi';

export default function MovieDetails() {
    const { id } = useParams();
    const [selectedDate, setSelectedDate] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['movieDetails', id],
        queryFn: async () => {
            const [movieRes, showtimesRes] = await Promise.all([
                movieApi.getById(id),
                movieApi.getShowtimes(id)
            ]);
            return { movie: movieRes.data, showtimesGrouped: showtimesRes.data };
        }
    });

    const availableDates = useMemo(() => {
        if (!data?.showtimesGrouped) return [];
        const dates = [];
        data.showtimesGrouped.forEach(cinema => {
            cinema.showtimes.forEach(st => {
                const dateStr = new Date(st.start_time).toLocaleDateString('en-CA');
                if (!dates.includes(dateStr)) dates.push(dateStr);
            });
        });
        dates.sort();
        return dates;
    }, [data]);

    useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const formatDisplayDate = (dateString) => {
        const dateObj = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = dateObj.toLocaleDateString() === today.toLocaleDateString();
        const isTomorrow = dateObj.toLocaleDateString() === tomorrow.toLocaleDateString();

        const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

        if (isToday) return `Hôm nay, ${formattedDate}`;
        if (isTomorrow) return `Ngày mai, ${formattedDate}`;

        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return `${days[dateObj.getDay()]}, ${formattedDate}`;
    };

    const filteredShowtimes = data?.showtimesGrouped?.map(cinema => ({
        ...cinema,
        showtimes: cinema.showtimes.filter(st => new Date(st.start_time).toLocaleDateString('en-CA') === selectedDate)
    })).filter(cinema => cinema.showtimes.length > 0) || [];

    if (isLoading) return <div className="py-6 text-center text-[#7b6446]">Đang tải chi tiết...</div>;
    if (!data?.movie) return <div className="py-6 text-center text-[#7b6446]">Không tìm thấy bộ phim này!</div>;

    const { movie } = data;
    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            {/* 1. THÔNG TIN PHIM & TRAILER */}
            <div className="mb-8 grid grid-cols-[320px_1fr] gap-6 overflow-hidden border border-[#ddcbb6] border-t-4 border-t-brand-500 bg-white shadow-[0_8px_22px_rgba(76,45,17,0.10)] lg:grid-cols-[280px_1fr] md:grid-cols-1">
                <div>
                    <img
                        src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                        alt={movie.title}
                        className="h-full min-h-[430px] w-full object-cover md:min-h-[360px]"
                    />
                </div>
                <div className="p-6 md:p-5 sm:p-4">
                    <h1 className="mb-4 mt-0 font-display text-[36px] text-[#3b2b19] lg:text-[30px] sm:text-[26px]">{movie.title}</h1>
                    <p className="my-2 leading-[1.65] text-[#7b6446]"><strong className="text-[#3b2b19]">Thể loại:</strong> {movie.genre || 'Đang cập nhật'}</p>
                    <p className="my-2 leading-[1.65] text-[#7b6446]"><strong className="text-[#3b2b19]">Thời lượng:</strong> {movie.duration_minutes} phút</p>
                    <p className="my-2 leading-[1.65] text-[#7b6446]"><strong className="text-[#3b2b19]">Khởi chiếu:</strong> {new Date(movie.release_date).toLocaleDateString('vi-VN')}</p>
                    <p className="my-2 leading-[1.65] text-[#7b6446]"><strong className="text-[#3b2b19]">Nội dung:</strong> {movie.description}</p>

                    {movie.trailer_url && (
                        <div className="mt-5">
                            <h3 className="mb-3 mt-0 text-lg text-[#3b2b19]">Trailer Phim</h3>
                            <iframe
                                width="100%"
                                height="250"
                                src={getYoutubeEmbedUrl(movie.trailer_url)}
                                title="Trailer"
                                frameBorder="0"
                                allowFullScreen
                                className="h-[260px] w-full border border-[#cfb596] md:h-[220px] sm:h-[200px]"
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. LỊCH CHIẾU VỚI THANH TAB NGÀY */}
            <h2 className="mb-4 border-b-2 border-[#ddcbb6] pb-3 font-display text-[30px] text-[#3b2b19] sm:text-[26px]">Lịch Chiếu</h2>

            {availableDates.length === 0 ? (
                <p className="py-6 text-center text-[#7b6446]">Hiện chưa có lịch chiếu cho phim này.</p>
            ) : (
                <>
                    {/* Thanh Tab Ngày */}
                    <div className="mb-4 flex gap-3 overflow-x-auto pb-4">
                        {availableDates.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`whitespace-nowrap border px-4 py-[10px] text-sm font-bold transition ${selectedDate === date
                                    ? 'border-brand-500 bg-brand-500 text-white'
                                    : 'border-[#cfb596] bg-white text-[#7b6446] hover:border-brand-500 hover:text-brand-600'
                                    } sm:min-w-[104px] sm:px-2 sm:py-[9px]`}
                                type="button"
                            >
                                {formatDisplayDate(date)}
                            </button>
                        ))}
                    </div>

                    {/* Danh sách rạp và suất chiếu đã lọc theo ngày */}
                    {filteredShowtimes.length === 0 ? (
                        <p className="py-6 text-center text-[#7b6446]">Không có suất chiếu nào trong ngày này.</p>
                    ) : (
                        filteredShowtimes.map((group, idx) => (
                            <div key={idx} className="mb-5 border border-[#ddcbb6] bg-white p-5 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                                <h3 className="m-0 text-[22px] text-[#3b2b19]">{group.cinema_info.name}</h3>
                                <p className="mb-4 mt-2 text-sm text-[#8c7356]">{group.cinema_info.address}</p>

                                <div className="flex flex-wrap gap-3">
                                    {group.showtimes.map(st => {
                                        const timeString = new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <Link key={st.showtime_id} to={`/booking/${st.showtime_id}`} className="min-w-[116px] border border-brand-500 bg-white px-3 py-[10px] text-center text-brand-500 transition hover:bg-brand-500 hover:text-white sm:min-w-[104px] sm:px-2 sm:py-[9px]">
                                                <strong>{timeString}</strong>
                                                <div className="mt-[3px] text-xs text-inherit">{st.room_name}</div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}