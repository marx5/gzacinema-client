import { Sparkles, Tv, Clock, Calendar, Film, Ticket, Play } from 'lucide-react';
import { Badge, Button } from '../../core';

export default function MovieHeroBanner({ movie, onOpenShowtimes }) {
  if (!movie) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-4 sm:p-8 lg:p-10 shadow-cinematic">
      {/* Ambient Backdrop Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
          alt=""
          className="h-full w-full object-cover opacity-25 filter blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/95 to-cinema-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-12 items-center md:items-start">
        {/* Poster with glow & age rating badge */}
        <div className="relative group shrink-0">
          <div className="w-44 sm:w-64 lg:w-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 transition-transform duration-300 group-hover:scale-[1.02]">
            <img
              src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
              alt={movie.title}
              loading="lazy"
              className="aspect-[2/3] w-full object-cover"
            />
          </div>
          {movie.age_rating && (
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 shadow-lg">
              <Badge variant="rose" size="sm" className="font-extrabold uppercase shadow-md text-[10px] sm:text-xs">
                {movie.age_rating}
              </Badge>
            </div>
          )}
        </div>

        {/* Details & Metadata */}
        <div className="flex-1 space-y-4 sm:space-y-5 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5">
            <Badge variant="gold" size="sm" className="sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {movie.genre || 'Điện ảnh'}
            </Badge>
            <Badge variant="glass" size="sm" className="sm:text-xs">
              <Tv className="w-3.5 h-3.5 mr-1" />
              2D / Digital / Laser
            </Badge>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-md bg-white/5 border border-white/10 text-cinema-text-muted font-medium">
              GzaCinema Premium
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {movie.title}
          </h1>

          {/* Quick Meta Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-cinema-text-muted font-medium">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/5">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-gold" />
              <span>
                <strong className="text-white">{movie.duration_minutes || 120}</strong> phút
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/5">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-gold" />
              <span>
                Khởi chiếu:{' '}
                <strong className="text-white">
                  {movie.release_date
                    ? new Date(movie.release_date).toLocaleDateString('vi-VN')
                    : 'Đang chiếu'}
                </strong>
              </span>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5 sm:space-y-2 pt-1">
            <h3 className="text-xs uppercase tracking-wider font-bold text-cinema-gold flex items-center gap-1.5 justify-center md:justify-start">
              <Film className="w-3.5 h-3.5" />
              Tóm tắt nội dung
            </h3>
            <p className="text-xs sm:text-base leading-relaxed text-cinema-text-muted max-w-3xl line-clamp-3 sm:line-clamp-4">
              {movie.description ||
                'Một tuyệt tác điện ảnh mãn nhãn với kỹ xảo đỉnh cao và cốt truyện cuốn hút, mang đến trải nghiệm nghe nhìn ấn tượng tại hệ thống rạp GzaCinema.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onOpenShowtimes}
              className="w-full sm:w-auto min-h-[44px] shadow-glow-gold flex items-center justify-center gap-2 text-sm font-bold active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              Đặt vé
            </Button>

            {movie.trailer_url && (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white font-semibold text-sm transition-all active:scale-95"
              >
                <Play className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                Xem Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
