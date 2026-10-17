import { QRCodeSVG } from 'qrcode.react';
import { Ticket, CheckCircle2, Clock, Ban, X, Copy, QrCode } from 'lucide-react';
import { Button, Badge } from '@/components/core';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export function BookingStatusBadge({ status }) {
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
}

export function TicketStatusBadge({ status }) {
    if (status === 'used') {
        return <Badge variant="purple" size="sm">Đã sử dụng (Checked-in)</Badge>;
    }
    if (status === 'refunded') {
        return <Badge variant="rose" size="sm">Đã hoàn/Hủy</Badge>;
    }
    return <Badge variant="emerald" size="sm">Chưa sử dụng</Badge>;
}

export default function BookingDetailModal({
    booking,
    onClose,
    onCopyText,
    checkInMutation
}) {
    if (!booking) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-md border border-white/15 bg-[#121324] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#16182D] px-5 py-3.5 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Ticket className="w-4 h-4 text-cinema-gold" />
                        <h3 className="m-0 font-display text-base font-bold text-white">
                            Chi Tiết Đơn Đặt Vé #{booking.id?.split('-')[0]?.toUpperCase()}
                        </h3>
                        <BookingStatusBadge status={booking.status} />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
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
                                {booking.user?.full_name || 'Khách vãng lai'}
                            </div>
                            <div className="text-cinema-text-muted">
                                Email: {booking.user?.email || '—'}
                            </div>
                            {booking.user?.phone_number && (
                                <div className="text-cinema-text-muted">
                                    SĐT: {booking.user.phone_number}
                                </div>
                            )}
                        </div>

                        <div className="rounded border border-white/10 bg-[#17192E] p-3.5 space-y-1.5 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-cinema-text-dim block">
                                Suất chiếu & Thanh toán
                            </span>
                            <div className="font-bold text-sm text-white line-clamp-1">
                                {booking.showtime?.movie?.title}
                            </div>
                            <div className="text-cinema-text-muted">
                                Phòng: <strong className="text-white">{booking.showtime?.room?.name}</strong> • {formatDateTime(booking.showtime?.start_time)}
                            </div>
                            <div className="text-cinema-text-muted">
                                Tổng thanh toán: <strong className="text-cinema-gold tabular-nums">{formatCurrency(booking.total_amount)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Full Booking ID Copy */}
                    <div className="flex items-center justify-between rounded border border-white/10 bg-[#0E101E] px-3.5 py-2 text-xs">
                        <span className="text-cinema-text-dim">
                            Mã giao dịch (UUID): <code className="text-cinema-text font-mono ml-1">{booking.id}</code>
                        </span>
                        <button
                            type="button"
                            onClick={() => onCopyText(booking.id, 'mã giao dịch')}
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
                                Danh sách vé phát hành ({booking.tickets?.length || 0} vé)
                            </h4>
                        </div>

                        {(!booking.tickets || booking.tickets.length === 0) ? (
                            <div className="rounded border border-white/10 p-6 text-center text-xs text-cinema-text-dim">
                                Đơn hàng này không có vé đính kèm.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2.5">
                                {booking.tickets.map((ticket, idx) => (
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
                                                    <TicketStatusBadge status={ticket.status} />
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-cinema-text-dim truncate">
                                                    <span className="truncate">{ticket.id}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onCopyText(ticket.id, 'mã vé')}
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

                                        {booking.status === 'paid' && ticket.status !== 'used' && ticket.status !== 'refunded' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                isLoading={checkInMutation.isPending && checkInMutation.variables === ticket.id}
                                                disabled={checkInMutation.isPending}
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
                        onClick={onClose}
                        className="rounded-md"
                    >
                        Đóng
                    </Button>
                </div>
            </div>
        </div>
    );
}
