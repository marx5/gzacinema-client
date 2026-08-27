import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { movieApi } from '../../api/movieApi';
import { Sparkles, Film, Clapperboard, Tv, Volume2, Armchair, Flame, Trophy, Ticket } from 'lucide-react';
import { Button, Badge, SkeletonCard } from '../../components/core';
import { MovieCard } from '../../components/modules/movie';
import { Link, useSearchParams } from 'react-router-dom';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'coming_soon' ? 'coming_soon' : 'showing');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const moviesSectionRef = useRef(null);

  // Sync state with URL parameter if it changes
  useEffect(() => {
    if (tabFromUrl === 'coming_soon' || tabFromUrl === 'showing') {
      setActiveTab(tabFromUrl);
      if (tabFromUrl === 'coming_soon' && moviesSectionRef.current) {
        moviesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Top 10 Ranking Movies Query (Fixed for Hero Banner)
  const { data: rankingMovies = [], isLoading: isLoadingRanking } = useQuery({
    queryKey: ['movies', 'ranking'],
    queryFn: async () => {
      const res = await movieApi.getRanking(10);
      return res.data;
    }
  });

  // Tab Listing Movies Query (Showing / Coming Soon)
  const { data: tabMovies = [], isLoading: isLoadingTabMovies } = useQuery({
    queryKey: ['movies', activeTab],
    queryFn: async () => {
      const res = activeTab === 'showing'
        ? await movieApi.getShowing()
        : await movieApi.getComingSoon();
      return res.data.movie;
    },
    placeholderData: keepPreviousData,
  });

  const [slideDirection, setSlideDirection] = useState('next');
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const isMouseDownRef = useRef(false);

  const nextSlide = useCallback(() => {
    if (rankingMovies.length === 0) return;
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev + 1) % rankingMovies.length);
  }, [rankingMovies.length]);

  const prevSlide = useCallback(() => {
    if (rankingMovies.length === 0) return;
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + rankingMovies.length) % rankingMovies.length);
  }, [rankingMovies.length]);

  // Auto-play slider every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || rankingMovies.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, rankingMovies.length]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch & Swipe handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;
    if (diff > minSwipeDistance) {
      nextSlide(); // Vuốt sang trái -> Xem phim tiếp theo
    } else if (diff < -minSwipeDistance) {
      prevSlide(); // Vuốt sang phải -> Xem phim trước đó
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    // Chỉ kích hoạt nếu không click vào button hoặc link
    if (e.target.closest('button, a')) return;
    isMouseDownRef.current = true;
    touchStartXRef.current = e.clientX;
    touchEndXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    touchEndXRef.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 60;
    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }
  };

  const activeFeatured = rankingMovies[currentSlide] || rankingMovies[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-12 select-none">
      {/* TOP 10 RANKING CAROUSEL HERO SPOTLIGHT */}
      {activeFeatured && (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            isMouseDownRef.current = false;
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative overflow-hidden rounded-3xl border border-white/10 glass-card shadow-cinematic group cursor-grab active:cursor-grabbing touch-pan-y"
        >
          {/* Background Poster Blur */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={activeFeatured.thumbnail}
              alt=""
              key={`bg-${activeFeatured.id}`}
              className="h-full w-full object-cover object-top opacity-35 filter blur-2xl scale-110 animate-cinema-bg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            {/* Left Info */}
            <div
              key={`info-${activeFeatured.id}`}
              className="lg:col-span-7 space-y-5 animate-cinema-fade"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="gold" size="md" icon={<Trophy className="w-3.5 h-3.5" />}>
                  TOP #{activeFeatured.rank || (currentSlide + 1)}
                </Badge>
                <Badge variant="glass" size="md">
                  {activeFeatured.genre || 'Bom Tấn'}
                </Badge>
                {activeFeatured.total_tickets > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-cinema-gold/90 font-medium bg-cinema-gold/10 px-2.5 py-1 rounded-lg border border-cinema-gold/20">
                    <Ticket className="w-3.5 h-3.5" />
                    {activeFeatured.total_tickets.toLocaleString('vi-VN')} vé đã bán
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight min-h-[1.2em]">
                {activeFeatured.title}
              </h1>

              <p className="text-cinema-text-muted text-sm sm:text-base line-clamp-3 max-w-2xl leading-relaxed">
                {activeFeatured.description || 'Trải nghiệm siêu phẩm điện ảnh với hình ảnh sắc nét và âm thanh sống động chưa từng có tại các phòng chiếu GzaCinema.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to={`/movie/${activeFeatured.id}`}>
                  <Button variant="primary" size="lg" leftIcon={<Film className="w-5 h-5" />}>
                    Đặt Vé Ngay
                  </Button>
                </Link>
                <Link to={`/movie/${activeFeatured.id}`}>
                  <Button variant="secondary" size="lg">
                    Xem Chi Tiết
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Poster Preview */}
            <div className="hidden lg:flex lg:col-span-5 justify-center relative">
              <div className="relative group/poster w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:scale-105 transition-transform duration-300">
                <div key={`poster-${activeFeatured.id}`} className="animate-cinema-poster w-full h-full relative">
                  {/* Ranking Ribbon */}
                  <div className="absolute top-3 left-3 z-20 bg-cinema-bg/90 backdrop-blur-md px-3 py-1 rounded-xl border border-cinema-gold/40 shadow-glow-gold-sm">
                    <span className="text-sm font-black text-cinema-gold">#{activeFeatured.rank}</span>
                  </div>

                  <img
                    src={activeFeatured.thumbnail}
                    alt={activeFeatured.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-xs font-bold text-cinema-gold">
                      Thời lượng: {activeFeatured.duration_minutes || 120} phút
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dot Indicators */}
          {rankingMovies.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-cinema-bg/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
              {rankingMovies.map((_, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideDirection(idx > currentSlide ? 'next' : 'prev');
                      setCurrentSlide(idx);
                    }}
                    title={`Chuyển tới phim ${idx + 1}`}
                    aria-label={`Slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer border-none p-0 ${
                      isActive
                        ? 'w-7 h-2 bg-cinema-gold shadow-glow-gold-sm'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/70'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* MOVIE LISTING TABS & GRID */}
      <section ref={moviesSectionRef} id="movies-section" className="space-y-6 scroll-mt-24">
        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabChange('showing')}
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
              onClick={() => handleTabChange('coming_soon')}
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
            Hiển thị <strong className="text-cinema-text">{tabMovies.length}</strong> bộ phim
          </span>
        </div>

        {/* Movie Grid */}
        {isLoadingTabMovies ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : tabMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {tabMovies.map((movie) => (
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
