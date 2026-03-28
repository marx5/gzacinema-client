import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingApi } from '../../api/bookingApi';
import TableSkeleton from '../../components/TableSkeleton';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Breadcrumb from '../../components/Breadcrumb';

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
        if (status === 'paid') return <span className="bg-[#1f8d52] px-2 py-1 text-xs font-bold text-white">ĐÃ THANH TOÁN</span>;
        if (status === 'cancelled') return <span className="bg-[#b0232f] px-2 py-1 text-xs font-bold text-white">ĐÃ HỦY</span>;
        return <span className="bg-[#b2720a] px-2 py-1 text-xs font-bold text-white">CHỜ THANH TOÁN</span>;
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            <Breadcrumb items={[{ label: 'Quản trị', link: '/admin' }, { label: 'Quản lý Hóa đơn' }]} />
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19]">Quản Lý Hóa Đơn</h1>

            <div className="mt-4 mb-6 flex items-center gap-3">
                <label className="text-sm font-bold text-[#3b2b19]">Lọc trạng thái:</label>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border border-[#ddcbb6] px-3 py-2 text-sm bg-white">
                    <option value="">Tất cả</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="pending">Chờ thanh toán</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            <div className="relative overflow-x-auto border border-[#ddcbb6] bg-white shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                {isFetching && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                        <span className="rounded-md bg-white px-4 py-2 font-bold text-brand-600 shadow-md">
                            Đang cập nhật...
                        </span>
                    </div>
                )}
                <table className="w-full text-left text-sm text-[#3b2b19] min-w-[800px]">
                    <thead className="bg-[#fff6ec] border-b border-[#ddcbb6]">
                        <tr>
                            <th className="px-4 py-3 font-bold">Mã HĐ</th>
                            <th className="px-4 py-3 font-bold">Khách hàng</th>
                            <th className="px-4 py-3 font-bold">Phim & Suất chiếu</th>
                            <th className="px-4 py-3 font-bold">Số lượng vé</th>
                            <th className="px-4 py-3 font-bold text-right">Tổng tiền</th>
                            <th className="px-4 py-3 font-bold text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!data ? (
                            <TableSkeleton rows={8} columns={6} />
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-[#8c7356]">Không tìm thấy hóa đơn nào.</td></tr>
                        ) : (
                            bookings.map(b => (
                                <tr key={b.id} className="border-b border-dashed border-[#ddcbb6] hover:bg-[#faf4ed]">
                                    <td className="px-4 py-3 font-mono text-xs uppercase">{b.id.split('-')[0]}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold">{b.user?.full_name || 'Khách Vãng Lai'}</div>
                                        <div className="text-xs text-[#8c7356]">{b.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-brand-600">{b.showtime?.movie?.title}</div>
                                        <div className="text-xs text-[#8c7356]">
                                            {b.showtime?.room?.name} | {formatDateTime(b.showtime?.start_time)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{b.tickets?.length || 0} vé</td>
                                    <td className="px-4 py-3 text-right font-bold text-brand-500">
                                        {formatCurrency(b.total_amount)}
                                    </td>
                                    <td className="px-4 py-3 text-center">{getStatusBadge(b.status)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {total_pages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border border-[#ddcbb6] bg-white px-3 py-1 text-sm disabled:opacity-50">Trước</button>
                    <span className="flex items-center px-3 py-1 text-sm font-bold text-[#3b2b19]">Trang {page} / {total_pages}</span>
                    <button disabled={page === total_pages} onClick={() => setPage(p => p + 1)} className="border border-[#ddcbb6] bg-white px-3 py-1 text-sm disabled:opacity-50">Sau</button>
                </div>
            )}
        </div>
    );
}