import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../../api/movieApi';
import { Helmet } from 'react-helmet-async';
import { Breadcrumb } from '../../components/layouts';
import { Badge, Button } from '../../components/core';
import {
  Clock,
  Calendar,
  Film,
  MapPin,
  Play,
  Ticket,
  Sparkles,
  ShieldCheck,
  Tag,
  Info,
  Gift,
  Popcorn,
  ChevronRight,
  Tv,
  CheckCircle2
} from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('ALL');
  const showtimesRef = useRef(null);

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
    data.showtimesGrouped.forEach((cinema) => {
      cinema.showtimes.forEach((st) => {
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
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const formatDisplayDateUI = (dateString) => {
    const dateObj = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = dateObj.toLocaleDateString('en-CA') === today.toLocaleDateString('en-CA');
    const isTomorrow = dateObj.toLocaleDateString('en-CA') === tomorrow.toLocaleDateString('en-CA');

    const dayNumber = String(dateObj.getDate()).padStart(2, '0');
    const monthNumber = String(dateObj.getMonth() + 1).padStart(2, '0');
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    let label = days[dateObj.getDay()];
    if (isToday) label = 'Hôm nay';
    else if (isTomorrow) label = 'Ngày mai';

    return {
      label,
      dayNumber,
      monthStr: `Th${monthNumber}`,
      fullDate: `${dayNumber}/${monthNumber}`
    };
  };

  // Helper calculating estimated end time
  const calculateEndTime = (startTimeStr, durationMinutes = 120) => {
    try {
      const start = new Date(startTimeStr);
      const end = new Date(start.getTime() + (durationMinutes || 120) * 60000);
      return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Format currency
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '50.000đ';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  const filteredShowtimes = useMemo(() => {
    if (!data?.showtimesGrouped) return [];
    return data.showtimesGrouped
      .map((cinema) => ({
        ...cinema,
        showtimes: cinema.showtimes.filter((st) => {
          const matchDate = new Date(st.start_time).toLocaleDateString('en-CA') === selectedDate;
          const matchCinema =
            selectedCinemaId === 'ALL' || String(cinema.cinema_info?.id) === String(selectedCinemaId);
          return matchDate && matchCinema;
        })
      }))
      .filter((cinema) => cinema.showtimes.length > 0);
  }, [data, selectedDate, selectedCinemaId]);

  const uniqueCinemas = useMemo(() => {
    if (!data?.showtimesGrouped) return [];
    return data.showtimesGrouped.map((c) => c.cinema_info).filter(Boolean);
  }, [data]);

  const scrollToBooking = () => {
    if (showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-24 flex flex-col items-center justify-center gap-4 text-cinema-text-muted">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-cinema-gold/30 border-t-cinema-gold animate-spin" />
          <Film className="w-7 h-7 text-cinema-gold absolute" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-cinema-gold animate-pulse">
          Đang tải thông tin phim & lịch chiếu...
        </p>
      </div>
    );
  }

  if (!data?.movie) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-24 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Không tìm thấy thông tin phim!</h2>
        <p className="text-cinema-text-muted mt-2 max-w-md mx-auto">
          Bộ phim này có thể đã ngừng chiếu hoặc đường dẫn không chính xác. Vui lòng quay lại danh sách phim.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="primary">Khám phá phim đang chiếu</Button>
        </Link>
      </div>
    );
  }

  const { movie } = data;
  const trailerEmbedUrl = getYoutubeEmbedUrl(movie.trailer_url);
  const todayStr = new Date().toISOString().split('T')[0];
  const releaseDateStr = String(movie.release_date || '').split('T')[0];
  const isComingSoon = releaseDateStr > todayStr;
  const movieCategoryLabel = isComingSoon ? 'Phim sắp chiếu' : 'Phim đang chiếu';
  const movieCategoryLink = isComingSoon ? '/?tab=coming_soon' : '/?tab=showing';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Helmet>
        <title>{movie.title} | Lịch Chiếu & Đặt Vé - GzaCinema</title>
        <meta name="description" content={movie.description?.substring(0, 160)} />
        <meta property="og:title" content={`${movie.title} - GzaCinema`} />
        <meta property="og:image" content={movie.thumbnail} />
      </Helmet>

      {/* BREADCRUMB */}
      <Breadcrumb
        items={[
          { label: movieCategoryLabel, link: movieCategoryLink },
          { label: movie.title }
        ]}
      />

      {/* HERO MOVIE SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 glass-card p-6 sm:p-8 lg:p-10 shadow-cinematic">
        {/* Ambient Backdrop Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
            alt=""
            className="h-full w-full object-cover opacity-25 filter blur-3xl scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/95 to-cinema-bg/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
          {/* Poster with glow & badges */}
          <div className="relative group shrink-0">
            <div className="w-56 sm:w-64 lg:w-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                alt={movie.title}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
            {movie.age_rating && (
              <div className="absolute top-3 right-3 shadow-lg">
                <Badge variant="rose" size="md" className="font-extrabold uppercase shadow-md">
                  {movie.age_rating}
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <Badge variant="gold" size="md">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {movie.genre || 'Điện ảnh'}
              </Badge>
              <Badge variant="glass" size="md">
                <Tv className="w-3.5 h-3.5 mr-1" />
                2D / Digital / Laser
              </Badge>
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-cinema-text-muted font-medium">
                GzaCinema Premium
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {movie.title}
            </h1>

            {/* Quick Meta Info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm text-cinema-text-muted font-medium">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <Clock className="w-4 h-4 text-cinema-gold" />
                <span>
                  <strong className="text-white">{movie.duration_minutes || 120}</strong> phút
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <Calendar className="w-4 h-4 text-cinema-gold" />
                <span>
                  Khởi chiếu:{' '}
                  <strong className="text-white">
                    {movie.release_date
                      ? new Date(movie.release_date).toLocaleDateString('vi-VN')
                      : 'Đang chiếu'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs uppercase tracking-wider font-bold text-cinema-gold flex items-center gap-1.5 justify-center md:justify-start">
                <Film className="w-3.5 h-3.5" />
                Tóm tắt nội dung
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-cinema-text-muted max-w-3xl line-clamp-4">
                {movie.description ||
                  'Một tuyệt tác điện ảnh mãn nhãn với kỹ xảo đỉnh cao và cốt truyện cuốn hút, mang đến trải nghiệm nghe nhìn ấn tượng tại hệ thống rạp GzaCinema.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToBooking}
                className="shadow-glow-gold flex items-center gap-2 text-sm font-bold"
              >
                <Ticket className="w-4 h-4" />
                Đặt vé
              </Button>

              {movie.trailer_url && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white font-semibold text-sm transition-all"
                >
                  <Play className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                  Xem Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWTIMES & SIDEBAR SECTION */}
      <div ref={showtimesRef} id="showtimes-section" className="space-y-6 pt-2">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">Lịch Chiếu & Đặt Vé</h2>
            </div>
          </div>

          {/* Cinema Filter if multiple */}
          {uniqueCinemas.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-cinema-text-muted hidden sm:inline">Lọc rạp:</span>
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="bg-cinema-surface-elevated border border-white/15 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-cinema-gold transition-colors"
              >
                <option value="ALL">Tất cả cụm rạp ({uniqueCinemas.length})</option>
                {uniqueCinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* DATE SELECTOR STRIP */}
        {availableDates.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cinema-gold">
              <Calendar className="w-4 h-4" />
              <span>Chọn Ngày Chiếu</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-thin">
              {availableDates.map((date) => {
                const { label, dayNumber, monthStr } = formatDisplayDateUI(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    type="button"
                    className={`group relative flex min-w-[110px] shrink-0 snap-start flex-col items-center justify-center py-3.5 px-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'border-cinema-gold bg-gradient-to-b from-cinema-gold/20 via-cinema-surface-elevated to-cinema-surface text-cinema-gold shadow-glow-gold-sm -translate-y-1 scale-105'
                        : 'border-white/10 bg-cinema-surface/70 text-cinema-text-muted hover:border-cinema-gold/40 hover:bg-cinema-surface-elevated hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-cinema-gold rounded-full shadow-glow-gold" />
                    )}

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-cinema-gold font-extrabold' : 'text-cinema-text-dim group-hover:text-cinema-text-muted'
                      }`}
                    >
                      {label}
                    </span>

                    <span
                      className={`my-1 text-2xl font-black ${
                        isSelected ? 'text-white' : 'text-cinema-text'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    <span className="text-[11px] font-semibold text-cinema-text-dim">
                      {monthStr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* MAIN CONTENT GRID: SHOWTIMES LIST & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SHOWTIMES LIST (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {availableDates.length === 0 ? (
              <div className="p-10 rounded-2xl glass-card text-center text-cinema-text-muted border border-white/5 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cinema-surface-elevated flex items-center justify-center mx-auto text-cinema-gold/60 border border-white/10">
                  <Film className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Chưa có lịch chiếu khả dụng</h4>
                  <p className="text-sm text-cinema-text-dim mt-1 max-w-md mx-auto">
                    Hiện tại chưa có suất chiếu nào cho bộ phim này trong những ngày tới. Bạn có thể chọn xem các phim khác đang chiếu.
                  </p>
                </div>
                <Link to="/" className="inline-block pt-2">
                  <Button variant="secondary" size="sm">
                    Xem phim đang chiếu khác
                  </Button>
                </Link>
              </div>
            ) : filteredShowtimes.length === 0 ? (
              <div className="p-10 rounded-2xl glass-card text-center text-cinema-text-muted border border-white/5 space-y-3">
                <Calendar className="w-10 h-10 text-cinema-gold/60 mx-auto" />
                <h4 className="text-base font-bold text-white">Không có suất chiếu trong ngày đã chọn</h4>
                <p className="text-xs text-cinema-text-dim">
                  Vui lòng chọn một ngày khác trên thanh lịch phía trên hoặc đổi bộ lọc rạp.
                </p>
              </div>
            ) : (
              filteredShowtimes.map((group, idx) => (
                <div
                  key={group.cinema_info?.id || idx}
                  className="rounded-2xl glass-card border border-white/10 overflow-hidden shadow-card transition-all duration-200 hover:border-cinema-gold/40"
                >
                  {/* Cinema Card Header */}
                  <div className="p-5 bg-gradient-to-r from-cinema-surface-elevated to-cinema-surface/90 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cinema-gold/10 border border-cinema-gold/30 flex items-center justify-center text-cinema-gold shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white tracking-wide">
                          {group.cinema_info?.name || 'GzaCinema Complex'}
                        </h3>
                        <p className="text-xs text-cinema-text-muted flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                          <span>{group.cinema_info?.address || 'Khu vực Trung Tâm'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm" className="uppercase font-bold tracking-wider">
                        {group.cinema_info?.city || 'Rạp Tiêu Chuẩn'}
                      </Badge>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-cinema-text-dim border border-white/5">
                        {group.showtimes.length} suất chiếu
                      </span>
                    </div>
                  </div>

                  {/* Showtime Grid */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                      <Tv className="w-3.5 h-3.5 text-cinema-gold" />
                      <span>Định dạng 2D - Phụ đề tiếng Việt</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {group.showtimes.map((st) => {
                        const startTime = new Date(st.start_time).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const endTime = calculateEndTime(st.start_time, movie.duration_minutes);
                        const roomLabel = String(st.room_name).toLowerCase().startsWith('phòng')
                          ? st.room_name
                          : `Phòng ${st.room_name}`;

                        return (
                          <Link
                            key={st.showtime_id}
                            to={`/booking/${st.showtime_id}`}
                            className="group relative flex flex-col items-center justify-between p-3.5 rounded-xl border border-white/10 bg-cinema-surface-elevated/80 hover:bg-cinema-surface-hover hover:border-cinema-gold hover:shadow-glow-gold-sm transition-all duration-200 cursor-pointer -translate-y-0 hover:-translate-y-1"
                          >
                            {/* Start Time */}
                            <div className="text-center">
                              <span className="text-xl font-black text-white group-hover:text-cinema-gold transition-colors">
                                {startTime}
                              </span>
                              {endTime && (
                                <span className="block text-[11px] font-medium text-cinema-text-dim group-hover:text-cinema-text-muted mt-0.5">
                                  ~ {endTime}
                                </span>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="w-full h-[1px] bg-white/5 my-2.5 group-hover:bg-cinema-gold/20 transition-colors" />

                            {/* Room & Price tags */}
                            <div className="w-full flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-cinema-text-muted uppercase group-hover:text-white transition-colors">
                                {roomLabel}
                              </span>
                              <span className="font-bold text-cinema-gold">
                                {formatPrice(st.base_price)}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SIDEBAR (4 cols): TRAILER & CINEMA PERKS */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Trailer Card */}
            {trailerEmbedUrl && (
              <div className="rounded-2xl glass-card border border-white/10 p-4 space-y-3 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                    Official Trailer
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-cinema-text-dim px-2 py-0.5 rounded bg-white/5">
                    HD 1080P
                  </span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-cinematic bg-black">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
