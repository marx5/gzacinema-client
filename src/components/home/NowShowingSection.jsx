import MovieCard from "../modules/movie/MovieCard";
import SkeletonCard from "../core/SkeletonCard";

export function NowShowingSection({ movies = [], loading = false }) {
  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-brand-500 inline-block" />
            Phim Đang Chiếu
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Những tựa phim hot nhất đang có lịch chiếu tại các cụm rạp
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-dark-card border border-dark-border rounded-xl">
          Hiện chưa có phim đang chiếu
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

export default NowShowingSection;
