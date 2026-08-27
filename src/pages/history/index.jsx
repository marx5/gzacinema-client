import { useUserBookings } from '../../hooks';
import { Breadcrumb } from '../../components/layouts';
import { Badge, Button } from '../../components/core';
import { BookingHistoryCard, HistoryEmptyState } from '../../components/modules/history';
import { Ticket, AlertTriangle, RefreshCw } from 'lucide-react';

export default function History() {
  const { bookings, isLoading, isError, refetch } = useUserBookings();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-20 flex flex-col items-center justify-center gap-4 text-cinema-text-muted animate-pulse">
        <Ticket className="w-12 h-12 text-cinema-gold animate-bounce" />
        <p className="text-base font-semibold">Đang tải danh sách vé...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-cinema-rose mx-auto" />
        <h3 className="text-lg font-bold text-white">Không thể tải lịch sử vé</h3>
        <p className="text-sm text-cinema-text-muted">
          Đã có lỗi xảy ra trong quá trình kết nối máy chủ. Vui lòng thử lại!
        </p>
        <Button variant="secondary" size="md" onClick={() => refetch()} className="gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Vé của tôi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-cinema-gold" />
          Vé Của Tôi
        </h1>
        <Badge variant="glass" size="md">
          Tổng cộng: {bookings.length} đơn hàng
        </Badge>
      </div>

      {bookings.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <div className="space-y-8">
          {bookings.map((booking) => (
            <BookingHistoryCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

