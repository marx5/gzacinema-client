import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../../api/movieApi';
import { Helmet } from 'react-helmet-async';
import { Breadcrumb } from '../../components/layouts';
import { Badge, Button } from '../../components/core';
import { Clock, Calendar, Film, MapPin, Play, Ticket, Sparkles } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4 text-cinema-text-muted animate-pulse">
        <Film className="w-12 h-12 text-cinema-gold animate-bounce" />
        <p className="text-base font-semibold">Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (!data?.movie) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-rose-400">Không tìm thấy thông tin phim!</h2>
        <p className="text-cinema-text-muted mt-2">Vui lòng quay lại danh sách phim đang chiếu.</p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="secondary">Quay lại Trang Chủ</Button>
        </Link>
      </div>
    );
  }

  const { movie } = data;
  const trailerEmbedUrl = getYoutubeEmbedUrl(movie.trailer_url);
  const todayStr = new Date().toISOString().split('T')[0];
  const releaseDateStr = String(movie.release_date || '').split('T')[0];
  const movieCategoryLabel = releaseDateStr > todayStr ? 'Phim sắp chiếu' : 'Phim đang chiếu';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Helmet>
        <title>{movie.title} | GzaCinema - Đặt vé ngay</title>
        <meta name="description" content={movie.description?.substring(0, 160)} />
        <meta property="og:title" content={movie.title} />
        <meta property="og:image" content={movie.thumbnail} />
      </Helmet>

      <Breadcrumb
        items={[
          { label: movieCategoryLabel, link: '/' },
          { label: movie.title }
        ]}
      />

      {/* HERO MOVIE HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 glass-card p-6 sm:p-8 lg:p-10 shadow-cinematic">
        {/* Ambient Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.thumbnail}
            alt=""
            className="h-full w-full object-cover opacity-20 filter blur-2xl scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/90 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
          {/* Poster */}
          <div className="w-56 sm:w-64 lg:w-72 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
            <img
              src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
              alt={movie.title}
              loading="lazy"
              className="aspect-[2/3] w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="gold" size="md">
                {movie.genre || 'Điện ảnh'}
              </Badge>
              {movie.age_rating && (
                <Badge variant="rose" size="md">
                  {movie.age_rating}
                </Badge>
              )}
              <Badge variant="glass" size="md">
                2D / 3D / IMAX
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-cinema-text-muted font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cinema-gold" />
                <span>{movie.duration_minutes} phút</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cinema-gold" />
                <span>Khởi chiếu: {new Date(movie.release_date).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-white/10 my-4" />

            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-cinema-gold">Tóm tắt nội dung</h4>
              <p className="text-sm sm:text-base leading-relaxed text-cinema-text-muted max-w-3xl">
                {movie.description || 'Chưa có mô tả chi tiết cho bộ phim này.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SHOWTIMES & TRAILER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SHOWTIMES LISTING */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Ticket className="w-6 h-6 text-cinema-gold" />
              Lịch Chiếu & Đặt Vé
            </h2>
            <span className="text-xs text-cinema-text-dim">Chọn ngày và suất chiếu phù hợp</span>
          </div>

          {availableDates.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card text-center text-cinema-text-muted border border-white/5 space-y-2">
              <Film className="w-8 h-8 text-cinema-gold/60 mx-auto" />
              <p className="font-semibold text-cinema-text">Phim này hiện chưa có lịch chiếu mới.</p>
              <p className="text-xs text-cinema-text-dim">Vui lòng chọn một bộ phim khác đang có suất chiếu tại rạp.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date selector pills */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x custom-scrollbar">
                {availableDates.map((date) => {
                  const { top, bottom } = formatDisplayDateUI(date);
                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex min-w-[100px] shrink-0 snap-start flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-cinema-gold bg-cinema-surface-elevated text-cinema-gold shadow-glow-gold-sm scale-105'
                          : 'border-white/10 bg-cinema-surface/60 text-cinema-text-muted hover:border-white/20 hover:text-white'
                      }`}
                      type="button"
                    >
                      <span className="text-xs uppercase tracking-wider font-medium">{top}</span>
                      <span className={`mt-1 text-base font-extrabold ${isSelected ? 'text-white' : ''}`}>
                        {bottom}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Grouped Cinemas */}
              <div className="space-y-4">
                {filteredShowtimes.length === 0 ? (
                  <div className="p-6 rounded-2xl glass-card text-center text-cinema-text-muted">
                    Không có suất chiếu nào trong ngày đã chọn.
                  </div>
                ) : (
                  filteredShowtimes.map((group, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-6 rounded-2xl glass-card border border-white/10 hover:border-cinema-gold/30 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h3 className="text-lg font-bold text-white">{group.cinema_info.name}</h3>
                          <p className="text-xs text-cinema-text-dim flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-cinema-gold/80 flex-shrink-0" />
                            <span>{group.cinema_info.address}</span>
                          </p>
                        </div>
                        <Badge variant="purple" size="sm">
                          {group.cinema_info.city || 'Rạp Tiêu Chuẩn'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {group.showtimes.map((st) => {
                          const timeString = new Date(st.start_time).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          return (
                            <Link
                              key={st.showtime_id}
                              to={`/booking/${st.showtime_id}`}
                              className="group flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-cinema-surface-elevated/70 hover:bg-cinema-surface-hover hover:border-cinema-gold/60 transition-all cursor-pointer text-center"
                            >
                              <strong className="text-lg font-black text-white group-hover:text-cinema-gold transition-colors">
                                {timeString}
                              </strong>
                              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-cinema-text-muted group-hover:text-cinema-text">
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
            </div>
          )}
        </div>

        {/* TRAILER EMBED */}
        {trailerEmbedUrl && (
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-cinema-gold" />
              Official Trailer
            </h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-cinematic bg-black">
              <iframe
                width="100%"
                height="100%"
                src={trailerEmbedUrl}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 rounded-xl glass-card border border-white/5 text-xs text-cinema-text-muted space-y-1">
              <p className="font-semibold text-cinema-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cinema-gold" />
                Lưu ý phòng chiếu
              </p>
              <p className="text-cinema-text-dim">
                Quý khách vui lòng có mặt trước giờ chiếu 10 phút để nhận vé và bắp nước.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
