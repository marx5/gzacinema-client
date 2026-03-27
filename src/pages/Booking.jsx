import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';
import toast from 'react-hot-toast';
import React from 'react';
import { socket } from '../utils/socket';
import { useAuthStore } from '../store/useAuthStore';


const SeatButton = React.memo(({ seat, onClick, disabled, className }) => {
    return (
        <button
            onClick={() => onClick(seat)}
            disabled={disabled}
            className={className}
            type="button"
        >
            {seat.row_letter}{seat.seat_number}
        </button>
    );
});
SeatButton.displayName = "SeatButton";


const CountdownTimer = ({ showtimeId, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedExpiry = localStorage.getItem(`timer_${showtimeId}`);
        if (savedExpiry) {
            const remaining = Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000);
            return remaining > 0 ? remaining : 0;
        }
        return 300;
    });

    const savedOnExpire = useRef(onExpire);
    useEffect(() => { savedOnExpire.current = onExpire; }, [onExpire]);

    useEffect(() => {
        if (timeLeft <= 0) {
            savedOnExpire.current();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    savedOnExpire.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`px-[10px] py-[6px] font-bold text-white ${timeLeft <= 60 ? 'bg-brand-error' : 'bg-[#1f8d52]'}`}>
            ⏱ {formatTime(timeLeft)}
        </div>
    );
};

export default function Booking() {
    const { showtimeId } = useParams();
    const queryClient = useQueryClient();

    const [mySelectedSeats, setMySelectedSeats] = useState([]);
    const [processing, setProcessing] = useState(false);

    const [timerKey, setTimerKey] = useState(Date.now());

    const { data: seatData, isLoading, refetch } = useQuery({
        queryKey: ['seats', showtimeId],
        queryFn: async () => {
            const res = await bookingApi.getSeats(showtimeId);
            return res.data;
        }
    });
    const { user } = useAuthStore();


    useEffect(() => {
        socket.connect();
        socket.emit('join_showtime', showtimeId);

        socket.on('seat_status_changed', (updatedSeat) => {
            queryClient.setQueryData(['seats', showtimeId], (oldData) => {
                if (!oldData) return oldData;

                const newSeats = oldData.seats.map(seat => {
                    if (seat.id === updatedSeat.id) {
                        let finalStatus = updatedSeat.status;
                        if (finalStatus === 'held' && updatedSeat.held_by === user?.id) {
                            finalStatus = 'held_by_me';
                        }
                        return { ...seat, status: updatedSeat.status };
                    }
                    return seat;
                });

                return { ...oldData, seats: newSeats };
            });
        });

        return () => {
            socket.emit('leave_showtime', showtimeId);
            socket.off('seat_status_changed');
            socket.disconnect();
        };
    }, [showtimeId, queryClient, user?.id]);

    useEffect(() => {
        if (seatData) {
            const heldByMe = seatData.seats
                .filter(s => s.status === 'held_by_me')
                .map(s => s.id);

            if (heldByMe.length > 0 && !localStorage.getItem(`timer_${showtimeId}`)) {
                localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
            }

            setMySelectedSeats(prev => Array.from(new Set([...prev, ...heldByMe])));
        }
    }, [seatData, showtimeId]);

    const handleTimeExpire = useCallback(() => {
        toast.error('Đã hết thời gian giữ ghế! Vui lòng chọn lại.');
        setMySelectedSeats([]);
        localStorage.removeItem(`timer_${showtimeId}`);
        refetch();
    }, [refetch, showtimeId]);

    const handleSeatClick = async (seat) => {
        if (seat.status === 'booked' || (seat.status === 'held' && !mySelectedSeats.includes(seat.id))) {
            toast.error('Ghế này đã có người chọn!');
            return;
        }

        let seatsToProcess = [seat];

        if (seat.type === 'sweetbox') {
            const partnerNumber = seat.seat_number % 2 !== 0 ? seat.seat_number + 1 : seat.seat_number - 1;
            const partnerSeat = seatData.seats.find(s => s.row_letter === seat.row_letter && s.seat_number === partnerNumber);

            if (partnerSeat) {
                if (partnerSeat.status === 'booked' || (partnerSeat.status === 'held' && !mySelectedSeats.includes(partnerSeat.id))) {
                    toast.error('Một nửa của cặp ghế này đã bị chọn mất!');
                    return;
                }
                seatsToProcess.push(partnerSeat);
            }
        }

        const isDeselecting = mySelectedSeats.includes(seat.id) || seat.status === 'held_by_me';

        try {
            if (isDeselecting) {
                const idsToRemove = seatsToProcess.map(s => s.id);
                const remainingSeats = mySelectedSeats.filter(id => !idsToRemove.includes(id));
                setMySelectedSeats(remainingSeats);

                if (remainingSeats.length === 0) {
                    localStorage.removeItem(`timer_${showtimeId}`);
                }

                await Promise.all(seatsToProcess.map(s => bookingApi.unholdSeat({ showtimeId, seatId: s.id })));
            } else {
                const newSeatIds = seatsToProcess.map(s => s.id);
                setMySelectedSeats(prev => [...prev, ...newSeatIds]);

                localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
                setTimerKey(Date.now());

                await Promise.all(seatsToProcess.map(s => bookingApi.holdSeat({ showtimeId, seatId: s.id })));
            }
        } catch (error) {
            toast.error('Lỗi mạng, không thể thao tác. Vui lòng thử lại!');
            refetch();
        }
    };

    const handleCheckout = async () => {
        if (mySelectedSeats.length === 0) return;
        setProcessing(true);
        try {
            const res = await bookingApi.createPayment({ showtimeId, seatIds: mySelectedSeats });

            localStorage.removeItem(`timer_${showtimeId}`);

            window.location.href = res.data.paymentUrl;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khởi tạo thanh toán');
            setProcessing(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

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
                    processedIds.add(seat.id);
                    processedIds.add(partnerSeat.id);
                    return;
                }
            }

            let price = basePrice;
            let typeLabel = 'Thường';
            if (seat.type === 'vip') { price += 20000; typeLabel = 'VIP'; }
            if (seat.type === 'sweetbox') { price += 50000; typeLabel = 'Sweetbox'; }

            items.push({
                id: seat.id,
                label: `Ghế ${seat.row_letter}${seat.seat_number} (${typeLabel})`,
                price: price
            });
            processedIds.add(seat.id);
        });

        const total = items.reduce((sum, item) => sum + item.price, 0);
        return { groupedCartItems: items, totalPrice: total };

    }, [mySelectedSeats, seatData, basePrice]);

    const mySelectedSeatsSet = useMemo(() => new Set(mySelectedSeats), [mySelectedSeats]);

    const getSeatClassName = (seat) => {
        const base = 'border border-transparent px-1 py-[9px] text-[12px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-80';

        const isSelectedByMe = mySelectedSeatsSet.has(seat.id);

        if (isSelectedByMe) {
            return `${base} bg-[#1f8d52] border-white scale-[1.08]`;
        }

        if (seat.status === 'booked') {
            return `${base} bg-brand-error`;
        }

        if (seat.status === 'held' && !isSelectedByMe) {
            return `${base} bg-[#b2720a]`;
        }

        if (seat.type === 'vip') {
            return `${base} bg-[#5f45ad]`;
        }

        if (seat.type === 'sweetbox') {
            return `${base} bg-[#b65a10]`;
        }

        return `${base} bg-[#64748b]`;
    };

    if (isLoading) return <div className="py-10 text-center text-brand-text">Đang tải rạp chiếu...</div>;
    if (!seatData) return <div className="py-10 text-center text-brand-text">Không tìm thấy rạp!</div>;

    return (
        <div className="mx-auto mt-6 flex w-full max-w-[1080px] flex-col gap-6 px-4 md:mt-8 lg:flex-row lg:items-start">
            {/* CỘT TRÁI: SƠ ĐỒ GHẾ */}
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
                            const className = getSeatClassName(seat);

                            return (
                                <SeatButton
                                    key={seat.id}
                                    seat={seat}
                                    onClick={handleSeatClick}
                                    disabled={isDisabled}
                                    className={className}
                                />
                            );
                        })}
                    </div>
                </div>
                {/* Chú thích màu sắc */}
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-brand-text min-[0px]:max-[420px]:justify-start min-[0px]:max-[420px]:gap-3">
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#64748b]"></span> Thường</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#5f45ad]"></span> VIP</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#b65a10]"></span> Đôi</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#1f8d52]"></span> Đang chọn</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-brand-error"></span> Đã bán</span>
                </div>
            </div>

            {/* CỘT PHẢI: HÓA ĐƠN */}
            <div className="h-fit w-full lg:sticky lg:top-[100px] lg:w-[35%] border border-brand-border border-t-4 border-t-brand-500 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-brand-border pb-3 sm:flex-col sm:items-start sm:gap-2">
                    <h2 className="m-0 font-display text-[30px] text-brand-dark">Hóa Đơn</h2>
                    {mySelectedSeats.length > 0 && (
                        <CountdownTimer
                            key={timerKey}
                            showtimeId={showtimeId}
                            onExpire={handleTimeExpire}
                        />
                    )}
                </div>

                <p className="mb-3 text-sm text-brand-text"><strong className="text-brand-dark">Phòng:</strong> {seatData.showtime_info.room_name}</p>
                <p className="mb-3 text-sm text-brand-text"><strong className="text-brand-dark">Thời gian:</strong> {new Date(seatData.showtime_info.start_time).toLocaleString('vi-VN')}</p>

                <div className="min-h-[180px] border border-brand-border bg-brand-bg p-4">
                    <h4 className="mb-3 mt-0 text-[#7b6446]">Giỏ hàng:</h4>
                    {groupedCartItems.length === 0 ? (
                        <p className="mt-6 text-center text-[#8c7356]">Chưa có ghế nào.</p>
                    ) : (
                        groupedCartItems.map(item => (
                            <div key={item.id} className="mb-2 flex justify-between gap-2 border-b border-dashed border-[#cfb596] pb-2">
                                <span className="text-xs font-bold text-[#1f8d52]">{item.label}</span>
                                <span className="text-sm text-[#3b2b19]">{item.price.toLocaleString()} đ</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t-2 border-[#ddcbb6] pt-4">
                    <span className="text-lg text-[#7b6446]">Tổng cộng:</span>
                    <span className="text-[30px] font-extrabold text-brand-500 min-[0px]:max-[420px]:text-[22px]">{totalPrice.toLocaleString()} đ</span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={mySelectedSeats.length === 0 || processing}
                    className="mt-5 min-h-[42px] w-full bg-brand-500 px-4 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                >
                    {processing ? 'Đang xử lý...' : 'THANH TOÁN'}
                </button>
            </div>
        </div>
    );
}