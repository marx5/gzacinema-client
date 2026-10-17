import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingApi } from '@/api/bookingApi';
import { socket } from '@/utils/socket';
import { useAuthStore } from '@/store/useAuthStore';
import {
  validateSeatSelection,
  areSeatsConnected,
} from '@/utils/seatValidator';

const isSafePaymentUrl = (urlStr) => {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Use Case Hook: Đóng gói toàn bộ logic đặt ghế, socket realtime, đếm ngược,
 * tự động giải phóng ghế khi rời trang/đóng tab và thanh toán.
 */
export const useBookingSeats = (showtimeId) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [mySelectedSeats, setMySelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [timerKey, setTimerKey] = useState(Date.now());

  const mySelectedSeatsRef = useRef(mySelectedSeats);
  mySelectedSeatsRef.current = mySelectedSeats;

  // Khóa theo từng ghế (per-seat lock) thay vì khóa toàn bộ bàn phím/chuột
  const inFlightSeatsRef = useRef(new Set());
  // Đánh dấu khi người dùng đang chuyển sang cổng thanh toán VNPay (không tự nhả ghế khi unmount)
  const isCheckingOutRef = useRef(false);

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

  const seatDataRef = useRef(seatData);
  seatDataRef.current = seatData;

  // 2. Real-time Socket Synchronization & Auto-Release on Leave
  useEffect(() => {
    if (!showtimeId) return;

    const joinRoom = () => {
      socket.emit('join_showtime', {
        showtimeId,
        userId: user?.id || null,
      });
    };

    socket.connect();
    joinRoom();

    const handleSeatStatusChanged = (updatedSeat) => {
      if (!updatedSeat?.id) return;

      const isMine = mySelectedSeatsRef.current.includes(updatedSeat.id);

      if (
        updatedSeat.status === 'available' ||
        updatedSeat.status === 'booked'
      ) {
        if (isMine) {
          setMySelectedSeats((prev) =>
            prev.filter((id) => id !== updatedSeat.id)
          );
        }
      }

      queryClient.setQueryData(['seats', showtimeId], (oldData) => {
        if (!oldData || !Array.isArray(oldData.seats)) return oldData;
        const newSeats = oldData.seats.map((seat) => {
          if (seat.id === updatedSeat.id) {
            const nextStatus =
              updatedSeat.status === 'held' && isMine
                ? 'held_by_me'
                : updatedSeat.status;
            return { ...seat, status: nextStatus };
          }
          return seat;
        });
        return { ...oldData, seats: newSeats };
      });
    };

    socket.on('connect', joinRoom);
    socket.on('seat_status_changed', handleSeatStatusChanged);

    return () => {
      const checkingOut = isCheckingOutRef.current;

      socket.emit('leave_showtime', {
        showtimeId,
        userId: user?.id || null,
        isCheckingOut: checkingOut,
      });

      if (!checkingOut && mySelectedSeatsRef.current.length > 0) {
        localStorage.removeItem(`timer_${showtimeId}`);
        bookingApi.unholdAllSeats({ showtimeId }).catch(() => {});
      }

      socket.off('connect', joinRoom);
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
      if (heldByMe.length > 0) {
        setMySelectedSeats((prev) =>
          Array.from(new Set([...prev, ...heldByMe]))
        );
      }
    }
  }, [seatData, showtimeId]);

  // 4. Timer Expiry Handler
  const handleTimeExpire = useCallback(() => {
    toast.error('Đã hết thời gian giữ ghế!');
    setMySelectedSeats([]);
    localStorage.removeItem(`timer_${showtimeId}`);
    bookingApi.unholdAllSeats({ showtimeId }).catch(() => {});
    refetch();
  }, [refetch, showtimeId]);

  // 5. Seat Click / Toggle Handler
  const handleSeatClick = useCallback(
    async (seat) => {
      if (!seat?.id || inFlightSeatsRef.current.has(seat.id)) return;

      const currentSelectedIds = mySelectedSeatsRef.current;
      const currentSeatData = seatDataRef.current;

      if (
        seat.status === 'booked' ||
        seat.status === 'broken' ||
        seat.status === 'maintenance' ||
        (seat.status === 'held' && !currentSelectedIds.includes(seat.id))
      ) {
        toast.error('Ghế này hiện không khả dụng hoặc đã có người chọn!');
        return;
      }

      let seatsToProcess = [seat];

      // Handle Sweetbox couple seat pair
      if (seat.type === 'sweetbox') {
        const partnerNumber =
          seat.seat_number % 2 !== 0
            ? seat.seat_number + 1
            : seat.seat_number - 1;
        const partnerSeat = currentSeatData?.seats?.find(
          (s) =>
            s.row_letter === seat.row_letter && s.seat_number === partnerNumber
        );

        if (!partnerSeat) {
          toast.error('Không tìm thấy nửa còn lại của cặp ghế Sweetbox!');
          return;
        }

        if (
          partnerSeat.status === 'booked' ||
          partnerSeat.status === 'broken' ||
          partnerSeat.status === 'maintenance' ||
          (partnerSeat.status === 'held' &&
            !currentSelectedIds.includes(partnerSeat.id))
        ) {
          toast.error('Một nửa của cặp ghế này hiện không khả dụng!');
          return;
        }
        seatsToProcess.push(partnerSeat);
      }

      const isDeselecting =
        currentSelectedIds.includes(seat.id) || seat.status === 'held_by_me';
      const currentSelectedSeatObjects = (currentSeatData?.seats || []).filter(
        (s) => currentSelectedIds.includes(s.id)
      );
      const seatIdsToProcess = seatsToProcess.map((s) => s.id);

      if (!isDeselecting) {
        const selectValidation = validateSeatSelection(
          currentSelectedSeatObjects,
          seatsToProcess
        );
        if (!selectValidation.isValid) {
          toast.error(selectValidation.error);
          return;
        }
      }

      seatIdsToProcess.forEach((id) => inFlightSeatsRef.current.add(id));
      try {
        if (isDeselecting) {
          const remainingSeats = mySelectedSeatsRef.current.filter(
            (id) => !seatIdsToProcess.includes(id)
          );
          mySelectedSeatsRef.current = remainingSeats;
          setMySelectedSeats(remainingSeats);

          queryClient.setQueryData(['seats', showtimeId], (oldData) => {
            if (!oldData || !Array.isArray(oldData.seats)) return oldData;
            return {
              ...oldData,
              seats: oldData.seats.map((s) =>
                seatIdsToProcess.includes(s.id)
                  ? { ...s, status: 'available' }
                  : s
              ),
            };
          });

          if (remainingSeats.length === 0) {
            localStorage.removeItem(`timer_${showtimeId}`);
          }

          await bookingApi.unholdSeat({
            showtimeId,
            seatIds: seatIdsToProcess,
          });
        } else {
          // Optimistically mark held_by_me for instant UI feedback
          const nextSelected = Array.from(
            new Set([...mySelectedSeatsRef.current, ...seatIdsToProcess])
          );
          mySelectedSeatsRef.current = nextSelected;
          setMySelectedSeats(nextSelected);

          queryClient.setQueryData(['seats', showtimeId], (oldData) => {
            if (!oldData || !Array.isArray(oldData.seats)) return oldData;
            return {
              ...oldData,
              seats: oldData.seats.map((s) =>
                seatIdsToProcess.includes(s.id)
                  ? { ...s, status: 'held_by_me' }
                  : s
              ),
            };
          });

          await bookingApi.holdSeat({ showtimeId, seatIds: seatIdsToProcess });

          localStorage.setItem(`timer_${showtimeId}`, Date.now() + 300000);
          setTimerKey(Date.now());
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            'Không thể giữ ghế này. Vui lòng kiểm tra lại!'
        );
        refetch();
      } finally {
        seatIdsToProcess.forEach((id) => inFlightSeatsRef.current.delete(id));
      }
    },
    [showtimeId, refetch, queryClient]
  );

  // 6. Checkout Handler
  const handleCheckout = useCallback(async () => {
    if (mySelectedSeats.length === 0) return;

    const selectedObjects = (seatData?.seats || []).filter((s) =>
      mySelectedSeats.includes(s.id)
    );
    if (!areSeatsConnected(selectedObjects)) {
      toast.error(
        'Các ghế được chọn phải liền kề nhau trên cùng một hàng và không được để trống ghế ở giữa!'
      );
      return;
    }

    setProcessing(true);
    try {
      const res = await bookingApi.createPayment({
        showtimeId,
        seatIds: mySelectedSeats,
      });

      const paymentUrl = res?.data?.paymentUrl;
      if (!isSafePaymentUrl(paymentUrl)) {
        throw new Error('Đường dẫn thanh toán không hợp lệ');
      }

      isCheckingOutRef.current = true;
      localStorage.removeItem(`timer_${showtimeId}`);
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Lỗi khởi tạo thanh toán'
      );
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
