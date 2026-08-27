import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../api/movieApi';
import { mapMovieDtoToEntity, mapShowtimeGroupDtoToEntity } from '../models/movie.model';

/**
 * Use Case Hook: Lấy và chuẩn hóa dữ liệu chi tiết phim & lịch chiếu
 */
export const useMovieDetails = (movieId) => {
  const query = useQuery({
    queryKey: ['movieDetails', movieId],
    queryFn: async () => {
      if (!movieId) return { movie: null, showtimesGrouped: [] };
      const [movieRes, showtimesRes] = await Promise.all([
        movieApi.getById(movieId),
        movieApi.getShowtimes(movieId),
      ]);

      const movieEntity = mapMovieDtoToEntity(movieRes.data);
      const rawGroups = showtimesRes.data || [];
      const showtimesEntity = Array.isArray(rawGroups)
        ? rawGroups.map(mapShowtimeGroupDtoToEntity).filter(Boolean)
        : [];

      return {
        movie: movieEntity,
        showtimesGrouped: showtimesEntity,
      };
    },
    enabled: Boolean(movieId),
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  return {
    movie: query.data?.movie || null,
    showtimesGrouped: query.data?.showtimesGrouped || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
