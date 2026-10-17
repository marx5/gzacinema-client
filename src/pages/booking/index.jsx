import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingSeats } from '@/hooks';
import { SeatMap, BookingCart } from '@/components/modules/booking';
import { Breadcrumb } from '@/components/layouts';
import { Badge, Button } from '@/components/core';
import {
  Film,
  Clock,
  MapPin,
  Building2,
  ArrowLeft,
  CreditCard,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { formatDateTime, formatCurrency, formatDuration } from '@/utils/formatters';
import { calculateSeatPrice, mapShowtimeSeatsDtoToEntity } from '@/models/booking.model';

export default function Booking() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const {
    seatData: rawSeatData,
    isLoading,
    isError,
    refetch,
    mySelectedSeats,
    mySelectedSeatsSet,
    processing,
    timerKey,
    handleSeatClick,
    handleCheckout,
    handleTimeExpire,
  } = useBookingSeats(showtimeId);

  const seatData = useMemo(() => mapShowtimeSeatsDtoToEntity(rawSeatData), [rawSeatData]);
  const isProcessing = processing;

  const { selectedSeatLabels, totalPrice } = useMemo(() => {
    if (!seatData?.seats || mySelectedSeats.length === 0) {
      return { selectedSeatLabels: '', totalPrice: 0 };
    }
    const basePrice = Number(seatData?.showtime_info?.base_price || 0);
    const selectedObjects = seatData.seats
      .filter((s) => mySelectedSeatsSet.has(s.id))
      .sort((a, b) => {
        const rowCmp = String(a.row_letter || '').localeCompare(String(b.row_letter || ''));
        if (rowCmp !== 0) return rowCmp;
        return (a.seat_number || 0) - (b.seat_number || 0);
      });

    const labels = selectedObjects.map((s) => `${s.row_letter}${s.seat_number}`).join(', ');
    const total = selectedObjects.reduce(
      (sum, s) => sum + calculateSeatPrice(basePrice, s.type),
      0
    );

    return { selectedSeatLabels: labels, totalPrice: total };
  }, [seatData, mySelectedSeats, mySelectedSeatsSet]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 flex flex-col items-center justify-center gap-4 text-cinema-text-muted animate-pulse">
        <Film className="w-12 h-12 text-cinema-gold animate-bounce" />
        <p className="text-base font-semibold">Đang chuẩn bị sơ đồ phòng chiếu...</p>
      </div>
    );
  }

  if (isError || !seatData) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-cinema-rose mx-auto" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin phòng chiếu!</h2>
        <p className="text-sm text-cinema-text-muted">
          Suất chiếu có thể không tồn tại hoặc đã kết thúc.
        </p>
        <Button variant="secondary" size="md" onClick={() => refetch()} className="gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  const showtimeInfo = seatData?.showtime_info || {};
  const backTarget = showtimeInfo?.movie_id ? `/movie/${showtimeInfo.movie_id}` : -1;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-36 lg:pb-24 space-y-6">
      <Breadcrumb
        items={[
          {
            label: showtimeInfo?.movie_title || 'Chi tiết phim',
            link: showtimeInfo?.movie_id ? `/movie/${showtimeInfo.movie_id}` : '/',
          },
          { label: 'Chọn ghế & Thanh toán' },
        ]}
      />

      {/* SHOWTIME HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl glass-card border border-white/10">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate(backTarget)}
            className="mt-0.5 sm:mt-0 inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cinema-text-muted hover:text-cinema-gold hover:border-cinema-gold/40 transition cursor-pointer"
            title="Quay lại chi tiết phim"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showtimeInfo?.poster_url && (
            <img
              src={showtimeInfo.poster_url}
              alt={showtimeInfo?.movie_title || 'Poster phim'}
              className="hidden sm:block w-12 h-16 rounded-lg object-cover border border-white/10 shrink-0 shadow-md"
            />
          )}

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold" size="sm">
                Đang Chọn Ghế
              </Badge>
              {showtimeInfo?.duration_minutes && (
                <span className="text-xs text-cinema-text-dim font-medium">
                  • {formatDuration(showtimeInfo.duration_minutes)}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white leading-tight break-words">
              {seatData?.showtime_info?.movie_title || 'Chọn Ghế Suất Chiếu'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-cinema-text-muted font-medium">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Building2 className="w-4 h-4 text-cinema-gold shrink-0" />
            <span className="text-white font-semibold">
              {showtimeInfo?.cinema_name || 'GzaCinema'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <MapPin className="w-4 h-4 text-cinema-gold shrink-0" />
            <span className="text-white font-semibold">
              {showtimeInfo?.room_name || 'Phòng chiếu'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-cinema-gold/10 px-3 py-1.5 rounded-xl border border-cinema-gold/30 text-cinema-gold font-bold">
            <Clock className="w-4 h-4 text-cinema-gold shrink-0" />
            <span>{formatDateTime(showtimeInfo?.start_time)}</span>
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
          showtimeInfo={showtimeInfo}
          mySelectedSeats={mySelectedSeats}
          handleCheckout={handleCheckout}
          processing={processing}
          timerKey={timerKey}
          handleTimeExpire={handleTimeExpire}
        />
      </div>

      {/* MOBILE STICKY BOTTOM CHECKOUT BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cinema-surface/95 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-cinema-text-muted truncate">
              <span className="text-cinema-text-dim shrink-0">
                Ghế ({mySelectedSeats.length}):
              </span>
              <strong className="text-white font-bold truncate">
                {selectedSeatLabels || 'Chưa chọn'}
              </strong>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[11px] text-cinema-text-dim">Tổng:</span>
              <span className="text-base sm:text-lg font-black text-cinema-gold tabular-nums">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleCheckout}
            disabled={mySelectedSeats.length === 0 || isProcessing}
            isLoading={isProcessing}
            leftIcon={<CreditCard className="w-4 h-4" />}
            className="shrink-0 min-h-[44px] px-4 sm:px-6 font-bold shadow-glow-gold"
          >
            Thanh Toán
          </Button>
        </div>
      </div>
    </div>
  );
}