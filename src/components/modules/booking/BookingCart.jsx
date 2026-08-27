import { useMemo } from 'react';
import CountdownTimer from './CountdownTimer';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { ShoppingBag, CreditCard, Ticket, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../../core';

export default function BookingCart({
  showtimeId,
  seatData,
  mySelectedSeats,
  handleCheckout,
  processing,
  timerKey,
  handleTimeExpire
}) {
  const basePrice = parseFloat(seatData?.showtime_info?.base_price || 0);

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
            price: (basePrice + 50000) * 2,
            type: 'sweetbox'
          });
          processedIds.add(seat.id);
          processedIds.add(partnerSeat.id);
          return;
        }
      }

      let price = basePrice;
      let typeLabel = 'Ghế thường';
      if (seat.type === 'vip') {
        price += 20000;
        typeLabel = 'Ghế VIP';
      }
      if (seat.type === 'sweetbox') {
        price += 50000;
        typeLabel = 'Ghế Sweetbox';
      }

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
    <div className="w-full lg:w-[32%] lg:sticky lg:top-24 rounded-3xl glass-card border border-white/10 p-5 sm:p-6 shadow-cinematic space-y-5">
      {/* Header & Countdown */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-cinema-gold" />
          Thông Tin Vé
        </h2>
        {mySelectedSeats.length > 0 && (
          <CountdownTimer key={timerKey} showtimeId={showtimeId} onExpire={handleTimeExpire} />
        )}
      </div>

      {/* Showtime Details */}
      <div className="space-y-2 text-xs sm:text-sm text-cinema-text-muted bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-cinema-text-dim">Phòng chiếu:</span>
          <strong className="text-white font-bold">{seatData?.showtime_info?.room_name}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-cinema-text-dim">Suất chiếu:</span>
          <strong className="text-cinema-gold font-bold">
            {formatDateTime(seatData?.showtime_info?.start_time)}
          </strong>
        </div>
      </div>

      {/* Cart Selected Seats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-cinema-text-dim uppercase tracking-wider">
          <span>Ghế đã chọn ({mySelectedSeats.length})</span>
          <span>Giá vé</span>
        </div>

        <div className="min-h-[140px] max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {groupedCartItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-cinema-text-dim space-y-1">
              <ShoppingBag className="w-8 h-8 text-cinema-text-dim/50 mx-auto" />
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
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-cinema-text-muted">Tổng cộng:</span>
          <span className="text-2xl sm:text-3xl font-black text-cinema-gold">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-glow-gold"
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