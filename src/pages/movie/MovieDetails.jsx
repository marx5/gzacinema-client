import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMovieDetails } from '@/hooks';
import { Breadcrumb } from '@/components/layouts';
import { Button } from '@/components/core';
import { MovieHeroBanner, MovieShowtimesModal } from '@/components/modules/movie';
import { Film, Info, AlertTriangle, RefreshCw } from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const [isShowtimesModalOpen, setIsShowtimesModalOpen] = useState(false);
  const { movie, showtimesGrouped, isLoading, isError, refetch } = useMovieDetails(id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-24 flex flex-col items-center justify-center gap-4 text-cinema-text-muted">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-cinema-gold/30 border-t-cinema-gold animate-spin" />
          <Film className="w-7 h-7 text-cinema-gold absolute" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-cinema-gold animate-pulse">
          Đang tải thông tin phim & lịch chiếu...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-cinema-rose mx-auto" />
        <h2 className="text-2xl font-bold text-white">Lỗi kết nối máy chủ!</h2>
        <p className="text-sm text-cinema-text-muted">
          Không thể lấy thông tin phim lúc này. Vui lòng kiểm tra lại đường truyền.
        </p>
        <Button variant="secondary" size="md" onClick={() => refetch()} className="gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-24 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Không tìm thấy thông tin phim!</h2>
        <p className="text-cinema-text-muted mt-2 max-w-md mx-auto">
          Bộ phim này có thể đã ngừng chiếu hoặc đường dẫn không chính xác. Vui lòng quay lại danh sách phim.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="primary">Khám phá phim đang chiếu</Button>
        </Link>
      </div>
    );
  }

  const movieCategoryLabel = movie.isComingSoon ? 'Phim sắp chiếu' : 'Phim đang chiếu';
  const movieCategoryLink = movie.isComingSoon ? '/?tab=coming_soon' : '/?tab=showing';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Helmet>
        <title>{movie.title} | Lịch Chiếu - GzaCinema</title>
        <meta name="description" content={movie.description?.substring(0, 160)} />
        <meta property="og:title" content={`${movie.title} - GzaCinema`} />
        <meta property="og:image" content={movie.posterUrl} />
      </Helmet>

      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={[
          { label: movieCategoryLabel, link: movieCategoryLink },
          { label: movie.title },
        ]}
      />

      {/* Hero Movie Banner */}
      <MovieHeroBanner
        movie={movie}
        onOpenShowtimes={() => setIsShowtimesModalOpen(true)}
      />

      {/* Modal Lịch Chiếu */}
      <MovieShowtimesModal
        isOpen={isShowtimesModalOpen}
        onClose={() => setIsShowtimesModalOpen(false)}
        movie={movie}
        showtimesGrouped={showtimesGrouped}
      />
    </div>
  );
}

