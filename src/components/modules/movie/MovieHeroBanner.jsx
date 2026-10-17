import { useState } from 'react';
import {
  Sparkles,
  Tv,
  Clock,
  Calendar,
  Film,
  Ticket,
  Play,
  Clapperboard,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge, Button, Modal } from '@/components/core';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const str = String(url).trim();
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = str.match(regExp);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function MovieHeroBanner({ movie, onOpenShowtimes }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (!movie) return null;

  const posterSrc = movie.posterUrl || movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
  const ageRating = movie.ageRating || movie.age_rating;
  const trailerUrl = movie.trailer_url || movie.trailerUrl;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(trailerUrl);

  const descriptionText =
    movie.description ||
    'Một tuyệt tác điện ảnh mãn nhãn với kỹ xảo đỉnh cao và cốt truyện cuốn hút, mang đến trải nghiệm nghe nhìn ấn tượng tại hệ thống rạp GzaCinema.';
  const isLongDescription = descriptionText.length > 180;

  const handleTrailerClick = () => {
    if (youtubeEmbedUrl) {
      setIsTrailerOpen(true);
    } else if (trailerUrl) {
      window.open(trailerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 glass-card p-4 sm:p-8 lg:p-10 shadow-cinematic">
        {/* Ambient Backdrop Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={posterSrc}
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
                src={posterSrc}
                alt={movie.title}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
            {ageRating && (
              <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 shadow-lg">
                <Badge variant="rose" size="sm" className="font-extrabold uppercase shadow-md text-[10px] sm:text-xs">
                  {ageRating}
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
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-cinema-text-muted font-medium">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-gold" />
                <span>
                  <strong className="text-white">{movie.duration_minutes || movie.duration || 120}</strong> phút
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cinema-gold" />
                <span>
                  Khởi chiếu:{' '}
                  <strong className="text-white">
                    {(movie.release_date || movie.releaseDate)
                      ? new Date(movie.release_date || movie.releaseDate).toLocaleDateString('vi-VN')
                      : 'Đang chiếu'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Director & Cast Metadata */}
            {(movie.director || movie.actor) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-1 text-left bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:p-4 max-w-3xl">
                {movie.director && (
                  <div className="flex items-start gap-2.5">
                    <Clapperboard className="w-4 h-4 text-cinema-gold shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <span className="text-cinema-text-dim block text-[11px] uppercase tracking-wider font-semibold">
                        Đạo diễn
                      </span>
                      <span className="text-white font-semibold">{movie.director}</span>
                    </div>
                  </div>
                )}
                {movie.actor && (
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-cinema-gold shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <span className="text-cinema-text-dim block text-[11px] uppercase tracking-wider font-semibold">
                        Diễn viên
                      </span>
                      <span className="text-white font-semibold line-clamp-2">{movie.actor}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Synopsis */}
            <div className="space-y-1.5 sm:space-y-2 pt-1">
              <h3 className="text-xs uppercase tracking-wider font-bold text-cinema-gold flex items-center gap-1.5 justify-center md:justify-start">
                <Film className="w-3.5 h-3.5" />
                Tóm tắt nội dung
              </h3>
              <p
                className={`text-xs sm:text-base leading-relaxed text-cinema-text-muted max-w-3xl ${
                  !isExpanded && isLongDescription ? 'line-clamp-3 sm:line-clamp-4' : ''
                }`}
              >
                {descriptionText}
              </p>
              {isLongDescription && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cinema-gold hover:text-cinema-gold-light transition-colors cursor-pointer pt-0.5"
                >
                  {isExpanded ? (
                    <>
                      <span>Thu gọn</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Xem thêm</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
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

              {trailerUrl && (
                <button
                  type="button"
                  onClick={handleTrailerClick}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                  Xem Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Trailer Modal */}
      {youtubeEmbedUrl && (
        <Modal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          className="max-w-4xl"
        >
          <Modal.Header>
            <Modal.Title className="flex items-center gap-2 text-base sm:text-lg">
              <Play className="w-4 h-4 text-cinema-gold fill-cinema-gold shrink-0" />
              <span className="truncate">Trailer: {movie.title}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0 sm:p-4 bg-black">
            <div className="w-full aspect-video overflow-hidden sm:rounded-xl bg-black">
              <iframe
                src={youtubeEmbedUrl}
                title={`Trailer ${movie.title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
