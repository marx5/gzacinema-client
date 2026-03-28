import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../api/movieApi';
import { Helmet } from 'react-helmet-async';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import Breadcrumb from '../components/Breadcrumb';

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

    const formatDisplayDateUI = (dateString) => {
        const dateObj = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = dateObj.toLocaleDateString() === today.toLocaleDateString();
        const isTomorrow = dateObj.toLocaleDateString() === tomorrow.toLocaleDateString();

        const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

        if (isToday) return { top: 'Hôm nay', bottom: formattedDate };
        if (isTomorrow) return { top: 'Ngày mai', bottom: formattedDate };
        return { top: days[dateObj.getDay()], bottom: formattedDate };
    };

    const filteredShowtimes = data?.showtimesGrouped?.map(cinema => ({
        ...cinema,
        showtimes: cinema.showtimes.filter(st => new Date(st.start_time).toLocaleDateString('en-CA') === selectedDate)
    })).filter(cinema => cinema.showtimes.length > 0) || [];

    if (isLoading) return <div className="py-20 text-center text-lg font-bold text-brand-text">Đang tải thông tin phim...</div>;
    if (!data?.movie) return <div className="py-20 text-center text-lg font-bold text-brand-error">Không tìm thấy bộ phim này!</div>;

    const { movie } = data;
    const trailerEmbedUrl = getYoutubeEmbedUrl(movie.trailer_url);

    return (
        <div className="mx-auto mt-6 w-full max-w-[1080px] px-4 md:mt-10">
            <Helmet>
                <title>{movie.title} | Gzacinema - Đặt vé ngay</title>
                <meta name="description" content={movie.description?.substring(0, 160)} />
                <meta property="og:title" content={movie.title} />
                <meta property="og:image" content={optimizeCloudinaryUrl(movie.thumbnail, 500)} />
            </Helmet>

            <Breadcrumb items={[
                { label: 'Phim đang chiếu', link: '/' },
                { label: movie.title }
            ]} />

            <div className="flex flex-col gap-6 md:flex-row md:gap-8 lg:gap-10">
                <div className="mx-auto w-[60%] shrink-0 md:w-[280px] lg:w-[320px]">
                    <img
                        src={optimizeCloudinaryUrl(movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba', 500)}
                        alt={movie.title}
                        loading="lazy"
                        className="aspect-[2/3] w-full border border-brand-border object-cover shadow-[0_8px_22px_rgba(76,45,17,0.15)]"
                    />
                </div>

                <div className="flex flex-1 flex-col justify-center">
                    <h1 className="m-0 font-display text-[32px] font-bold text-[#3b2b19] md:text-[40px] leading-tight">
                        {movie.title}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-[#7b6446]">
                        <span className="border border-[#ddcbb6] bg-white px-2 py-1 uppercase">{movie.genre || 'Đang cập nhật'}</span>
                        <span>•</span>
                        <span>{movie.duration_minutes} phút</span>
                        <span>•</span>
                        <span>Khởi chiếu: {new Date(movie.release_date).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="my-5 h-[1px] w-full bg-[#ddcbb6]"></div>

                    <div className="text-base leading-[1.8] text-[#5c4a3d]">
                        <strong className="text-[#3b2b19]">Nội dung:</strong> {movie.description}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

                <div className="w-full lg:flex-[1.6]">
                    <h2 className="m-0 border-b-2 border-brand-500 pb-2 font-display text-[26px] text-brand-dark inline-block mb-6">
                        Lịch Chiếu Phim
                    </h2>

                    {availableDates.length === 0 ? (
                        <div className="border border-dashed border-[#cfb596] bg-brand-bg py-10 text-center text-brand-text">
                            Phim này hiện chưa có lịch chiếu.
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 snap-x custom-scrollbar">
                                {availableDates.map(date => {
                                    const { top, bottom } = formatDisplayDateUI(date);
                                    const isSelected = selectedDate === date;
                                    return (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`flex min-w-[90px] shrink-0 snap-start flex-col items-center border p-2 transition-all ${isSelected
                                                ? 'border-brand-500 bg-brand-500 text-white shadow-md scale-105'
                                                : 'border-[#cfb596] bg-white text-brand-text hover:border-brand-500 hover:text-brand-600'
                                                }`}
                                            type="button"
                                        >
                                            <span className="text-xs uppercase tracking-wider">{top}</span>
                                            <span className={`mt-1 text-lg font-bold ${isSelected ? 'text-white' : 'text-brand-dark'}`}>
                                                {bottom}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-5">
                                {filteredShowtimes.length === 0 ? (
                                    <p className="py-4 text-center text-[#7b6446]">Không có suất chiếu nào trong ngày này.</p>
                                ) : (
                                    filteredShowtimes.map((group, idx) => (
                                        <div key={idx} className="border border-[#ddcbb6] bg-white p-5 shadow-sm transition hover:shadow-md">
                                            <h3 className="m-0 text-[20px] font-bold text-[#3b2b19]">{group.cinema_info.name}</h3>
                                            <p className="mb-4 mt-1 text-xs text-[#8c7356]">{group.cinema_info.address}</p>

                                            <div className="flex flex-wrap gap-3">
                                                {group.showtimes.map(st => {
                                                    const timeString = new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                                    return (
                                                        <Link
                                                            key={st.showtime_id}
                                                            to={`/booking/${st.showtime_id}`}
                                                            className="flex min-w-[100px] flex-col items-center border border-brand-border bg-[#fffaf3] px-3 py-2 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white group"
                                                        >
                                                            <strong className="text-[18px] text-brand-dark group-hover:text-white">{timeString}</strong>
                                                            <span className="mt-1 text-[11px] uppercase tracking-wide text-brand-text group-hover:text-white">
                                                                {st.room_name}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                {trailerEmbedUrl && (
                    <div className="w-full lg:sticky lg:top-[100px] lg:flex-[1]">
                        <h3 className="m-0 mb-4 font-display text-[22px] text-brand-dark">Trailer</h3>
                        <div className="aspect-video w-full overflow-hidden border-2 border-[#ddcbb6] shadow-md bg-black">
                            <iframe
                                width="100%"
                                height="100%"
                                src={trailerEmbedUrl}
                                title="Trailer"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}