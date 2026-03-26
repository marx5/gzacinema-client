import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../../api/systemApi';
import { cinemaApi } from '../../api/cinemaApi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [filterType, setFilterType] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedCinema, setSelectedCinema] = useState('');

    const { data: cinemas = [] } = useQuery({
        queryKey: ['admin-cinemas-list'],
        queryFn: async () => {
            const res = await cinemaApi.getAll();
            return res.data;
        },
        onError: () => toast.error("Không thể tải danh sách rạp")
    });

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats', filterType, customStartDate, customEndDate, selectedCinema],
        queryFn: async () => {
            let params = {};

            if (selectedCinema) params.cinemaId = selectedCinema;

            const today = new Date();
            if (filterType === 'today') {
                params.startDate = today.toISOString().split('T')[0];
                params.endDate = params.startDate;
            } else if (filterType === 'week') {
                const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
                params.startDate = firstDay.toISOString().split('T')[0];
                params.endDate = lastDay.toISOString().split('T')[0];
            } else if (filterType === 'month') {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                params.startDate = firstDay.toISOString().split('T')[0];
                params.endDate = lastDay.toISOString().split('T')[0];
            } else if (filterType === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }

            const res = await systemApi.getStats(params);
            return res.data;
        },
        enabled: filterType !== 'custom' || (!!customStartDate && !!customEndDate),
        keepPreviousData: true,
    });

    if (isLoading && !stats) return <div className="py-10 text-center text-[#7b6446]">Đang phân tích dữ liệu...</div>;

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19] min-[0px]:max-[420px]:text-[28px]">Phân Tích & Thống Kê</h1>

            {/* THANH CÔNG CỤ LỌC (FILTER TOOLBAR) */}
            <div className="mt-5 border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">

                <div className="mb-4">
                    <label className="block text-sm font-bold text-[#3b2b19] mb-2">Lọc theo Rạp:</label>
                    <select
                        value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)}
                        className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                    >
                        <option value="">-- Tất cả hệ thống rạp --</option>
                        {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-bold text-[#3b2b19] mb-2">Lọc theo Thời gian:</label>
                    <select
                        value={filterType} onChange={(e) => setFilterType(e.target.value)}
                        className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                    >
                        <option value="all">Trọn đời (All-time)</option>
                        <option value="today">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="custom">Tùy chỉnh...</option>
                    </select>
                </div>

                {filterType === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">Từ ngày:</label>
                            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">Đến ngày:</label>
                            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm" />
                        </div>
                    </div>
                )}
            </div>

            {/* HIỂN THỊ CHỈ SỐ */}
            {stats && (
                <>
                    <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-2 sm:grid-cols-1">
                        <div className="border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                            <h3 className="mb-2 m-0 text-sm uppercase tracking-[0.06em] text-[#8c7356]">Tổng Doanh Thu</h3>
                            <p className="mb-0 m-0 text-[28px] font-extrabold text-brand-500">
                                {parseInt(stats.overview.total_revenue).toLocaleString()} <span className="text-sm font-bold text-[#8c7356]">VNĐ</span>
                            </p>
                        </div>
                        <div className="border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                            <h3 className="mb-2 m-0 text-sm uppercase tracking-[0.06em] text-[#8c7356]">Vé Đã Bán</h3>
                            <p className="mb-0 m-0 text-[28px] font-extrabold text-brand-500">
                                {stats.overview.total_tickets_sold} <span className="text-sm font-bold text-[#8c7356]">vé</span>
                            </p>
                        </div>
                        <div className="border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                            <h3 className="mb-2 m-0 text-sm uppercase tracking-[0.06em] text-[#8c7356]">Khách Đăng Ký Mới</h3>
                            <p className="mb-0 m-0 text-[28px] font-extrabold text-brand-500">
                                {stats.overview.total_users} <span className="text-sm font-bold text-[#8c7356]">người</span>
                            </p>
                        </div>
                    </div>

                    <h2 className="mt-8 m-0 font-display text-2xl text-[#3b2b19]">Top Phim Đem Lại Doanh Thu Cao Nhất</h2>
                    {stats.revenue_by_movie.length === 0 ? (
                        <p className="mt-4 text-center text-[#8c7356]">Không có dữ liệu giao dịch trong khoảng thời gian này.</p>
                    ) : (
                        <div className="mt-4 flex flex-col gap-3">
                            {stats.revenue_by_movie.map((movie, index) => (
                                <div key={movie.movie_id} className="border border-[#ddcbb6] bg-white p-4 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                                    <div className="flex items-start justify-between gap-4 md:flex-col">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center bg-brand-500 text-sm font-bold text-white">
                                                {index + 1}
                                            </div>
                                            <h3 className="mb-0 m-0 font-bold text-[#3b2b19]">{movie.title}</h3>
                                        </div>
                                        <div className="text-right md:text-left">
                                            <p className="mb-1 m-0 text-sm font-bold text-brand-500">{parseInt(movie.total_revenue).toLocaleString()} VNĐ</p>
                                            <p className="mb-0 m-0 text-xs text-[#8c7356]">{movie.booking_count} lượt đặt</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}