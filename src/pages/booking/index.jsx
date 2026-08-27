import { useParams } from 'react-router-dom';
import { useBookingSeats } from '../../hooks';
import { SeatMap, BookingCart } from '../../components/modules/booking';
import { Breadcrumb } from '../../components/layouts';
import { Badge, Button } from '../../components/core';
import { Film, Clock, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function Booking() {
  const { showtimeId } = useParams();
  const {
    seatData,
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Chi tiết phim', link: `/movie/${seatData?.showtime_info?.movie_id}` },
          { label: 'Chọn ghế & Thanh toán' },
        ]}
      />

      {/* SHOWTIME HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl glass-card border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">
              Đang Chọn Ghế
            </Badge>
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