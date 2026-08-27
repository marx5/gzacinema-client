import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingApi } from '../api/bookingApi';
import { socket } from '../utils/socket';
import { useAuthStore } from '../store/useAuthStore';
import {
  validateSeatSelection,
  validateSeatDeselection,
  areSeatsConnected,
} from '../utils/seatValidator';

/**
 * Use Case Hook: Đóng gói toàn bộ logic đặt ghế, socket realtime, đếm ngược và thanh toán
 */
export const useBookingSeats = (showtimeId) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [mySelectedSeats, setMySelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [timerKey, setTimerKey] = useState(Date.now());

  // 1. Fetch seat status for current showtime
  const {
    data: seatData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['seats', showtimeId],
    queryFn: async () => (await bookingApi.getSeats(showtimeId)).data,
    enabled: Boolean(showtimeId),
  });

  // 2. Real-time Socket Synchronization
  useEffect(() => {
    if (!showtimeId) return;

    socket.connect();
    socket.emit('join_showtime', showtimeId);

    const handleSeatStatusChanged = (updatedSeat) => {
      queryClient.setQueryData(['seats', showtimeId], (oldData) => {
        if (!oldData || !Array.isArray(oldData.seats)) return oldData;
        const newSeats = oldData.seats.map((seat) => {
          if (seat.id === updatedSeat.id) {
            return { ...seat, status: updatedSeat.status };
          }
          return seat;
        });
        return { ...oldData, seats: newSeats };
      });
    };

    socket.on('seat_status_changed', handleSeatStatusChanged);

    return () => {
      socket.emit('leave_showtime', showtimeId);
      socket.off('seat_status_changed', handleSeatStatusChanged);
      socket.disconnect();
    };
  }, [showtimeId, queryClient, user?.id]);

  // 3. Restore Held Seats on Load
  useEffect(() => {
    if (seatData && Array.isArray(seatData.seats)) {
      const heldByMe = seatData.seats
        .filter((s) => s.status === 'held_by_me')
        .map((s) => s.id);

      if (heldByMe.length > 0 && !localStorage.getItem(`timer_${showtimeId}`)) {
        localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
      }
      setMySelectedSeats((prev) => Array.from(new Set([...prev, ...heldByMe])));
    }
  }, [seatData, showtimeId]);

  // 4. Timer Expiry Handler
  const handleTimeExpire = useCallback(() => {
    toast.error('Đã hết thời gian giữ ghế!');
    setMySelectedSeats([]);
    localStorage.removeItem(`timer_${showtimeId}`);
    refetch();
  }, [refetch, showtimeId]);

  // 5. Seat Click / Toggle Handler
  const handleSeatClick = useCallback(
    async (seat) => {
      if (
        seat.status === 'booked' ||
        (seat.status === 'held' && !mySelectedSeats.includes(seat.id))
      ) {
        toast.error('Ghế này đã có người chọn!');
        return;
      }

      let seatsToProcess = [seat];

      // Handle Sweetbox couple seat pair
      if (seat.type === 'sweetbox') {
        const partnerNumber =
          seat.seat_number % 2 !== 0 ? seat.seat_number + 1 : seat.seat_number - 1;
        const partnerSeat = seatData?.seats?.find(
          (s) => s.row_letter === seat.row_letter && s.seat_number === partnerNumber
        );

        if (!partnerSeat) {
          toast.error('Không tìm thấy nửa còn lại của cặp ghế Sweetbox!');
          return;
        }

        if (
          partnerSeat.status === 'booked' ||
          (partnerSeat.status === 'held' && !mySelectedSeats.includes(partnerSeat.id))
        ) {
          toast.error('Một nửa của cặp ghế này đã bị chọn mất!');
          return;
        }
        seatsToProcess.push(partnerSeat);
      }

      const isDeselecting =
        mySelectedSeats.includes(seat.id) || seat.status === 'held_by_me';
      const currentSelectedSeatObjects = (seatData?.seats || []).filter((s) =>
        mySelectedSeats.includes(s.id)
      );
      const seatIdsToProcess = seatsToProcess.map((s) => s.id);

      if (isDeselecting) {
        const remainingSeats = currentSelectedSeatObjects.filter(
          (s) => !seatIdsToProcess.includes(s.id)
        );
        const deselectValidation = validateSeatDeselection(remainingSeats);

        if (!deselectValidation.isValid) {
          toast.error(deselectValidation.error);
          return;
        }
      } else {
        const selectValidation = validateSeatSelection(
          currentSelectedSeatObjects,
          seatsToProcess
        );
        if (!selectValidation.isValid) {
          toast.error(selectValidation.error);
          return;
        }
      }

      try {
        if (isDeselecting) {
          const remainingSeats = mySelectedSeats.filter(
            (id) => !seatIdsToProcess.includes(id)
          );
          setMySelectedSeats(remainingSeats);

          if (remainingSeats.length === 0) {
            localStorage.removeItem(`timer_${showtimeId}`);
          }

          await bookingApi.unholdSeat({ showtimeId, seatIds: seatIdsToProcess });
        } else {
          await bookingApi.holdSeat({ showtimeId, seatIds: seatIdsToProcess });

          setMySelectedSeats((prev) =>
            Array.from(new Set([...prev, ...seatIdsToProcess]))
          );
          localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
          setTimerKey(Date.now());
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Lỗi mạng, không thể thao tác. Vui lòng thử lại!'
        );
        refetch();
      }
    },
    [seatData, mySelectedSeats, showtimeId, refetch]
  );

  // 6. Checkout Handler
  const handleCheckout = useCallback(async () => {
    if (mySelectedSeats.length === 0) return;

    const selectedObjects = (seatData?.seats || []).filter((s) =>
      mySelectedSeats.includes(s.id)
    );
    if (!areSeatsConnected(selectedObjects)) {
      toast.error('Các ghế được chọn phải liền kề nhau và không được cách ghế!');
      return;
    }

    setProcessing(true);
    try {
      const res = await bookingApi.createPayment({
        showtimeId,
        seatIds: mySelectedSeats,
      });

      localStorage.removeItem(`timer_${showtimeId}`);
      window.location.href = res.data.paymentUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khởi tạo thanh toán');
      setProcessing(false);
    }
  }, [mySelectedSeats, seatData, showtimeId]);

  const mySelectedSeatsSet = useMemo(
    () => new Set(mySelectedSeats),
    [mySelectedSeats]
  );

  return {
    seatData,
    isLoading,
    isError,
    error,
    refetch,
    mySelectedSeats,
    mySelectedSeatsSet,
    processing,
    timerKey,
    handleSeatClick,
    handleCheckout,
    handleTimeExpire,
  };
};
