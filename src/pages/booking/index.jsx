import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../../api/bookingApi';
import toast from 'react-hot-toast';
import { socket } from '../../utils/socket';
import { useAuthStore } from '../../store/useAuthStore';

import SeatMap from './SeatMap';
import BookingCart from './BookingCart';
import Breadcrumb from '../../components/Breadcrumb'; // <-- Bổ sung import

export default function Booking() {
    const { showtimeId } = useParams();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const [mySelectedSeats, setMySelectedSeats] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [timerKey, setTimerKey] = useState(Date.now());

    const { data: seatData, isLoading, refetch } = useQuery({
        queryKey: ['seats', showtimeId],
        queryFn: async () => (await bookingApi.getSeats(showtimeId)).data
    });

    useEffect(() => {
        socket.connect();
        socket.emit('join_showtime', showtimeId);

        socket.on('seat_status_changed', (updatedSeat) => {
            queryClient.setQueryData(['seats', showtimeId], (oldData) => {
                if (!oldData) return oldData;
                const newSeats = oldData.seats.map(seat => {
                    if (seat.id === updatedSeat.id) {
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
            const heldByMe = seatData.seats.filter(s => s.status === 'held_by_me').map(s => s.id);
            if (heldByMe.length > 0 && !localStorage.getItem(`timer_${showtimeId}`)) {
                localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
            }
            setMySelectedSeats(prev => Array.from(new Set([...prev, ...heldByMe])));
        }
    }, [seatData, showtimeId]);

    const handleTimeExpire = useCallback(() => {
        toast.error('Đã hết thời gian giữ ghế!');
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

    const mySelectedSeatsSet = useMemo(() => new Set(mySelectedSeats), [mySelectedSeats]);

    if (isLoading) return <div className="py-10 text-center text-brand-text">Đang tải rạp chiếu...</div>;
    if (!seatData) return <div className="py-10 text-center text-brand-text">Không tìm thấy rạp!</div>;

    return (
        <div className="mx-auto mt-6 w-full max-w-[1080px] px-4 md:mt-8">
            <Breadcrumb items={[
                { label: 'Chi tiết phim', link: `/movie/${seatData?.showtime_info?.movie_id}` },
                { label: 'Chọn ghế & Thanh toán' }
            ]} />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start mt-2">
                <SeatMap
                    seatData={seatData}
                    mySelectedSeatsSet={mySelectedSeatsSet}
                    handleSeatClick={handleSeatClick}
                />

                <BookingCart
                    showtimeId={showtimeId}
                    seatData={seatData}
                    mySelectedSeats={mySelectedSeats}
                    handleCheckout={handleCheckout}
                    processing={processing}
                    timerKey={timerKey}
                    handleTimeExpire={handleTimeExpire}
                />
            </div>
        </div>
    );
}