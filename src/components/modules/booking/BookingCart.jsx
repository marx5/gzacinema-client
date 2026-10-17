import { useMemo } from 'react';
import CountdownTimer from './CountdownTimer';
import { formatCurrency, formatDateTime, formatDuration } from '@/utils/formatters';
import { calculateSeatPrice, SEAT_TYPE_LABEL } from '@/models/booking.model';
import { ShoppingBag, CreditCard, Ticket, ShieldCheck, Building2, MapPin, Clock, Film } from 'lucide-react';
import { Button } from '@/components/core';

export default function BookingCart({
  showtimeId,
  seatData,
  showtimeInfo: showtimeInfoProp,
  mySelectedSeats,
  handleCheckout,
  processing,
  timerKey,
  handleTimeExpire
}) {
  const showtimeInfo = showtimeInfoProp || seatData?.showtime_info || {};
  const basePrice = parseFloat(showtimeInfo?.base_price || 0);

  const { groupedCartItems, totalPrice } = useMemo(() => {
    if (!seatData) return { groupedCartItems: [], totalPrice: 0 };
    const items = [];
    const processedIds = new Set();
    const selectedSeatsSet = new Set(mySelectedSeats);
    const selectedDetails = seatData.seats.filter((s) => selectedSeatsSet.has(s.id));

    selectedDetails.forEach((seat) => {
      if (processedIds.has(seat.id)) return;

      if (seat.type === 'sweetbox') {
        const partnerNum = seat.seat_number % 2 !== 0 ? seat.seat_number + 1 : seat.seat_number - 1;
        const partnerSeat = selectedDetails.find(
          (s) => s.row_letter === seat.row_letter && s.seat_number === partnerNum
        );

        if (partnerSeat) {
          items.push({
            id: `${seat.id}-${partnerSeat.id}`,
            label: `Sweetbox ${seat.row_letter}${Math.min(seat.seat_number, partnerSeat.seat_number)}-${seat.row_letter}${Math.max(seat.seat_number, partnerSeat.seat_number)}`,
            price: calculateSeatPrice(basePrice, 'sweetbox') * 2,
            type: 'sweetbox'
          });
          processedIds.add(seat.id);
          processedIds.add(partnerSeat.id);
          return;
        }
      }

      const normalizedType = String(seat.type || 'standard').toLowerCase();
      const price = calculateSeatPrice(basePrice, normalizedType);
      const typeLabel = `Ghế ${SEAT_TYPE_LABEL[normalizedType] || SEAT_TYPE_LABEL.standard}`;

      items.push({
        id: seat.id,
        label: `${seat.row_letter}${seat.seat_number}`,
        typeLabel,
        price,
        type: seat.type
      });
      processedIds.add(seat.id);
    });

    return {
      groupedCartItems: items,
      totalPrice: items.reduce((sum, item) => sum + item.price, 0)
    };
  }, [mySelectedSeats, seatData, basePrice]);

  return (
    <div className="w-full lg:w-[32%] lg:sticky lg:top-24 rounded-2xl sm:rounded-3xl glass-card border border-white/10 p-4 sm:p-6 shadow-cinematic space-y-4 sm:space-y-5">
      {/* Header & Countdown */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-cinema-gold" />
          Thông Tin Vé
        </h2>
        {mySelectedSeats.length > 0 && (
          <CountdownTimer key={timerKey} showtimeId={showtimeId} onExpire={handleTimeExpire} />
        )}
      </div>

      {/* Showtime Receipt Summary */}
      <div className="space-y-3 text-xs sm:text-sm text-cinema-text-muted bg-white/[0.02] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/5">
        <div className="flex items-start gap-3 pb-2.5 border-b border-white/5">
          {showtimeInfo?.poster_url ? (
            <img
              src={showtimeInfo.poster_url}
              alt={showtimeInfo?.movie_title || 'Poster phim'}
              className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg object-cover border border-white/10 shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg bg-cinema-surface-elevated border border-white/10 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-cinema-gold/70" />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
              {showtimeInfo?.movie_title || 'Suất Chiếu Phim'}
            </h3>
            <p className="text-[11px] sm:text-xs text-cinema-gold font-semibold flex items-center gap-1 truncate">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{showtimeInfo?.cinema_name || 'GzaCinema'}</span>
            </p>
            {showtimeInfo?.duration_minutes && (
              <p className="text-[11px] text-cinema-text-dim">
                Thời lượng: {formatDuration(showtimeInfo.duration_minutes)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-cinema-text-dim flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cinema-gold/70" />
              Cụm rạp:
            </span>
            <strong className="text-white font-bold text-right truncate">
              {showtimeInfo?.cinema_name || 'GzaCinema'}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-cinema-text-dim flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cinema-gold/70" />
              Phòng chiếu:
            </span>
            <strong className="text-white font-bold text-right">
              {showtimeInfo?.room_name || 'Phòng chiếu'}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-cinema-text-dim flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cinema-gold/70" />
              Suất chiếu:
            </span>
            <strong className="text-cinema-gold font-bold text-right">
              {formatDateTime(showtimeInfo?.start_time)}
            </strong>
          </div>
        </div>
      </div>

      {/* Cart Selected Seats */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-cinema-text-dim uppercase tracking-wider">
          <span>Ghế đã chọn ({mySelectedSeats.length})</span>
          <span>Giá vé</span>
        </div>

        <div className="min-h-[120px] sm:min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {groupedCartItems.length === 0 ? (
            <div className="py-6 sm:py-8 text-center text-xs text-cinema-text-dim space-y-1">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-cinema-text-dim/50 mx-auto" />
              <p>Chưa có ghế nào được chọn</p>
              <p className="text-[11px]">Vui lòng click vào ghế trên sơ đồ</p>
            </div>
          ) : (
            groupedCartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-cinema-surface-elevated/70 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cinema-gold bg-cinema-gold/10 px-2 py-0.5 rounded-md border border-cinema-gold/20">
                    {item.label}
                  </span>
                  {item.typeLabel && (
                    <span className="text-[11px] text-cinema-text-dim">{item.typeLabel}</span>
                  )}
                </div>
                <span className="font-bold text-white">{formatCurrency(item.price)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Total & Checkout */}
      <div className="pt-3 sm:pt-4 border-t border-white/10 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-cinema-text-muted">Tổng cộng:</span>
          <span className="text-xl sm:text-3xl font-black text-cinema-gold">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[48px] shadow-glow-gold text-sm sm:text-base font-bold active:scale-95"
          onClick={handleCheckout}
          disabled={mySelectedSeats.length === 0 || processing}
          isLoading={processing}
          leftIcon={<CreditCard className="w-5 h-5" />}
        >
          Tiến Hành Thanh Toán
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-cinema-text-dim">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Thanh toán an toàn & bảo mật 100%</span>
        </div>
      </div>
    </div>
  );
}