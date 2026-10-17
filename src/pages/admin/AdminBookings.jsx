import { useState, useMemo, useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingApi } from '@/api/bookingApi';
import { systemApi } from '@/api/systemApi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Ticket,
  Film,
  User,
  Search,
  X,
  Eye,
  Copy,
  RefreshCw,
  CheckCircle2,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { DataTable, Modal, Button } from '@/components/core';
import BookingDetailModal, {
  BookingStatusBadge,
} from './components/BookingDetailModal';

const STATUS_TABS = [
  { value: '', label: 'Tất cả đơn' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { booking, nextStatus: 'paid' | 'cancelled' }

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter],
    queryFn: async () => {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await bookingApi.getAllAdmin(params);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const checkInMutation = useMutation({
    mutationFn: (ticketId) => systemApi.checkInTicket(ticketId),
    onSuccess: (_, ticketId) => {
      toast.success('Đã xác nhận Check-in vé thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setSelectedBooking((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tickets: (prev.tickets || []).map((t) =>
            t.id === ticketId ? { ...t, status: 'used' } : t
          ),
        };
      });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Không thể check-in vé này'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingApi.updateStatusAdmin(id, status),
    onSuccess: (res, variables) => {
      toast.success(
        res?.message ||
          (variables.status === 'paid'
            ? 'Đã duyệt thanh toán đơn hàng thành công!'
            : 'Đã hủy đơn hàng và giải phóng ghế!')
      );
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['seats'] });
      setConfirmAction(null);
      setSelectedBooking((prev) => {
        if (!prev || prev.id !== variables.id) return prev;
        const nextTicketStatus =
          variables.status === 'paid' ? 'valid' : 'refunded';
        return {
          ...prev,
          status: variables.status,
          tickets: (prev.tickets || []).map((t) => ({
            ...t,
            status:
              variables.status === 'paid' && t.status === 'used'
                ? 'used'
                : nextTicketStatus,
          })),
        };
      });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.friendlyMessage ||
          'Cập nhật trạng thái đơn thất bại'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setConfirmAction(null);
    },
  });

  const handleRequestStatusChange = useCallback((booking, nextStatus) => {
    setConfirmAction({ booking, nextStatus });
  }, []);

  const { bookings = [], total_pages = 1, total_items = 0 } = data || {};

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const idStr = (b.id || '').toLowerCase();
      const userName = (b.user?.full_name || '').toLowerCase();
      const userEmail = (b.user?.email || '').toLowerCase();
      const userPhone = (
        b.user?.phone_number ||
        b.user?.phone ||
        ''
      ).toLowerCase();
      const movieTitle = (b.showtime?.movie?.title || '').toLowerCase();
      return (
        idStr.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q) ||
        userPhone.includes(q) ||
        movieTitle.includes(q)
      );
    });
  }, [bookings, searchQuery]);

  const pageSummary = useMemo(() => {
    let paidCount = 0;
    let pendingCount = 0;
    let paidAmount = 0;
    filteredBookings.forEach((b) => {
      if (b.status === 'paid') {
        paidCount += 1;
        paidAmount += Number(b.total_amount || 0);
      } else if (b.status === 'pending') {
        pendingCount += 1;
      }
    });
    return { paidCount, pendingCount, paidAmount };
  }, [filteredBookings]);

  const copyText = (text, label = 'mã') => {
    navigator.clipboard?.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Mã đơn',
        dataIndex: 'id',
        width: '125px',
        render: (id, record) => (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-cinema-gold uppercase">
                #{id?.split('-')[0]}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyText(id, 'mã đơn');
                }}
                title="Sao chép mã đơn đầy đủ"
                className="text-cinema-text-dim hover:text-white cursor-pointer"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            {record.createdAt && (
              <div className="text-[11px] text-cinema-text-dim tabular-nums mt-0.5">
                {new Date(record.createdAt).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Khách hàng',
        dataIndex: 'user',
        render: (user) => (
          <div className="min-w-[160px]">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
              <span className="truncate">
                {user?.full_name || 'Khách vãng lai'}
              </span>
            </div>
            <div className="text-[11px] text-cinema-text-dim mt-0.5 truncate">
              {user?.email || user?.phone_number || 'Chưa cập nhật liên hệ'}
            </div>
          </div>
        ),
      },
      {
        title: 'Phim & Suất chiếu',
        dataIndex: 'showtime',
        render: (showtime) => (
          <div className="min-w-[200px]">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
              <span className="line-clamp-1">
                {showtime?.movie?.title || '—'}
              </span>
            </div>
            <div className="text-[11px] text-cinema-text-dim mt-0.5 flex items-center gap-1.5 tabular-nums">
              <span className="font-semibold text-cinema-text-muted">
                {showtime?.room?.name}
              </span>
              <span>•</span>
              <span>{formatDateTime(showtime?.start_time)}</span>
            </div>
          </div>
        ),
      },
      {
        title: 'Số vé',
        dataIndex: 'tickets',
        width: '90px',
        align: 'center',
        render: (tickets) => (
          <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-bold text-white tabular-nums">
            {tickets?.length || 0} vé
          </span>
        ),
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'total_amount',
        width: '130px',
        align: 'right',
        render: (amount) => (
          <span className="font-bold text-cinema-gold tabular-nums">
            {formatCurrency(amount)}
          </span>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        width: '145px',
        align: 'center',
        render: (status) => <BookingStatusBadge status={status} />,
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: '215px',
        align: 'right',
        render: (_, record) => (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {record.status === 'pending' && (
              <button
                type="button"
                onClick={() => handleRequestStatusChange(record, 'paid')}
                title="Duyệt thanh toán thủ công"
                className="inline-flex h-7 items-center gap-1 px-2 rounded border border-emerald-500/40 bg-emerald-500/15 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Duyệt</span>
              </button>
            )}

            {(record.status === 'pending' || record.status === 'paid') && (
              <button
                type="button"
                onClick={() => handleRequestStatusChange(record, 'cancelled')}
                title={
                  record.status === 'paid'
                    ? 'Hủy đơn & hoàn vé'
                    : 'Hủy đơn chờ thanh toán'
                }
                className="inline-flex h-7 items-center gap-1 px-2 rounded border border-rose-500/35 bg-rose-500/10 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/25 transition cursor-pointer"
              >
                <Ban className="w-3 h-3" />
                <span>Hủy</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedBooking(record)}
              className="inline-flex h-7 items-center gap-1 px-2.5 rounded border border-white/10 bg-[#1B1E36] text-xs font-semibold text-cinema-text-muted hover:text-cinema-gold hover:border-cinema-gold/40 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem</span>
            </button>
          </div>
        ),
      },
    ],
    [handleRequestStatusChange]
  );

  return (
    <div className="space-y-4">
      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-md border border-white/10 bg-[#121324] px-4 py-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-cinema-text-dim">
            Tổng đơn hệ thống
          </span>
          <span className="mt-1 block font-display text-lg font-black text-white tabular-nums">
            {total_items.toLocaleString('vi-VN')} đơn
          </span>
        </div>
        <div className="rounded-md border border-white/10 bg-[#121324] px-4 py-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-cinema-text-dim">
            Đã thanh toán (Trang này)
          </span>
          <span className="mt-1 block font-display text-lg font-black text-emerald-400 tabular-nums">
            {pageSummary.paidCount} đơn
          </span>
        </div>
        <div className="rounded-md border border-white/10 bg-[#121324] px-4 py-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-cinema-text-dim">
            Chờ thanh toán (Trang này)
          </span>
          <span className="mt-1 block font-display text-lg font-black text-cinema-gold tabular-nums">
            {pageSummary.pendingCount} đơn
          </span>
        </div>
        <div className="rounded-md border border-white/10 bg-[#121324] px-4 py-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-cinema-text-dim">
            Doanh thu trang hiện tại
          </span>
          <span className="mt-1 block font-display text-lg font-black text-cinema-gold tabular-nums">
            {formatCurrency(pageSummary.paidAmount)}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-md border border-white/10 bg-[#121324] p-3">
        <div className="flex flex-wrap items-center gap-1 bg-[#0B0C16] p-1 rounded-md border border-white/[0.06]">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-cinema-gold text-cinema-bg font-bold'
                    : 'text-cinema-text-muted hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 text-cinema-text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, email, tên phim..."
              className="w-full rounded-md border border-white/10 bg-[#0E101E] pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-cinema-text-dim outline-none focus:border-cinema-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cinema-text-dim hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Làm mới danh sách"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-cinema-surface text-cinema-text-muted hover:text-white transition cursor-pointer shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetching ? 'animate-spin text-cinema-gold' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        loading={!data}
        isFetching={isFetching}
        onRowClick={(record) => setSelectedBooking(record)}
        loadingMessage="Đang tải dữ liệu giao dịch..."
        emptyMessage="Không tìm thấy hóa đơn nào phù hợp."
        emptyIcon={Ticket}
        pagination={{
          page,
          totalPages: total_pages,
          onPageChange: setPage,
        }}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCopyText={copyText}
        checkInMutation={checkInMutation}
        onRequestStatusChange={handleRequestStatusChange}
        isUpdatingStatus={updateStatusMutation.isPending}
      />

      {/* Confirm Approve / Cancel Modal */}
      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        className="max-w-md"
      >
        <Modal.Header>
          <div className="flex items-center gap-2 font-display font-bold text-white">
            {confirmAction?.nextStatus === 'paid' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Xác Nhận Duyệt Thanh Toán Đơn Vé</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Xác Nhận Hủy Đơn Đặt Vé</span>
              </>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-3 text-sm">
          {confirmAction?.nextStatus === 'paid' ? (
            <>
              <p className="m-0 text-cinema-text">
                Bạn có chắc chắn muốn{' '}
                <strong className="text-emerald-400">
                  duyệt thanh toán thủ công
                </strong>{' '}
                cho đơn{' '}
                <span className="font-mono font-bold text-cinema-gold">
                  #{confirmAction?.booking?.id?.split('-')[0]?.toUpperCase()}
                </span>{' '}
                với tổng số tiền{' '}
                <strong className="text-white">
                  {formatCurrency(confirmAction?.booking?.total_amount || 0)}
                </strong>
                ?
              </p>
              <p className="m-0 text-xs text-cinema-text-muted">
                Hệ thống sẽ kiểm tra tồn kho ghế, phát hành vé hợp lệ và chuyển ghế sang trạng thái Đã bán trên sơ đồ.
              </p>
            </>
          ) : (
            <>
              <p className="m-0 text-cinema-text">
                Bạn có chắc chắn muốn{' '}
                <strong className="text-rose-400">hủy đơn đặt vé</strong>{' '}
                <span className="font-mono font-bold text-cinema-gold">
                  #{confirmAction?.booking?.id?.split('-')[0]?.toUpperCase()}
                </span>{' '}
                của khách hàng{' '}
                <strong className="text-white">
                  {confirmAction?.booking?.user?.full_name || 'Khách vãng lai'}
                </strong>
                ?
              </p>
              <p className="m-0 text-xs text-cinema-text-muted">
                Toàn bộ vé trong đơn sẽ chuyển sang trạng thái Đã hoàn/Hủy và các ghế sẽ được mở trống lại ngay lập tức trên sơ đồ phòng chiếu.
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmAction(null)}
            disabled={updateStatusMutation.isPending}
          >
            Đóng
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={updateStatusMutation.isPending}
            onClick={() =>
              confirmAction &&
              updateStatusMutation.mutate({
                id: confirmAction.booking.id,
                status: confirmAction.nextStatus,
              })
            }
            className={
              confirmAction?.nextStatus === 'paid'
                ? '!bg-emerald-600 hover:!bg-emerald-500 !text-white font-bold'
                : '!bg-rose-600 hover:!bg-rose-500 !text-white font-bold'
            }
          >
            {confirmAction?.nextStatus === 'paid'
              ? 'Xác nhận Duyệt đơn'
              : 'Xác nhận Hủy đơn'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}