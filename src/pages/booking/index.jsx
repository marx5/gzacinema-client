import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../../api/bookingApi';
import toast from 'react-hot-toast';
import { socket } from '../../utils/socket';
import { useAuthStore } from '../../store/useAuthStore';

import { SeatMap, BookingCart } from '../../components/modules/booking';
import { Breadcrumb } from '../../components/layouts';
import { Badge } from '../../components/core';
import { Film, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

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
        const newSeats = oldData.seats.map((seat) => {
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
      const heldByMe = seatData.seats.filter((s) => s.status === 'held_by_me').map((s) => s.id);
      if (heldByMe.length > 0 && !localStorage.getItem(`timer_${showtimeId}`)) {
        localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
      }
      setMySelectedSeats((prev) => Array.from(new Set([...prev, ...heldByMe])));
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
      const partnerSeat = seatData.seats.find(
        (s) => s.row_letter === seat.row_letter && s.seat_number === partnerNumber
      );

      if (partnerSeat) {
        if (
          partnerSeat.status === 'booked' ||
          (partnerSeat.status === 'held' && !mySelectedSeats.includes(partnerSeat.id))
        ) {
          toast.error('Một nửa của cặp ghế này đã bị chọn mất!');
          return;
        }
        seatsToProcess.push(partnerSeat);
      }
    }

    const isDeselecting = mySelectedSeats.includes(seat.id) || seat.status === 'held_by_me';

    try {
      if (isDeselecting) {
        const idsToRemove = seatsToProcess.map((s) => s.id);
        const remainingSeats = mySelectedSeats.filter((id) => !idsToRemove.includes(id));
        setMySelectedSeats(remainingSeats);

        if (remainingSeats.length === 0) {
          localStorage.removeItem(`timer_${showtimeId}`);
        }

        await Promise.all(seatsToProcess.map((s) => bookingApi.unholdSeat({ showtimeId, seatId: s.id })));
      } else {
        const newSeatIds = seatsToProcess.map((s) => s.id);
        setMySelectedSeats((prev) => [...prev, ...newSeatIds]);

        localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
        setTimerKey(Date.now());

        await Promise.all(seatsToProcess.map((s) => bookingApi.holdSeat({ showtimeId, seatId: s.id })));
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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4 text-cinema-text-muted animate-pulse">
        <Film className="w-12 h-12 text-cinema-gold animate-bounce" />
        <p className="text-base font-semibold">Đang chuẩn bị sơ đồ phòng chiếu...</p>
      </div>
    );
  }

  if (!seatData) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-rose-400">Không tìm thấy thông tin phòng chiếu!</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Chi tiết phim', link: `/movie/${seatData?.showtime_info?.movie_id}` },
          { label: 'Chọn ghế & Thanh toán' }
        ]}
      />

      {/* SHOWTIME HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl glass-card border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">Đang Chọn Ghế</Badge>
            <span className="text-xs text-cinema-text-dim">Mã suất: #{showtimeId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {seatData?.showtime_info?.movie_title || 'Suất Chiếu Phim'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-cinema-text-muted font-medium">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Clock className="w-4 h-4 text-cinema-gold" />
            <span>{formatDateTime(seatData?.showtime_info?.start_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <MapPin className="w-4 h-4 text-cinema-gold" />
            <span>{seatData?.showtime_info?.room_name}</span>
          </div>
        </div>
      </div>

      {/* SEAT MAP & CART LAYOUT */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
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