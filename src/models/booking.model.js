/**
 * Booking & Ticket Domain Entities, Enums, and Mappers (Anti-Corruption Layer)
 */

export const TICKET_STATUS = Object.freeze({
  VALID: 'valid',
  USED: 'used',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

export const TICKET_STATUS_CONFIG = Object.freeze({
  [TICKET_STATUS.VALID]: {
    label: 'HỢP LỆ',
    variant: 'emerald',
    icon: 'check',
  },
  [TICKET_STATUS.USED]: {
    label: 'ĐÃ SỬ DỤNG',
    variant: 'dark',
    icon: 'clock',
  },
  [TICKET_STATUS.REFUNDED]: {
    label: 'ĐÃ HOÀN TIỀN',
    variant: 'rose',
    icon: 'ban',
  },
  [TICKET_STATUS.EXPIRED]: {
    label: 'HẾT HẠN',
    variant: 'amber',
    icon: 'alert',
  },
  [TICKET_STATUS.CANCELLED]: {
    label: 'ĐÃ HỦY',
    variant: 'rose',
    icon: 'ban',
  },
});

export const SEAT_SURCHARGE = Object.freeze({
  standard: 0,
  vip: 20000,
  sweetbox: 50000,
});

export const SEAT_TYPE_LABEL = Object.freeze({
  standard: 'Thường',
  vip: 'VIP',
  sweetbox: 'Sweetbox (Đôi)',
});

/**
 * Calculates single seat price based on showtime base price and seat type surcharge
 */
export const calculateSeatPrice = (basePrice, seatType) => {
  const normalizedType = String(seatType || 'standard').toLowerCase();
  const surcharge = SEAT_SURCHARGE[normalizedType] ?? 0;
  return Number(basePrice || 0) + surcharge;
};

/**
 * Maps raw backend Ticket DTO to clean Frontend Domain Ticket
 */
export const mapTicketDtoToEntity = (ticketDto) => {
  if (!ticketDto) return null;

  const rawId = String(ticketDto.id || '');
  const rowLetter = ticketDto.seat?.row_letter || '';
  const seatNumber = ticketDto.seat?.seat_number || '';
  const seatName = rowLetter && seatNumber ? `${rowLetter}${seatNumber}` : 'N/A';
  const seatType = ticketDto.seat?.type ? String(ticketDto.seat.type).toUpperCase() : 'STANDARD';

  const rawStatus = String(ticketDto.status || '').toLowerCase();
  const validStatusList = Object.values(TICKET_STATUS);
  const status = validStatusList.includes(rawStatus) ? rawStatus : TICKET_STATUS.EXPIRED;

  return {
    id: rawId,
    seatName,
    seatType,
    status,
    price: Number(ticketDto.price || 0),
  };
};

/**
 * Maps raw backend Booking DTO to clean Frontend Domain Booking
 */
export const mapBookingDtoToEntity = (bookingDto) => {
  if (!bookingDto) return null;

  const rawId = String(bookingDto.id || '');
  const shortCode = rawId.includes('-')
    ? rawId.split('-')[0].toUpperCase()
    : rawId.slice(0, 8).toUpperCase();

  const showtime = bookingDto.showtime || {};
  const movie = showtime.movie || {};
  const room = showtime.room || {};

  return {
    id: rawId,
    code: shortCode || 'N/A',
    totalAmount: Number(bookingDto.total_amount || 0),
    movieTitle: movie.title || 'Phim chưa xác định',
    roomName: room.name || 'Phòng chiếu N/A',
    startTime: showtime.start_time || null,
    createdAt: bookingDto.created_at || null,
    tickets: Array.isArray(bookingDto.tickets)
      ? bookingDto.tickets.map(mapTicketDtoToEntity).filter(Boolean)
      : [],
  };
};

/**
 * Maps raw backend Showtime Seats DTO to clean Frontend Domain Showtime Seats Entity
 */
export const mapShowtimeSeatsDtoToEntity = (dto) => {
  if (!dto) return null;

  return {
    ...dto,
    showtime_info: {
      movie_id: dto.showtime_info?.movie_id ?? null,
      movie_title: dto.showtime_info?.movie_title || '',
      poster_url: dto.showtime_info?.poster_url || '',
      duration_minutes: dto.showtime_info?.duration_minutes ?? null,
      start_time: dto.showtime_info?.start_time ?? null,
      room_name: dto.showtime_info?.room_name || 'Phòng chiếu',
      cinema_name: dto.showtime_info?.cinema_name || 'GzaCinema',
      cinema_address: dto.showtime_info?.cinema_address || '',
      base_price: Number(dto.showtime_info?.base_price ?? 0),
    },
    seats: Array.isArray(dto.seats) ? dto.seats : [],
  };
};

