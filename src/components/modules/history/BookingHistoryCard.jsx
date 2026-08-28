import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/core';
import { MapPin, Calendar } from 'lucide-react';
import TicketQrCard from './TicketQrCard';

export default function BookingHistoryCard({ booking }) {
  if (!booking) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-card border border-white/10 shadow-cinematic p-4 sm:p-8 space-y-5 sm:space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-5">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm" className="text-[10px] sm:text-xs">
              E-Ticket Pass
            </Badge>
            <span className="text-[11px] sm:text-xs text-cinema-text-dim font-mono">
              Mã đơn: #{booking.code}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{booking.movieTitle}</h2>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-cinema-text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
              {booking.roomName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
              {formatDateTime(booking.startTime)}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <p className="text-xs text-cinema-text-dim">Tổng thanh toán</p>
          <p className="text-xl sm:text-2xl font-black text-cinema-gold">
            {formatCurrency(booking.totalAmount)}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-cinema-text-dim">
          Danh sách vé xem phim ({booking.tickets?.length || 0} ghế)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {booking.tickets?.map((ticket) => (
            <TicketQrCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </div>
  );
}

