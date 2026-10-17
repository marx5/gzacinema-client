import { useState, useMemo } from 'react';
import { useUserBookings } from '@/hooks';
import { Breadcrumb } from '@/components/layouts';
import { Badge, Button } from '@/components/core';
import { BookingHistoryCard, HistoryEmptyState } from '@/components/modules/history';
import {
  Ticket,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Layers,
} from 'lucide-react';

const PAGE_LIMIT = 10;

export default function History() {
  const [page, setPage] = useState(1);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'past'

  const { bookings, pagination, isLoading, isError, refetch } = useUserBookings({
    page,
    limit: PAGE_LIMIT,
  });

  const filteredBookings = useMemo(() => {
    const now = new Date();
    if (filterTab === 'upcoming') {
      return bookings.filter((b) => b.startTime && new Date(b.startTime) >= now);
    }
    if (filterTab === 'past') {
      return bookings.filter((b) => !b.startTime || new Date(b.startTime) < now);
    }
    return bookings;
  }, [bookings, filterTab]);

  // Nếu API trả về toàn bộ danh sách chưa phân trang thì cắt trang tại client
  const isClientPaginated = filteredBookings.length > PAGE_LIMIT;
  const displayedBookings = useMemo(() => {
    if (!isClientPaginated) return filteredBookings;
    const start = (page - 1) * PAGE_LIMIT;
    return filteredBookings.slice(start, start + PAGE_LIMIT);
  }, [filteredBookings, isClientPaginated, page]);

  const totalPages = isClientPaginated
    ? Math.max(1, Math.ceil(filteredBookings.length / PAGE_LIMIT))
    : Math.max(1, pagination?.totalPages || 1);

  const totalCount = pagination?.totalItems || bookings.length;

  const handleFilterChange = (nextTab) => {
    setFilterTab(nextTab);
    setPage(1);
  };

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
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
      <Breadcrumb items={[{ label: 'Vé của tôi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-cinema-gold" />
          Vé Của Tôi
        </h1>
        <Badge variant="glass" size="md">
          Tổng cộng: {totalCount} đơn hàng
        </Badge>
      </div>

      {/* Filter Tabs */}
      {bookings.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
              filterTab === 'all'
                ? 'bg-cinema-gold text-cinema-bg border-cinema-gold shadow-glow-gold-sm'
                : 'bg-cinema-surface/80 text-cinema-text-muted border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('upcoming')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
              filterTab === 'upcoming'
                ? 'bg-cinema-gold text-cinema-bg border-cinema-gold shadow-glow-gold-sm'
                : 'bg-cinema-surface/80 text-cinema-text-muted border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sắp chiếu</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('past')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
              filterTab === 'past'
                ? 'bg-cinema-gold text-cinema-bg border-cinema-gold shadow-glow-gold-sm'
                : 'bg-cinema-surface/80 text-cinema-text-muted border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã qua</span>
          </button>
        </div>
      )}

      {bookings.length === 0 ? (
        <HistoryEmptyState />
      ) : displayedBookings.length === 0 ? (
        <div className="rounded-2xl glass-card border border-white/10 p-10 text-center space-y-3">
          <Ticket className="w-10 h-10 text-cinema-text-dim mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            Không có vé nào trong mục này
          </h3>
          <p className="text-xs sm:text-sm text-cinema-text-muted">
            Hãy chuyển sang tab &ldquo;Tất cả&rdquo; để xem toàn bộ lịch sử đặt vé của bạn.
          </p>
          <div className="pt-1">
            <Button variant="secondary" size="sm" onClick={() => handleFilterChange('all')}>
              Xem tất cả vé
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {displayedBookings.map((booking) => (
            <BookingHistoryCard key={booking.id} booking={booking} />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
              <span className="text-xs sm:text-sm text-cinema-text-muted">
                Trang <strong className="text-white">{page}</strong> / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Trước
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

