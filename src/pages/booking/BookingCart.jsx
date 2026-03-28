import { useMemo } from 'react';
import CountdownTimer from './CountdownTimer';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function BookingCart({
    showtimeId, seatData, mySelectedSeats,
    handleCheckout, processing, timerKey, handleTimeExpire
}) {
    const basePrice = parseFloat(seatData?.showtime_info?.base_price || 0);

    const { groupedCartItems, totalPrice } = useMemo(() => {
        if (!seatData) return { groupedCartItems: [], totalPrice: 0 };
        const items = [];
        const processedIds = new Set();
        const selectedSeatsSet = new Set(mySelectedSeats);
        const selectedDetails = seatData.seats.filter(s => selectedSeatsSet.has(s.id));

        selectedDetails.forEach(seat => {
            if (processedIds.has(seat.id)) return;

            if (seat.type === 'sweetbox') {
                const partnerNum = seat.seat_number % 2 !== 0 ? seat.seat_number + 1 : seat.seat_number - 1;
                const partnerSeat = selectedDetails.find(s => s.row_letter === seat.row_letter && s.seat_number === partnerNum);

                if (partnerSeat) {
                    items.push({
                        id: `${seat.id}-${partnerSeat.id}`,
                        label: `Sweetbox ${seat.row_letter}${Math.min(seat.seat_number, partnerSeat.seat_number)}-${seat.row_letter}${Math.max(seat.seat_number, partnerSeat.seat_number)}`,
                        price: (basePrice + 50000) * 2
                    });
                    processedIds.add(seat.id); processedIds.add(partnerSeat.id);
                    return;
                }
            }

            let price = basePrice;
            let typeLabel = 'Thường';
            if (seat.type === 'vip') { price += 20000; typeLabel = 'VIP'; }
            if (seat.type === 'sweetbox') { price += 50000; typeLabel = 'Sweetbox'; }

            items.push({ id: seat.id, label: `Ghế ${seat.row_letter}${seat.seat_number} (${typeLabel})`, price });
            processedIds.add(seat.id);
        });

        return { groupedCartItems: items, totalPrice: items.reduce((sum, item) => sum + item.price, 0) };
    }, [mySelectedSeats, seatData, basePrice]);

    return (
        <div className="h-fit w-full lg:sticky lg:top-[100px] lg:w-[35%] border border-brand-border border-t-4 border-t-brand-500 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-brand-border pb-3 sm:flex-col sm:items-start sm:gap-2">
                <h2 className="m-0 font-display text-[30px] text-brand-dark">Hóa Đơn</h2>
                {mySelectedSeats.length > 0 && (
                    <CountdownTimer key={timerKey} showtimeId={showtimeId} onExpire={handleTimeExpire} />
                )}
            </div>

            <p className="mb-3 text-sm text-brand-text"><strong className="text-brand-dark">Phòng:</strong> {seatData.showtime_info.room_name}</p>
            <p className="mb-3 text-sm text-brand-text"><strong className="text-brand-dark">Thời gian:</strong> {formatDateTime(seatData.showtime_info.start_time)}</p>

            <div className="min-h-[180px] border border-brand-border bg-brand-bg p-4">
                <h4 className="mb-3 mt-0 text-[#7b6446]">Giỏ hàng:</h4>
                {groupedCartItems.length === 0 ? (
                    <p className="mt-6 text-center text-[#8c7356]">Chưa có ghế nào.</p>
                ) : (
                    groupedCartItems.map(item => (
                        <div key={item.id} className="mb-2 flex justify-between gap-2 border-b border-dashed border-[#cfb596] pb-2">
                            <span className="text-xs font-bold text-[#1f8d52]">{item.label}</span>
                            <span className="text-sm text-[#3b2b19]">{formatCurrency(item.price)}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t-2 border-[#ddcbb6] pt-4">
                <span className="text-lg text-[#7b6446]">Tổng cộng:</span>
                <span className="text-[30px] font-extrabold text-brand-500">{formatCurrency(totalPrice)}</span>
            </div>

            <button
                onClick={handleCheckout}
                disabled={mySelectedSeats.length === 0 || processing}
                className="mt-5 min-h-[42px] w-full bg-brand-500 px-4 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {processing ? 'Đang xử lý...' : 'THANH TOÁN'}
            </button>
        </div>
    );
}