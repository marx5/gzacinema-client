/**
 * Movie & Showtime Domain Entities, Enums, and Mappers (Anti-Corruption Layer)
 */

/**
 * Maps raw backend Movie DTO to clean Frontend Domain Movie
 */
export const mapMovieDtoToEntity = (movieDto) => {
  if (!movieDto) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const releaseDateVal = movieDto.release_date || movieDto.releaseDate || null;
  const releaseDateStr = releaseDateVal ? String(releaseDateVal).split('T')[0] : '';
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
    date: groupDto.date,
    cinemas: (groupDto.cinemas || []).map((cinema) => ({
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
      showtimes: (cinema.showtimes || []).map((st) => ({
        id: st.id,
        startTime: st.start_time,
        endTime: st.end_time,
        price: Number(st.price || 0),
        roomName: st.room?.name || '',
      })),
    })),
  };
};
