import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { bookingApi } from '@/api/bookingApi';
import { systemApi } from '@/api/systemApi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
    Ticket,
    CheckCircle2,
    Clock,
    Ban,
    Film,
    User,
    Search,
    X,
    Eye,
    Copy,
    RefreshCw,
    QrCode
} from 'lucide-react';
import { Button, Badge, DataTable } from '@/components/core';

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

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['admin-bookings', page, statusFilter],
        queryFn: async () => {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await bookingApi.getAllAdmin(params);
            return res.data;
        },
        placeholderData: keepPreviousData
    });

    const checkInMutation = useMutation({
        mutationFn: (ticketId) => systemApi.checkInTicket(ticketId),
        onSuccess: (_, ticketId) => {
            toast.success('Đã xác nhận Check-in vé thành công!');
            queryClient.invalidateQueries(['admin-bookings']);
            setSelectedBooking((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    tickets: (prev.tickets || []).map((t) =>
                        t.id === ticketId ? { ...t, status: 'used' } : t
                    )
                };
            });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Không thể check-in vé này')
    });

    const { bookings = [], total_pages = 1, total_items = 0 } = data || {};

    const filteredBookings = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return bookings;
        return bookings.filter((b) => {
            const idStr = (b.id || '').toLowerCase();
            const userName = (b.user?.full_name || '').toLowerCase();
            const userEmail = (b.user?.email || '').toLowerCase();
            const userPhone = (b.user?.phone_number || b.user?.phone || '').toLowerCase();
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

    const getStatusBadge = (status) => {
        if (status === 'paid') {
            return (
                <Badge variant="emerald" size="sm" className="rounded" icon={<CheckCircle2 className="w-3 h-3" />}>
                    Đã thanh toán
                </Badge>
            );
        }
        if (status === 'cancelled') {
            return (
                <Badge variant="rose" size="sm" className="rounded" icon={<Ban className="w-3 h-3" />}>
                    Đã hủy
                </Badge>
            );
        }
        return (
            <Badge variant="gold" size="sm" className="rounded" icon={<Clock className="w-3 h-3" />}>
                Chờ thanh toán
            </Badge>
        );
    };

    const getTicketStatusBadge = (status) => {
        if (status === 'used') {
            return <Badge variant="purple" size="sm">Đã sử dụng (Checked-in)</Badge>;
        }
        if (status === 'refunded') {
            return <Badge variant="rose" size="sm">Đã hoàn/Hủy</Badge>;
        }
        return <Badge variant="emerald" size="sm">Chưa sử dụng</Badge>;
    };

    const columns = useMemo(() => [
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
            )
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            render: (user) => (
                <div className="min-w-[160px]">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                        <span className="truncate">{user?.full_name || 'Khách vãng lai'}</span>
                    </div>
                    <div className="text-[11px] text-cinema-text-dim mt-0.5 truncate">
                        {user?.email || user?.phone_number || 'Chưa cập nhật liên hệ'}
                    </div>
                </div>
            )
        },
        {
            title: 'Phim & Suất chiếu',
            dataIndex: 'showtime',
            render: (showtime) => (
                <div className="min-w-[200px]">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                        <span className="line-clamp-1">{showtime?.movie?.title || '—'}</span>
                    </div>
                    <div className="text-[11px] text-cinema-text-dim mt-0.5 flex items-center gap-1.5 tabular-nums">
                        <span className="font-semibold text-cinema-text-muted">{showtime?.room?.name}</span>
                        <span>•</span>
                        <span>{formatDateTime(showtime?.start_time)}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Số vé',
            dataIndex: 'tickets',
            width: '95px',
            align: 'center',
            render: (tickets) => (
                <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-bold text-white tabular-nums">
                    {tickets?.length || 0} vé
                </span>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            width: '135px',
            align: 'right',
            render: (amount) => (
                <span className="font-bold text-cinema-gold tabular-nums">
                    {formatCurrency(amount)}
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: '150px',
            align: 'center',
            render: (status) => getStatusBadge(status)
        },
        {
            title: 'Chi tiết',
            key: 'action',
            width: '100px',
            align: 'right',
            render: (_, record) => (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(record);
                    }}
                    className="inline-flex h-7 items-center gap-1 px-2.5 rounded border border-white/10 bg-[#1B1E36] text-xs font-semibold text-cinema-text-muted hover:text-cinema-gold hover:border-cinema-gold/40 transition cursor-pointer"
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem</span>
                </button>
            )
        }
    ], []);

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
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-cinema-gold' : ''}`} />
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
                    onPageChange: setPage
                }}
            />

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
                    <div
                        className="fixed inset-0"
                        onClick={() => setSelectedBooking(null)}
                    />
                    <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-md border border-white/15 bg-[#121324] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#16182D] px-5 py-3.5 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <Ticket className="w-4 h-4 text-cinema-gold" />
                                <h3 className="m-0 font-display text-base font-bold text-white">
                                    Chi Tiết Đơn Đặt Vé #{selectedBooking.id?.split('-')[0]?.toUpperCase()}
                                </h3>
                                {getStatusBadge(selectedBooking.status)}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBooking(null)}
                                className="p-1.5 rounded text-cinema-text-muted hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded border border-white/10 bg-[#17192E] p-3.5 space-y-1.5 text-xs">
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-cinema-text-dim block">
                                        Thông tin khách hàng
                                    </span>
                                    <div className="font-bold text-sm text-white">
                                        {selectedBooking.user?.full_name || 'Khách vãng lai'}
                                    </div>
                                    <div className="text-cinema-text-muted">
                                        Email: {selectedBooking.user?.email || '—'}
                                    </div>
                                    {selectedBooking.user?.phone_number && (
                                        <div className="text-cinema-text-muted">
                                            SĐT: {selectedBooking.user.phone_number}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded border border-white/10 bg-[#17192E] p-3.5 space-y-1.5 text-xs">
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-cinema-text-dim block">
                                        Suất chiếu & Thanh toán
                                    </span>
                                    <div className="font-bold text-sm text-white line-clamp-1">
                                        {selectedBooking.showtime?.movie?.title}
                                    </div>
                                    <div className="text-cinema-text-muted">
                                        Phòng: <strong className="text-white">{selectedBooking.showtime?.room?.name}</strong> • {formatDateTime(selectedBooking.showtime?.start_time)}
                                    </div>
                                    <div className="text-cinema-text-muted">
                                        Tổng thanh toán: <strong className="text-cinema-gold tabular-nums">{formatCurrency(selectedBooking.total_amount)}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Full Booking ID Copy */}
                            <div className="flex items-center justify-between rounded border border-white/10 bg-[#0E101E] px-3.5 py-2 text-xs">
                                <span className="text-cinema-text-dim">
                                    Mã giao dịch (UUID): <code className="text-cinema-text font-mono ml-1">{selectedBooking.id}</code>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyText(selectedBooking.id, 'mã giao dịch')}
                                    className="inline-flex items-center gap-1 text-cinema-gold hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                                >
                                    <Copy className="w-3 h-3" /> Sao chép
                                </button>
                            </div>

                            {/* Tickets List & QR Codes */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-cinema-text-muted flex items-center gap-1.5">
                                        <QrCode className="w-3.5 h-3.5 text-cinema-gold" />
                                        Danh sách vé phát hành ({selectedBooking.tickets?.length || 0} vé)
                                    </h4>
                                </div>

                                {(!selectedBooking.tickets || selectedBooking.tickets.length === 0) ? (
                                    <div className="rounded border border-white/10 p-6 text-center text-xs text-cinema-text-dim">
                                        Đơn hàng này không có vé đính kèm.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {selectedBooking.tickets.map((ticket, idx) => (
                                            <div
                                                key={ticket.id || idx}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-white/10 bg-[#17192E] p-3"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-1.5 rounded bg-white shrink-0">
                                                        <QRCodeSVG
                                                            value={String(ticket.id)}
                                                            size={52}
                                                            bgColor="#ffffff"
                                                            fgColor="#000000"
                                                            level="M"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-xs font-bold text-white">
                                                                Vé #{idx + 1}
                                                            </span>
                                                            {getTicketStatusBadge(ticket.status)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cinema-text-dim truncate">
                                                            <span className="truncate">{ticket.id}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyText(ticket.id, 'mã vé')}
                                                                className="text-cinema-gold hover:text-white shrink-0 cursor-pointer"
                                                                title="Sao chép mã vé"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="text-xs font-bold text-cinema-gold tabular-nums">
                                                            Giá vé: {formatCurrency(ticket.price)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedBooking.status === 'paid' && ticket.status !== 'used' && ticket.status !== 'refunded' && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        isLoading={checkInMutation.isPending}
                                                        onClick={() => checkInMutation.mutate(ticket.id)}
                                                        className="rounded text-xs border-cinema-gold/30 hover:border-cinema-gold text-cinema-gold shrink-0"
                                                    >
                                                        Check-in ngay
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end border-t border-white/10 bg-[#16182D] px-5 py-3 shrink-0">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedBooking(null)}
                                className="rounded-md"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}