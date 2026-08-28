import { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingApi } from '@/api/bookingApi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Ticket, Filter, CheckCircle2, Clock, Ban, Film, User, Calendar } from 'lucide-react';
import { Button, Badge, Select, DataTable } from '@/components/core';

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

    const columns = useMemo(() => [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            width: '110px',
            render: (id) => (
                <span className="font-mono text-xs font-bold text-cinema-gold uppercase">
                    #{id?.split('-')[0]}
                </span>
            )
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            render: (user) => (
                <div>
                    <div className="font-bold text-cinema-text flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                        <span>{user?.full_name || 'Khách vãng lai'}</span>
                    </div>
                    <div className="text-xs text-cinema-text-dim mt-0.5">
                        {user?.email || user?.phone || 'Chưa có email'}
                    </div>
                </div>
            )
        },
        {
            title: 'Phim & Suất chiếu',
            dataIndex: 'showtime',
            render: (showtime) => (
                <div>
                    <div className="font-bold text-cinema-text flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                        <span className="line-clamp-1">{showtime?.movie?.title}</span>
                    </div>
                    <div className="text-xs text-cinema-text-dim mt-0.5 flex items-center gap-2">
                        <span>{showtime?.room?.name}</span>
                        <span>•</span>
                        <span>{formatDateTime(showtime?.start_time)}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Số vé',
            dataIndex: 'tickets',
            width: '100px',
            align: 'center',
            render: (tickets) => (
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-white">
                    {tickets?.length || 0} vé
                </span>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            width: '150px',
            align: 'right',
            render: (amount) => (
                <span className="font-black text-cinema-gold">
                    {formatCurrency(amount)}
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: '160px',
            align: 'center',
            render: (status) => getStatusBadge(status)
        }
    ], []);

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
            <DataTable
                columns={columns}
                data={bookings}
                loading={!data}
                isFetching={isFetching}
                loadingMessage="Đang tải dữ liệu giao dịch..."
                emptyMessage="Không tìm thấy hóa đơn nào phù hợp."
                emptyIcon={Ticket}
                pagination={{
                    page,
                    totalPages: total_pages,
                    onPageChange: setPage
                }}
            />
        </div>
    );
}