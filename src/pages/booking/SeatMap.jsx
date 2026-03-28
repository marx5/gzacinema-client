import React from 'react';

const SeatButton = React.memo(({ seat, onClick, disabled, className }) => (
    <button onClick={() => onClick(seat)} disabled={disabled} className={className} type="button">
        {seat.row_letter}{seat.seat_number}
    </button>
));
SeatButton.displayName = "SeatButton";

export default function SeatMap({ seatData, mySelectedSeatsSet, handleSeatClick }) {
    const getSeatClassName = (seat) => {
        const base = 'border border-transparent px-1 py-[9px] text-[12px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-80';

        const isSelectedByMe = mySelectedSeatsSet.has(seat.id);
        if (isSelectedByMe) return `${base} bg-[#1f8d52] border-white scale-[1.08]`;
        if (seat.status === 'booked') return `${base} bg-brand-error`;
        if (seat.status === 'held' && !isSelectedByMe) return `${base} bg-[#b2720a]`;
        if (seat.type === 'vip') return `${base} bg-[#5f45ad]`;
        if (seat.type === 'sweetbox') return `${base} bg-[#b65a10]`;
        return `${base} bg-[#64748b]`;
    };

    return (
        <div className="w-full lg:w-[65%] border border-brand-border bg-white p-4 md:p-6 shadow-sm">
            <h3 className="m-0 text-center font-display text-lg tracking-[0.08em] text-brand-500">MÀN HÌNH</h3>
            <div className="mx-auto mb-8 mt-3 h-[6px] w-[82%] bg-[#cfb596]"></div>

            <p className="mb-2 text-center text-[13px] italic text-brand-text-muted md:hidden">
                ↔ Vuốt ngang để xem toàn bộ sơ đồ ghế
            </p>
            <div className="w-full overflow-x-auto scroll-smooth pb-4 custom-scrollbar">
                <div className="grid min-w-[460px] grid-cols-10 gap-2">
                    {seatData.seats.map(seat => {
                        const isDisabled = seat.status === 'booked' || (seat.status === 'held' && !mySelectedSeatsSet.has(seat.id));
                        return (
                            <SeatButton
                                key={seat.id} seat={seat} onClick={handleSeatClick} disabled={isDisabled}
                                className={getSeatClassName(seat)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-brand-text min-[0px]:max-[420px]:justify-start">
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#64748b]"></span> Thường</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#5f45ad]"></span> VIP</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#b65a10]"></span> Đôi</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#1f8d52]"></span> Đang chọn</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-brand-error"></span> Đã bán</span>
            </div>
        </div>
    );
}