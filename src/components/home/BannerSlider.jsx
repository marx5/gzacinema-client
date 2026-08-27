import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Ticket } from "lucide-react";
import Button from "../core/Button";

export function BannerSlider({ movies = [], autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [movies.length, autoPlayInterval]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className="relative w-full h-[360px] md:h-[480px] lg:h-[540px] overflow-hidden rounded-2xl border border-dark-border group bg-dark-card shadow-2xl">
      {/* Background Poster / Backdrop with Gradients */}
      <img
        src={currentMovie.bannerUrl || currentMovie.posterUrl}
        alt={currentMovie.title}
        className="w-full h-full object-cover transition-all duration-700 filter brightness-[0.65] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/50 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 p-6 md:p-12 max-w-2xl z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            {currentMovie.ageRating || "P"}
          </span>
          <span className="text-xs font-medium text-gray-300">
            {currentMovie.duration ? `${currentMovie.duration} phút` : "120 phút"}
          </span>
          {currentMovie.genres && (
            <span className="text-xs text-gray-400">
              • {Array.isArray(currentMovie.genres) ? currentMovie.genres.join(", ") : currentMovie.genres}
            </span>
          )}
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2.5 drop-shadow-md line-clamp-2">
          {currentMovie.title}
        </h2>

        {currentMovie.description && (
          <p className="text-xs md:text-sm text-gray-300 mb-6 line-clamp-2 leading-relaxed">
            {currentMovie.description}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Link to={`/movies/${currentMovie._id || currentMovie.id}`}>
            <Button variant="primary" className="flex items-center gap-2">
              <Ticket size={18} />
              <span>Đặt vé ngay</span>
            </Button>
          </Link>
          {currentMovie.trailerUrl && (
            <a href={currentMovie.trailerUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="flex items-center gap-2">
                <Play size={18} />
                <span>Xem trailer</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {movies.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-500"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-500"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
            {movies.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-brand-500" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BannerSlider;
