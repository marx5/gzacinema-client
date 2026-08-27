import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingApi } from '../../api/bookingApi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Ticket, Filter, CheckCircle2, Clock, Ban, Film, User, Calendar } from 'lucide-react';
import { Button, Badge, Select, TableSkeleton } from '../../components/core';

export default function AdminBookings() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const { data, isFetching } = useQuery({
        queryKey: ['admin-bookings', page, statusFilter],
        queryFn: async () => {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await bookingApi.getAllAdmin(params);
            return res.data;
        },
        placeholderData: keepPreviousData
    });

    const { bookings = [], total_pages = 1 } = data || {};

    const getStatusBadge = (status) => {
        if (status === 'paid') {
            return (
                <Badge variant="emerald" size="sm" className="rounded-md" icon={<CheckCircle2 className="w-3 h-3" />}>
                    ĐÃ THANH TOÁN
                </Badge>
            );
        }
        if (status === 'cancelled') {
            return (
                <Badge variant="rose" size="sm" className="rounded-md" icon={<Ban className="w-3 h-3" />}>
                    ĐÃ HỦY
                </Badge>
            );
        }
        return (
            <Badge variant="gold" size="sm" className="rounded-md" icon={<Clock className="w-3 h-3" />}>
                CHỜ THANH TOÁN
            </Badge>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Standardized Filter Row - Aligned Right */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 ml-auto">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-cinema-surface text-cinema-gold shrink-0">
                    <Filter className="w-4 h-4" />
                </div>

                <div className="w-48 sm:w-56">
                    <Select
                        size="sm"
                        value={statusFilter}
                        onChange={(val) => { setStatusFilter(val); setPage(1); }}
                        options={[
                            { value: '', label: 'Tất cả trạng thái' },
                            { value: 'paid', label: 'Đã thanh toán' },
                            { value: 'pending', label: 'Chờ thanh toán' },
                            { value: 'cancelled', label: 'Đã hủy' }
                        ]}
                    />
                </div>
            </div>

            {/* Bookings Table */}
            <div className="relative z-10 glass-card rounded-md border border-white/10 shadow-cinematic overflow-hidden">
                {isFetching && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-cinema-bg/60 backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 rounded-md border border-cinema-gold/40 bg-cinema-surface px-4 py-2 text-xs font-bold text-cinema-gold shadow-glow-gold-sm">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                            Đang tải dữ liệu giao dịch...
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-cinema-text min-w-[850px]">
                        <thead className="bg-cinema-surface-elevated/80 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                            <tr>
                                <th className="px-5 py-4 w-[110px]">Mã đơn</th>
                                <th className="px-5 py-4">Khách hàng</th>
                                <th className="px-5 py-4">Phim & Suất chiếu</th>
                                <th className="px-5 py-4 w-[100px] text-center">Số vé</th>
                                <th className="px-5 py-4 w-[150px] text-right">Tổng tiền</th>
                                <th className="px-5 py-4 w-[160px] text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {!data ? (
                                <TableSkeleton rows={8} columns={6} />
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-12 text-center text-cinema-text-muted">
                                        <Ticket className="w-10 h-10 text-cinema-text-dim mx-auto mb-2" />
                                        Không tìm thấy hóa đơn nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-cinema-gold uppercase">
                                            #{b.id.split('-')[0]}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-cinema-text flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                                                <span>{b.user?.full_name || 'Khách vãng lai'}</span>
                                            </div>
                                            <div className="text-xs text-cinema-text-dim mt-0.5">
                                                {b.user?.email || b.user?.phone || 'Chưa có email'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-cinema-text flex items-center gap-1.5">
                                                <Film className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                                                <span className="line-clamp-1">{b.showtime?.movie?.title}</span>
                                            </div>
                                            <div className="text-xs text-cinema-text-dim mt-0.5 flex items-center gap-2">
                                                <span>{b.showtime?.room?.name}</span>
                                                <span>•</span>
                                                <span>{formatDateTime(b.showtime?.start_time)}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-bold text-white">
                                            <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">
                                                {b.tickets?.length || 0} vé
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-cinema-gold">
                                            {formatCurrency(b.total_amount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {getStatusBadge(b.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total_pages > 1 && (
                    <div className="flex items-center justify-center gap-2 border-t border-white/10 p-4 bg-white/[0.01]">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="rounded-md"
                        >
                            &larr; Trước
                        </Button>

                        <span className="px-3 text-xs font-bold text-cinema-text">
                            Trang {page} / {total_pages}
                        </span>

                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === total_pages}
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-md"
                        >
                            Sau &rarr;
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}