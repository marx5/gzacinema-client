import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMovieDetails } from '@/hooks';
import { Breadcrumb } from '@/components/layouts';
import { Button } from '@/components/core';
import { MovieHeroBanner } from '@/components/modules/movie';
import {
  Film,
  Info,
  AlertTriangle,
  RefreshCw,
  Calendar,
  MapPin,
  Ticket,
} from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const { movie, showtimesGrouped = [], isLoading, isError, refetch } = useMovieDetails(id);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('ALL');

  // Lấy danh sách ngày có suất chiếu
  const availableDates = useMemo(() => {
    if (!showtimesGrouped || showtimesGrouped.length === 0) return [];
    const dates = [];
    showtimesGrouped.forEach((cinema) => {
      cinema.showtimes?.forEach((st) => {
        const dateStr = new Date(st.start_time).toLocaleDateString('en-CA');
        if (!dates.includes(dateStr)) dates.push(dateStr);
      });
    });
    dates.sort();
    return dates;
  }, [showtimesGrouped]);

  useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !availableDates.includes(selectedDate))) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Format ngày hiển thị
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
    };
  };

  // Tính giờ kết thúc dự kiến
  const calculateEndTime = (startTimeStr, durationMinutes = 120) => {
    try {
      const start = new Date(startTimeStr);
      const end = new Date(start.getTime() + (durationMinutes || 120) * 60000);
      return end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '50.000đ';
    return Number(price).toLocaleString('vi-VN') + 'đ';
  };

  // Lọc danh sách suất chiếu theo ngày & rạp
  const filteredShowtimes = useMemo(() => {
    if (!showtimesGrouped || showtimesGrouped.length === 0) return [];
    return showtimesGrouped
      .map((cinema) => ({
        ...cinema,
        showtimes: (cinema.showtimes || []).filter((st) => {
          const matchDate = new Date(st.start_time).toLocaleDateString('en-CA') === selectedDate;
          const matchCinema =
            selectedCinemaId === 'ALL' || String(cinema.cinema_info?.id) === String(selectedCinemaId);
          return matchDate && matchCinema;
        }),
      }))
      .filter((cinema) => cinema.showtimes.length > 0);
  }, [showtimesGrouped, selectedDate, selectedCinemaId]);

  const uniqueCinemas = useMemo(() => {
    if (!showtimesGrouped) return [];
    return showtimesGrouped.map((c) => c.cinema_info).filter(Boolean);
  }, [showtimesGrouped]);

  const handleScrollToShowtimes = () => {
    document.getElementById('movie-showtimes-section')?.scrollIntoView({ behavior: 'smooth' });
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

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-cinema-rose mx-auto" />
        <h2 className="text-2xl font-bold text-white">Lỗi kết nối máy chủ!</h2>
        <p className="text-sm text-cinema-text-muted">
          Không thể lấy thông tin phim lúc này. Vui lòng kiểm tra lại đường truyền.
        </p>
        <Button variant="secondary" size="md" onClick={() => refetch()} className="gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  if (!movie) {
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

  const movieCategoryLabel = movie.isComingSoon ? 'Phim sắp chiếu' : 'Phim đang chiếu';
  const movieCategoryLink = movie.isComingSoon ? '/?tab=coming_soon' : '/?tab=showing';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Helmet>
        <title>{movie.title} | Lịch Chiếu - GzaCinema</title>
        <meta name="description" content={movie.description?.substring(0, 160)} />
        <meta property="og:title" content={`${movie.title} - GzaCinema`} />
        <meta property="og:image" content={movie.posterUrl} />
      </Helmet>

      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={[
          { label: movieCategoryLabel, link: movieCategoryLink },
          { label: movie.title },
        ]}
      />

      {/* Hero Movie Banner */}
      <MovieHeroBanner
        movie={movie}
        onOpenShowtimes={handleScrollToShowtimes}
      />

      {/* Inline Showtime Schedule Section */}
      <section
        id="movie-showtimes-section"
        className="rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-4 sm:p-8 shadow-cinematic space-y-6 scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold">
              <Ticket className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white flex flex-wrap items-center gap-2">
              <span>Lịch Chiếu & Đặt Vé</span>
            </h2>
          </div>

          {/* Cinema Filter (nếu có từ 2 rạp trở lên) */}
          {uniqueCinemas.length > 1 && (
            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-xs text-cinema-text-muted font-medium flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
                Cụm rạp:
              </span>
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="bg-cinema-surface-elevated border border-white/15 text-xs text-white rounded-lg px-3 py-1.5 outline-none focus:border-cinema-gold transition-colors cursor-pointer"
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

        {/* Date Selector Strip */}
        {availableDates.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cinema-gold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Chọn Ngày Chiếu</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
              {availableDates.map((date) => {
                const { label, dayNumber, monthStr } = formatDisplayDateUI(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    type="button"
                    className={`group relative flex min-w-[96px] sm:min-w-[104px] shrink-0 flex-col items-center justify-center py-3 px-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'border-cinema-gold bg-gradient-to-b from-cinema-gold/20 via-cinema-surface-elevated to-cinema-surface text-cinema-gold shadow-glow-gold-sm -translate-y-0.5 scale-[1.02]'
                        : 'border-white/10 bg-cinema-surface/70 text-cinema-text-muted hover:border-cinema-gold/40 hover:bg-cinema-surface-elevated hover:text-white'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
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

                    <span className="text-[10px] font-semibold text-cinema-text-dim">
                      {monthStr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Showtimes List */}
        <div className="space-y-4">
          {availableDates.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.03] text-center text-cinema-text-muted border border-white/5 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cinema-surface-elevated flex items-center justify-center mx-auto text-cinema-gold/60 border border-white/10">
                <Film className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Chưa có lịch chiếu khả dụng</h4>
              <p className="text-xs sm:text-sm text-cinema-text-dim max-w-sm mx-auto">
                Hiện tại chưa có suất chiếu nào cho bộ phim này trong những ngày tới. Vui lòng quay lại sau!
              </p>
            </div>
          ) : filteredShowtimes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.03] text-center text-cinema-text-muted border border-white/5 space-y-2">
              <Calendar className="w-8 h-8 text-cinema-gold/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">Không có suất chiếu trong ngày đã chọn</h4>
              <p className="text-xs text-cinema-text-dim">
                Vui lòng chọn ngày chiếu khác trên danh sách phía trên.
              </p>
            </div>
          ) : (
            filteredShowtimes.map((group, idx) => (
              <div
                key={group.cinema_info?.id || idx}
                className="rounded-xl bg-cinema-surface-elevated/90 border border-white/10 overflow-hidden shadow-card"
              >
                {/* Cinema Header */}
                <div className="p-3.5 sm:px-5 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-cinema-gold shrink-0" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {group.cinema_info?.name || 'GzaCinema Complex'}
                      </h4>
                      {group.cinema_info?.address && (
                        <p className="text-[11px] sm:text-xs text-cinema-text-dim truncate max-w-md">
                          {group.cinema_info.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/5 text-cinema-gold border border-cinema-gold/20 font-medium">
                    {group.showtimes.length} suất chiếu
                  </span>
                </div>

                {/* Showtime Grid */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {group.showtimes.map((st) => {
                      const startTime = new Date(st.start_time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const endTime = calculateEndTime(st.start_time, movie?.duration_minutes);
                      const roomLabel = String(st.room_name).toLowerCase().startsWith('phòng')
                        ? st.room_name
                        : `Phòng ${st.room_name}`;

                      return (
                        <Link
                          key={st.showtime_id}
                          to={`/booking/${st.showtime_id}`}
                          className="group relative flex flex-col items-center justify-between p-3 rounded-xl border border-white/10 bg-cinema-surface hover:bg-cinema-surface-hover hover:border-cinema-gold hover:shadow-glow-gold-sm transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          <div className="text-center">
                            <span className="text-lg sm:text-xl font-black text-white group-hover:text-cinema-gold transition-colors">
                              {startTime}
                            </span>
                            {endTime && (
                              <span className="block text-[10px] font-medium text-cinema-text-dim mt-0.5">
                                ~ {endTime}
                              </span>
                            )}
                          </div>

                          <div className="w-full h-[1px] bg-white/5 my-2 group-hover:bg-cinema-gold/20 transition-colors" />

                          <div className="w-full flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className="font-semibold text-cinema-text-muted truncate">
                              {roomLabel}
                            </span>
                            <span className="font-bold text-cinema-gold ml-1">
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
      </section>
    </div>
  );
}

