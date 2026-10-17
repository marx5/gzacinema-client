/**
 * Movie & Showtime Domain Entities, Enums, and Mappers (Anti-Corruption Layer)
 */
import { toLocalDateString } from '@/utils/formatters';

/**
 * Maps raw backend Movie DTO to clean Frontend Domain Movie
 */
export const mapMovieDtoToEntity = (movieDto) => {
  if (!movieDto) return null;

  const todayStr = toLocalDateString();
  const releaseDateVal = movieDto.release_date || movieDto.releaseDate || null;
  const releaseDateStr = releaseDateVal ? toLocalDateString(releaseDateVal) : '';
  const isComingSoon = releaseDateStr ? releaseDateStr > todayStr : false;
  const poster = movieDto.thumbnail || movieDto.poster_url || movieDto.posterUrl || '';
  const duration = Number(movieDto.duration_minutes || movieDto.duration || 0);

  return {
    id: movieDto.id,
    title: movieDto.title || 'Chưa có tiêu đề',
    description: movieDto.description || '',
    thumbnail: poster,
    posterUrl: poster,
    poster_url: poster,
    trailerUrl: movieDto.trailer_url || movieDto.trailerUrl || '',
    trailer_url: movieDto.trailer_url || movieDto.trailerUrl || '',
    duration,
    duration_minutes: duration,
    releaseDate: releaseDateVal,
    release_date: releaseDateVal,
    genre: movieDto.genre || 'Đang cập nhật',
    director: movieDto.director || 'Đang cập nhật',
    actor: movieDto.actor || 'Đang cập nhật',
    ageRating: movieDto.age_rating || movieDto.ageRating || 'P',
    age_rating: movieDto.age_rating || movieDto.ageRating || 'P',
    isComingSoon,
    status: movieDto.status || 'ACTIVE',
  };
};

/**
 * Maps raw backend Showtime Group DTO to clean Frontend Showtime Group
 */
export const mapShowtimeGroupDtoToEntity = (groupDto) => {
  if (!groupDto) return null;

  return {
    cinema_info: {
      id: groupDto.cinema_info?.id ?? groupDto.id,
      name: groupDto.cinema_info?.name ?? groupDto.name ?? 'GzaCinema Complex',
      address: groupDto.cinema_info?.address ?? groupDto.address ?? '',
    },
    showtimes: (groupDto.showtimes || []).map((st) => ({
      showtime_id: st.showtime_id ?? st.id,
      start_time: st.start_time ?? st.startTime,
      base_price: Number(st.base_price ?? st.price ?? 0),
      room_name: st.room_name ?? st.room?.name ?? '',
    })),
  };
};

