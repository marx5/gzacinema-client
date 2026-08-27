import { Film, Clapperboard } from 'lucide-react';
import { SkeletonCard } from '../core';
import { MovieCard } from '../modules/movie';

export default function MovieTabSection({
  activeTab = 'showing',
  onTabChange,
  movies = [],
  isLoading = false,
  sectionRef,
}) {
  return (
    <section ref={sectionRef} id="movies-section" className="space-y-6 scroll-mt-24">
      {/* Tab Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4">
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
      </div>

      {/* Movie Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
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
