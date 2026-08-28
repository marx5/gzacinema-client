import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Ticket, Film } from 'lucide-react';
import { Badge, Button } from '@/components/core';

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
        className={`group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1.5 hover:border-cinema-gold/40 hover:shadow-card ${className}`}
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
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [movie.thumbnail]);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className={`relative aspect-[3/4] w-full block overflow-hidden bg-cinema-surface-elevated cursor-pointer ${className}`}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent opacity-80 z-10" />

      {/* Quick View Overlay on Hover */}
      <div className="absolute inset-0 z-15 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="bg-cinema-surface/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          Xem Chi Tiết
        </span>
      </div>

      <img
        ref={imgRef}
        src={movie.thumbnail || defaultImg}
        alt={movie.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          if (e.currentTarget.src !== defaultImg) {
            e.currentTarget.src = defaultImg;
          }
          setIsLoaded(true);
        }}
        className={`h-full w-full object-cover transition-opacity duration-300 ease-out group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Floating Badges */}
      <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 flex flex-wrap gap-1">
        <Badge variant="gold" size="sm" className="backdrop-blur-md text-[9px] sm:text-[10px] px-1.5 py-0.2">
          {movie.format || '2D Digital'}
        </Badge>
        {movie.age_rating && (
          <Badge variant="rose" size="sm" className="backdrop-blur-md text-[9px] sm:text-[10px] px-1.5 py-0.2">
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
    <div className={`p-2 sm:p-3 ${className}`}>
      <Link to={`/movie/${movie.id}`} className="block">
        <h3
          className="font-display text-xs sm:text-sm font-bold text-cinema-text line-clamp-1 group-hover:text-cinema-gold transition-colors duration-200 cursor-pointer"
          title={movie.title}
        >
          {movie.title}
        </h3>
      </Link>

      <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-cinema-text-dim">
        <span className="truncate max-w-[58%] text-cinema-text-muted">{movie.genre || 'Phim chiếu rạp'}</span>
        <div className="flex items-center gap-1 shrink-0">
          <Clock className="w-2.5 h-2.5 text-cinema-gold/70 shrink-0" />
          <span>{movie.duration_minutes || 0}m</span>
        </div>
      </div>
    </div>
  );
};

MovieCard.Action = function MovieCardAction({ className = '' }) {
  const { movie } = useMovieCard();

  return (
    <div className={`p-2 sm:p-3 pt-0 mt-auto ${className}`}>
      <Link to={`/movie/${movie.id}`} className="block w-full">
        <Button
          variant="secondary"
          size="sm"
          className="w-full min-h-[32px] sm:min-h-[34px] py-1 text-[11px] sm:text-xs group-hover:bg-gold-gradient group-hover:text-cinema-bg group-hover:font-bold group-hover:border-transparent transition-all duration-300 active:scale-95"
          leftIcon={<Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
        >
          Xem Chi Tiết
        </Button>
      </Link>
    </div>
  );
};

export default MovieCard;