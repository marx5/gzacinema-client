import { useState, useMemo, useEffect } from 'react';
import { Film, Clapperboard, Search, X, RotateCcw } from 'lucide-react';
import { SkeletonCard, Button } from '@/components/core';
import { MovieCard } from '@/components/modules/movie';

export default function MovieTabSection({
  activeTab = 'showing',
  onTabChange,
  movies = [],
  isLoading = false,
  sectionRef,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  // Reset genre filter khi chuyển tab
  useEffect(() => {
    setSelectedGenre('ALL');
  }, [activeTab]);

  // Trích xuất danh sách thể loại động từ danh sách phim hiện tại
  const availableGenres = useMemo(() => {
    const genreSet = new Set();
    movies.forEach((m) => {
      if (m?.genre && m.genre !== 'Đang cập nhật') {
        String(m.genre)
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
          .forEach((g) => genreSet.add(g));
      }
    });
    return Array.from(genreSet);
  }, [movies]);

  // Lọc phim theo từ khóa (tên phim, đạo diễn, diễn viên) và thể loại
  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchSearch =
        !q ||
        movie.title?.toLowerCase().includes(q) ||
        movie.director?.toLowerCase().includes(q) ||
        movie.actor?.toLowerCase().includes(q) ||
        movie.genre?.toLowerCase().includes(q);

      const matchGenre =
        selectedGenre === 'ALL' ||
        (movie.genre &&
          String(movie.genre)
            .split(',')
            .map((g) => g.trim().toLowerCase())
            .includes(selectedGenre.toLowerCase()));

      return matchSearch && matchGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  const hasActiveFilter = searchQuery.trim() !== '' || selectedGenre !== 'ALL';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('ALL');
  };

  return (
    <section ref={sectionRef} id="movies-section" className="space-y-5 scroll-mt-24">
      {/* Tab Controls & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onTabChange?.('showing')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[44px] transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'showing'
                ? 'bg-cinema-surface-elevated text-cinema-gold border border-cinema-gold/40 shadow-glow-gold-sm'
                : 'text-cinema-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4 shrink-0" />
            <span className="truncate">Phim Đang Chiếu</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange?.('coming_soon')}
            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[44px] transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'coming_soon'
                ? 'bg-cinema-surface-elevated text-cinema-gold border border-cinema-gold/40 shadow-glow-gold-sm'
                : 'text-cinema-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Clapperboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Phim Sắp Chiếu</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 lg:w-80">
          <Search className="w-4 h-4 text-cinema-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm phim, đạo diễn, diễn viên..."
            className="w-full min-h-[42px] pl-10 pr-9 py-2 rounded-xl bg-cinema-surface border border-white/10 text-xs sm:text-sm text-white placeholder:text-cinema-text-dim focus:outline-none focus:border-cinema-gold/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-cinema-text-dim hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Pills */}
      {availableGenres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedGenre('ALL')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              selectedGenre === 'ALL'
                ? 'bg-cinema-gold text-cinema-bg border-cinema-gold font-bold shadow-glow-gold-sm'
                : 'bg-cinema-surface/80 text-cinema-text-muted border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            Tất cả
          </button>
          {availableGenres.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(isSelected ? 'ALL' : genre)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-cinema-gold text-cinema-bg border-cinema-gold font-bold shadow-glow-gold-sm'
                    : 'bg-cinema-surface/80 text-cinema-text-muted border-white/10 hover:text-white hover:border-white/25'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      )}

      {/* Movie Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={{
                ...movie,
                isComingSoon: movie.isComingSoon ?? activeTab === 'coming_soon',
              }}
            />
          ))}
        </div>
      ) : hasActiveFilter ? (
        <div className="text-center py-14 px-4 glass-card rounded-2xl border border-white/10 space-y-3">
          <Search className="w-10 h-10 text-cinema-gold/70 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-cinema-text">
            Không tìm thấy phim phù hợp
          </h3>
          <p className="text-xs sm:text-sm text-cinema-text-muted max-w-md mx-auto">
            Không có bộ phim nào khớp với bộ lọc hiện tại. Hãy thử từ khóa hoặc thể loại khác.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-2xl border border-white/5">
          <Film className="w-12 h-12 text-cinema-text-dim mx-auto mb-3" />
          <h3 className="text-lg font-bold text-cinema-text">Chưa có danh sách phim</h3>
          <p className="text-sm text-cinema-text-muted mt-1">
            Vui lòng quay lại sau để cập nhật lịch chiếu mới nhất.
          </p>
        </div>
      )}
    </section>
  );
}
