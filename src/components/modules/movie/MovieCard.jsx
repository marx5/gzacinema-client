import React, { createContext, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Ticket, Film } from 'lucide-react';
import { Badge, Button } from '../../core';

const MovieCardContext = createContext(null);

export function useMovieCard() {
  const context = useContext(MovieCardContext);
  if (!context) {
    throw new Error('MovieCard compound components must be rendered inside <MovieCard>');
  }
  return context;
}

export function MovieCard({ movie, children, className = '' }) {
  const defaultImg = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";
  const [isHovered, setIsHovered] = useState(false);

  // If children are not provided, render standard cinematic card layout
  return (
    <MovieCardContext.Provider value={{ movie, defaultImg, isHovered }}>
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:-translate-y-2 hover:border-cinema-gold/40 hover:shadow-card ${className}`}
      >
        {children ? (
          children
        ) : (
          <>
            <div className="relative">
              <MovieCard.Poster />
              <MovieCard.Content />
            </div>
            <MovieCard.Action />
          </>
        )}
      </article>
    </MovieCardContext.Provider>
  );
}

MovieCard.Poster = function MovieCardPoster({ className = '' }) {
  const { movie, defaultImg } = useMovieCard();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`relative aspect-[2/3] w-full block overflow-hidden bg-cinema-surface-elevated cursor-pointer ${className}`}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent opacity-80 z-10" />

      {/* Quick View Overlay on Hover */}
      <div className="absolute inset-0 z-15 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="bg-cinema-surface/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          Xem Chi Tiết
        </span>
      </div>

      <img
        src={movie.thumbnail || defaultImg}
        alt={movie.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Floating Badges */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap gap-1.5">
        <Badge variant="gold" size="sm" className="backdrop-blur-md">
          {movie.format || '2D Digital'}
        </Badge>
        {movie.age_rating && (
          <Badge variant="rose" size="sm" className="backdrop-blur-md">
            {movie.age_rating}
          </Badge>
        )}
      </div>
    </Link>
  );
};

MovieCard.Content = function MovieCardContent({ className = '' }) {
  const { movie } = useMovieCard();

  return (
    <div className={`p-3.5 sm:p-4 ${className}`}>
      <Link to={`/movie/${movie.id}`} className="block">
        <h3
          className="font-display text-base font-bold text-cinema-text line-clamp-1 group-hover:text-cinema-gold transition-colors duration-200 cursor-pointer"
          title={movie.title}
        >
          {movie.title}
        </h3>
      </Link>

      <div className="mt-2.5 flex flex-col gap-1.5 text-xs text-cinema-text-muted">
        <div className="flex items-center gap-1.5 truncate">
          <Film className="w-3.5 h-3.5 text-cinema-gold flex-shrink-0" />
          <span className="truncate">{movie.genre || 'Đang cập nhật'}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-cinema-text-dim">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cinema-gold/70" />
            <span>{movie.duration_minutes || 0} phút</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cinema-gold/70" />
            <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'Sắp chiếu'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

MovieCard.Action = function MovieCardAction({ className = '' }) {
  const { movie } = useMovieCard();
  const isComingSoon = movie.release_date && new Date(movie.release_date) > new Date();

  return (
    <div className={`p-3.5 sm:p-4 pt-0 mt-auto ${className}`}>
      <Link to={`/movie/${movie.id}`} className="block w-full">
        <Button
          variant="secondary"
          size="sm"
          className="w-full group-hover:bg-gold-gradient group-hover:text-cinema-bg group-hover:font-bold group-hover:border-transparent transition-all duration-300"
          leftIcon={isComingSoon ? <Film className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
        >
          {isComingSoon ? 'Xem Chi Tiết' : 'Đặt Vé Ngay'}
        </Button>
      </Link>
    </div>
  );
};

export default MovieCard;