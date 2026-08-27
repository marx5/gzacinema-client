import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Film, Trophy, Ticket } from 'lucide-react';
import { Button, Badge } from '../core';

export default function HeroBannerSlider({
  movies = [],
  isLoading = false,
  autoPlayInterval = 5000,
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const isMouseDownRef = useRef(false);

  const nextSlide = useCallback(() => {
    if (movies.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    if (movies.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Auto-play slider
  useEffect(() => {
    if (isPaused || movies.length <= 1) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, movies.length, autoPlayInterval]);

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

  // Touch handlers
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
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button, a')) return;
    isMouseDownRef.current = true;
    touchStartXRef.current = e.clientX;
    touchEndXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    touchEndXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
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

  if (isLoading) {
    return (
      <div className="relative h-96 w-full rounded-3xl border border-white/10 glass-card animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Film className="w-10 h-10 text-cinema-gold animate-spin" />
          <p className="text-sm text-cinema-text-muted">Đang tải phim nổi bật...</p>
        </div>
      </div>
    );
  }

  const activeFeatured = movies[currentSlide] || movies[0];
  if (!activeFeatured) return null;

  return (
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
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 glass-card shadow-cinematic group cursor-grab active:cursor-grabbing touch-pan-y"
    >
      {/* Background Poster Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {activeFeatured.thumbnail && (
          <img
            src={activeFeatured.thumbnail}
            alt=""
            key={`bg-${activeFeatured.id}`}
            className="h-full w-full object-cover object-center opacity-25 filter blur-xl scale-110 animate-cinema-bg"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/90 to-cinema-bg/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-row items-center justify-between gap-4 sm:gap-8 lg:gap-12 p-4 sm:p-8 lg:p-12 pb-10 sm:pb-12">
        {/* Content Info (Bên Trái) */}
        <div
          key={`info-${activeFeatured.id}`}
          className="flex-1 min-w-0 space-y-2.5 sm:space-y-4 animate-cinema-fade"
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge variant="gold" size="sm" className="text-[10px] sm:text-xs" icon={<Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}>
              TOP #{activeFeatured.rank || currentSlide + 1}
            </Badge>
            <Badge variant="glass" size="sm" className="text-[10px] sm:text-xs">
              {activeFeatured.genre || 'Bom Tấn'}
            </Badge>
            {activeFeatured.total_tickets > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-cinema-gold/90 font-medium bg-cinema-gold/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-cinema-gold/20">
                <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {activeFeatured.total_tickets.toLocaleString('vi-VN')} vé đã bán
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight line-clamp-2">
            {activeFeatured.title}
          </h1>

          <p className="text-cinema-text-muted text-xs sm:text-sm lg:text-base line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed hidden sm:block">
            {activeFeatured.description ||
              'Trải nghiệm siêu phẩm điện ảnh với hình ảnh sắc nét và âm thanh sống động chưa từng có tại các phòng chiếu GzaCinema.'}
          </p>

          <div className="pt-1 sm:pt-2">
            <Link to={`/movie/${activeFeatured.id}`} className="inline-block w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto min-h-[40px] sm:min-h-[44px] px-4 sm:px-6 shadow-glow-gold text-xs sm:text-sm font-bold active:scale-95"
                leftIcon={<Film className="w-4 h-4" />}
              >
                Xem Chi Tiết
              </Button>
            </Link>
          </div>
        </div>

        {/* Poster Preview (Bên Phải) */}
        <div className="relative shrink-0 w-28 sm:w-44 md:w-56 lg:w-64 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-transform duration-300">
          <div key={`poster-${activeFeatured.id}`} className="animate-cinema-poster w-full aspect-[2/3] relative bg-cinema-surface-elevated">
            {/* Ranking Ribbon */}
            <div className="absolute top-2 left-2 z-20 bg-cinema-bg/90 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-cinema-gold/40 shadow-glow-gold-sm">
              <span className="text-[10px] sm:text-xs font-black text-cinema-gold">
                #{activeFeatured.rank || currentSlide + 1}
              </span>
            </div>

            <img
              src={activeFeatured.thumbnail}
              alt={activeFeatured.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-1.5 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 text-center">
              <span className="text-[9px] sm:text-xs font-bold text-cinema-gold">
                {activeFeatured.duration_minutes || 120} phút
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dot Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-cinema-bg/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
          {movies.map((_, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
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
  );
}
