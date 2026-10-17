import React, { useMemo } from 'react';

const SeatButton = React.memo(({ seat, onClick, disabled, className }) => {
  const isMaintenance = seat.status === 'broken' || seat.status === 'maintenance';
  const isDisabled = disabled || isMaintenance;

  return (
    <button
      onClick={() => onClick(seat)}
      disabled={isDisabled}
      className={className}
      type="button"
      title={
        isMaintenance
          ? `Ghế ${seat.row_letter}${seat.seat_number} - Đang bảo trì / hỏng`
          : `Ghế ${seat.row_letter}${seat.seat_number} - Loại: ${String(seat.type || 'standard').toUpperCase()}`
      }
      aria-label={`Ghế ${seat.row_letter}${seat.seat_number}`}
    >
      {isMaintenance ? (
        <span className="flex items-center justify-center gap-0.5 leading-none">
          <span>
            {seat.row_letter}
            {seat.seat_number}
          </span>
          <span className="text-[9px] no-underline">✕</span>
        </span>
      ) : (
        <span>
          {seat.row_letter}
          {seat.seat_number}
        </span>
      )}
    </button>
  );
});
SeatButton.displayName = 'SeatButton';

export default function SeatMap({ seatData, mySelectedSeatsSet, handleSeatClick }) {
  const seatRows = useMemo(() => {
    if (!seatData?.seats || !Array.isArray(seatData.seats)) return [];

    // Group seats by row_letter
    const rowMap = new Map();
    seatData.seats.forEach((seat) => {
      const row = seat.row_letter || 'A';
      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row).push(seat);
    });

    // Sort rows alphabetically and seats within each row by seat_number
    return Array.from(rowMap.entries())
      .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
      .map(([rowLetter, seats]) => ({
        rowLetter,
        seats: seats.sort((a, b) => (a.seat_number || 0) - (b.seat_number || 0)),
      }));
  }, [seatData]);

  const getSeatStyles = (seat) => {
    const isSweetbox = seat.type === 'sweetbox';
    const isOddSeat = Number(seat.seat_number || 0) % 2 !== 0;
    const couplePairingClasses = isSweetbox
      ? isOddSeat
        ? 'rounded-r-none border-r-0 mr-[-4px] sm:mr-[-6px]'
        : 'rounded-l-none border-l-rose-500/20'
      : '';

    const base = `relative flex items-center justify-center h-9 sm:h-10 min-w-[34px] sm:min-w-[38px] rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed select-none border active:scale-90 ${couplePairingClasses}`;

    const isSelectedByMe = mySelectedSeatsSet.has(seat.id);

    if (seat.status === 'broken' || seat.status === 'maintenance') {
      return `${base} bg-rose-950/40 text-rose-400/50 cursor-not-allowed border border-rose-500/20 line-through`;
    }
    if (isSelectedByMe) {
      return `${base} bg-gold-gradient text-cinema-bg font-black border-white shadow-glow-gold scale-105 z-10`;
    }
    if (seat.status === 'booked') {
      return `${base} bg-white/5 text-cinema-text-dim/40 border-white/5 opacity-40`;
    }
    if (seat.status === 'held' && !isSelectedByMe) {
      return `${base} bg-amber-950/40 text-amber-500/60 border-amber-500/20 opacity-60`;
    }
    if (seat.type === 'vip') {
      return `${base} bg-purple-950/50 text-purple-200 border-purple-500/40 hover:border-purple-400 hover:scale-105 hover:bg-purple-900/60 shadow-sm`;
    }
    if (seat.type === 'sweetbox') {
      return `${base} bg-pink-950/50 text-pink-200 border-pink-500/40 hover:border-pink-400 hover:scale-105 hover:bg-pink-900/60 shadow-sm`;
    }
    // Standard seat
    return `${base} bg-cinema-surface-elevated text-cinema-text-muted border-white/10 hover:border-cinema-gold/40 hover:text-white hover:scale-105`;
  };

  return (
    <div className="w-full lg:w-[68%] rounded-2xl sm:rounded-3xl glass-card border border-white/10 p-4 sm:p-8 shadow-cinematic">
      {/* SCREEN WITH AMBIENT GLOW */}
      <div className="relative mb-8 sm:mb-12 text-center">
        {/* Glow arc */}
        <div className="mx-auto h-1.5 sm:h-2 w-3/4 rounded-full bg-cinema-gold/60 shadow-[0_0_30px_rgba(234,179,8,0.8)] filter blur-[1px]" />

        {/* Curved Screen Border */}
        <div className="mx-auto mt-2 h-8 sm:h-10 w-4/5 border-t-2 border-white/40 rounded-t-[100px] bg-gradient-to-b from-white/10 to-transparent" />

        <span className="inline-block -mt-5 sm:-mt-6 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-cinema-gold/80 bg-cinema-surface px-3 sm:px-4 py-1 rounded-full border border-white/5">
          Màn Hình Chiếu
        </span>
      </div>

      <p className="lg:hidden text-[11px] text-cinema-muted text-cinema-text-muted flex items-center justify-center gap-1.5 mb-3">
        <span>↔</span>
        <span>Vuốt ngang để chọn ghế trong toàn bộ khán phòng</span>
      </p>

      {/* SEATS GRID DYNAMIC BY ROW */}
      <div className="w-full overflow-x-auto scroll-smooth pb-4 sm:pb-6 custom-scrollbar touch-pan-x">
        <div className="flex flex-col gap-2 sm:gap-3 min-w-max items-center justify-center p-1 sm:p-2">
          {seatRows.map(({ rowLetter, seats }) => (
            <div key={rowLetter} className="flex items-center gap-2 sm:gap-3">
              {/* Left Row Indicator */}
              <span className="w-5 text-center text-xs font-black text-cinema-gold/70 select-none">
                {rowLetter}
              </span>

              {/* Seats in this Row */}
              <div className="flex items-center gap-2 sm:gap-3">
                {seats.map((seat) => {
                  const isDisabled =
                    seat.status === 'booked' ||
                    seat.status === 'broken' ||
                    seat.status === 'maintenance' ||
                    (seat.status === 'held' && !mySelectedSeatsSet.has(seat.id));
                  return (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      onClick={handleSeatClick}
                      disabled={isDisabled}
                      className={getSeatStyles(seat)}
                    />
                  );
                })}
              </div>

              {/* Right Row Indicator */}
              <span className="w-5 text-center text-xs font-black text-cinema-gold/70 select-none">
                {rowLetter}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SEAT LEGEND */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-cinema-text-muted font-medium">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-cinema-surface-elevated border border-white/10" />
          <span>Ghế Thường</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-purple-950/60 border border-purple-500/40" />
          <span>Ghế VIP (+20k)</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-5 sm:h-4 sm:w-6 rounded bg-pink-950/60 border border-pink-500/40" />
          <span>Ghế Đôi (+50k/ghế)</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-gold-gradient shadow-glow-gold-sm" />
          <span className="text-white font-bold">Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-amber-950/40 border border-amber-500/30" />
          <span>Đang có người giữ</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-white/5 border border-white/5 opacity-40" />
          <span>Đã bán</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-[8px] text-rose-400/70">
            ✕
          </span>
          <span>Bảo trì / Hỏng</span>
        </div>
      </div>
    </div>
  );
}