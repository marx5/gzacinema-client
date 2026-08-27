import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { movieApi } from '../../api/movieApi';
import { Sparkles, Film, Clapperboard, Tv, Volume2, Armchair, Flame } from 'lucide-react';
import { Button, Badge, SkeletonCard } from '../../components/core';
import { MovieCard } from '../../components/modules/movie';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeTab, setActiveTab] = useState('showing');

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies', activeTab],
    queryFn: async () => {
      const res = activeTab === 'showing'
        ? await movieApi.getShowing()
        : await movieApi.getComingSoon();
      return res.data.movie;
    },
    placeholderData: keepPreviousData,
  });

  const featuredMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* CINEMATIC HERO SPOTLIGHT */}
      {featuredMovie && (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 glass-card shadow-cinematic">
          {/* Background Poster Blur */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.thumbnail}
              alt=""
              className="h-full w-full object-cover object-top opacity-30 filter blur-xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant="gold" size="md" icon={<Flame className="w-3.5 h-3.5" />}>
                  Phim Tâm Điểm Tuần Này
                </Badge>
                <Badge variant="glass" size="md">
                  {featuredMovie.genre || 'Bom Tấn'}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {featuredMovie.title}
              </h1>

              <p className="text-cinema-text-muted text-sm sm:text-base line-clamp-3 max-w-2xl leading-relaxed">
                {featuredMovie.description || 'Trải nghiệm siêu phẩm điện ảnh với hình ảnh sắc nét và âm thanh sống động chưa từng có tại các phòng chiếu GzaCinema.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to={`/movie/${featuredMovie.id}`}>
                  <Button variant="primary" size="lg" leftIcon={<Film className="w-5 h-5" />}>
                    Đặt Vé Ngay
                  </Button>
                </Link>
                <Link to={`/movie/${featuredMovie.id}`}>
                  <Button variant="secondary" size="lg">
                    Xem Chi Tiết
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Poster Preview */}
            <div className="hidden lg:flex lg:col-span-5 justify-center">
              <div className="relative group w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                <img
                  src={featuredMovie.thumbnail}
                  alt={featuredMovie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-center">
                  <span className="text-xs font-bold text-cinema-gold">Thời lượng: {featuredMovie.duration_minutes || 120} phút</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MOVIE LISTING TABS & GRID */}
      <section className="space-y-6">
        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('showing')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'showing'
                  ? 'bg-cinema-surface-elevated text-cinema-gold border border-cinema-gold/40 shadow-glow-gold-sm'
                  : 'text-cinema-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" />
              Phim Đang Chiếu
            </button>

            <button
              onClick={() => setActiveTab('coming_soon')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'coming_soon'
                  ? 'bg-cinema-surface-elevated text-cinema-gold border border-cinema-gold/40 shadow-glow-gold-sm'
                  : 'text-cinema-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              Phim Sắp Chiếu
            </button>
          </div>

          <span className="text-xs text-cinema-text-dim">
            Hiển thị <strong className="text-cinema-text">{movies.length}</strong> bộ phim
          </span>
        </div>

        {/* Movie Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-2xl border border-white/5">
            <Film className="w-12 h-12 text-cinema-text-dim mx-auto mb-3" />
            <h3 className="text-lg font-bold text-cinema-text">Chưa có danh sách phim</h3>
            <p className="text-sm text-cinema-text-muted mt-1">Vui lòng quay lại sau để cập nhật lịch chiếu mới nhất.</p>
          </div>
        )}
      </section>

      {/* CINEMA EXPERIENCE PERKS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Tv className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Màn Chiếu IMAX Laser</h3>
          <p className="text-xs text-cinema-text-muted leading-relaxed">
            Độ phân giải siêu nét với dải tương phản động mở rộng mang tới từng khung hình chân thực nhất.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3">
          <div className="h-12 w-12 rounded-xl bg-cinema-gold/10 text-cinema-gold flex items-center justify-center border border-cinema-gold/20">
            <Volume2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Dolby Atmos Không Gian</h3>
          <p className="text-xs text-cinema-text-muted leading-relaxed">
            Âm thanh vòm 360 độ sống động chân thực đến từng chi tiết, bao bọc toàn bộ khán phòng.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Armchair className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Ghế VIP & Sweetbox Da Êm</h3>
          <p className="text-xs text-cinema-text-muted leading-relaxed">
            Không gian riêng tư, ngả lưng thoải mái đem lại sự thư giãn tuyệt đối trong suốt bộ phim.
          </p>
        </div>
      </section>
    </div>
  );
}
