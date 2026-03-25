import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { authApi } from '../api/authApi';


export default function History() {
    // Tự động fetch, tự động cache, tự động loading!
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['history'],
        queryFn: async () => {
            const res = await authApi.getHistory();
            return res.data;
        }
    });
    if (isLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải lịch sử mua vé...</div>;

    const getTicketStatus = (status) => {
        if (status === 'used') {
            return { badgeClass: 'bg-[#8c7356]', text: 'ĐÃ SỬ DỤNG' };
        }
        if (status === 'refunded') {
            return { badgeClass: 'bg-[#b0232f]', text: 'ĐÃ HOÀN TIỀN' };
        }
        return { badgeClass: 'bg-[#1f8d52]', text: 'HỢP LỆ' };
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19] min-[0px]:max-[420px]:text-[28px]">Vé Của Tôi</h1>

            {history.length === 0 ? (
                <p className="mt-4 border border-[#ddcbb6] bg-white p-8 text-center text-[#7b6446] shadow-[0_8px_22px_rgba(76,45,17,0.10)]">Bạn chưa có giao dịch mua vé nào.</p>
            ) : (
                history.map(booking => {
                    const st = booking.showtime;
                    const startTime = new Date(st.start_time).toLocaleString('vi-VN');

                    return (
                        <div key={booking.id} className="mt-5 border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)] sm:p-5">
                            {/* THÔNG TIN CHUNG CỦA HÓA ĐƠN */}
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ddcbb6] pb-4 min-[0px]:max-[420px]:flex-col min-[0px]:max-[420px]:items-start">
                                <div>
                                    <h2 className="m-0 font-display text-[26px] text-[#3b2b19] min-[0px]:max-[420px]:text-[22px]">{st.movie.title}</h2>
                                    <p className="mb-0 mt-2 text-sm text-[#7b6446]"><strong className="text-[#3b2b19]">Rạp/Phòng:</strong> {st.room.name}</p>
                                    <p className="mb-0 mt-1 text-sm text-[#7b6446]"><strong className="text-[#3b2b19]">Suất chiếu:</strong> {startTime}</p>
                                </div>
                                <div className="text-right min-[0px]:max-[420px]:text-left">
                                    <p className="m-0 text-xs uppercase tracking-[0.06em] text-[#8c7356]">Mã HĐ: {booking.id.split('-')[0]}</p>
                                    <h3 className="mb-0 mt-2 text-[28px] font-extrabold text-brand-500 min-[0px]:max-[420px]:text-[22px]">
                                        {parseInt(booking.total_amount).toLocaleString()} VNĐ
                                    </h3>
                                </div>
                            </div>

                            {/* DANH SÁCH VÉ & MÃ QR */}
                            <h4 className="mb-0 mt-5 font-display text-lg text-[#3b2b19]">Danh sách vé ({booking.tickets.length} vé):</h4>
                            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-2 sm:grid-cols-1">
                                {booking.tickets.map(ticket => {
                                    const ticketStatus = getTicketStatus(ticket.status);

                                    return (
                                        <div key={ticket.id} className="flex items-center gap-3 border border-[#ddcbb6] bg-[#fff6ec] p-3">
                                            {/* Mã QR chứa Ticket ID */}
                                            <div className="flex h-[92px] w-[92px] items-center justify-center border border-[#ddcbb6] bg-white p-[6px]">
                                                <QRCodeSVG
                                                    value={ticket.id} // Nội dung mã QR chính là ID của vé
                                                    size={80}
                                                    bgColor={"#ffffff"}
                                                    fgColor={"#000000"}
                                                    level={"L"}
                                                />
                                            </div>

                                            {/* Thông tin ghế */}
                                            <div>
                                                <h1 className="m-0 text-xl font-bold text-[#3b2b19]">
                                                    Ghế {ticket.seat.row_letter}{ticket.seat.seat_number}
                                                </h1>
                                                <p className="mb-0 mt-1 text-xs uppercase tracking-[0.04em] text-[#8c7356]">Loại: {ticket.seat.type.toUpperCase()}</p>
                                                <p className={`mb-0 mt-2 inline-block px-2 py-[5px] text-xs font-bold tracking-[0.04em] text-white ${ticketStatus.badgeClass}`}>
                                                    {ticketStatus.text}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}