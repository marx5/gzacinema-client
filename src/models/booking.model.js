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
