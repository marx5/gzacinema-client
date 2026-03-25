/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api/bookingApi';
import toast from 'react-hot-toast';

export default function Booking() {
    const { showtimeId } = useParams();

    const [mySelectedSeats, setMySelectedSeats] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [processing, setProcessing] = useState(false);

    // 🚀 SỬ DỤNG REACT QUERY VỚI REFETCH INTERVAL (POLLING)
    // Tự động làm mới sơ đồ ghế mỗi 10 giây để cập nhật trạng thái từ người dùng khác
    const { data: seatData, isLoading, refetch } = useQuery({
        queryKey: ['seats', showtimeId],
        queryFn: async () => {
            const res = await bookingApi.getSeats(showtimeId);
            return res.data;
        },
        refetchInterval: 10000
    });

    // Đồng bộ danh sách ghế đang giữ của mình khi dữ liệu từ server thay đổi
    useEffect(() => {
        if (seatData) {
            const heldByMe = seatData.seats
                .filter(s => s.status === 'held_by_me')
                .map(s => s.id);

            // Hợp nhất ghế local và ghế trên server để tránh bị mất ghế khi F5
            setMySelectedSeats(prev => Array.from(new Set([...prev, ...heldByMe])));
        }
    }, [seatData]);

    // ⏱ LOGIC ĐỒNG HỒ ĐẾM NGƯỢC
    useEffect(() => {
        if (mySelectedSeats.length === 0) {
            setTimeLeft(0);
            return;
        }

        // Khởi tạo 5 phút nếu chưa có đồng hồ
        if (timeLeft === 0 && mySelectedSeats.length > 0) {
            setTimeLeft(300);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error('⏰ Đã hết thời gian giữ ghế! Vui lòng chọn lại.');
                    setMySelectedSeats([]);
                    refetch();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [mySelectedSeats.length, timeLeft]);

    // 🖱 XỬ LÝ CLICK CHỌN GHẾ (BAO GỒM GHẾ CẶP SWEETBOX)
    const handleSeatClick = async (seat) => {
        // Chặn nếu ghế đã bán hoặc NGƯỜI KHÁC đang giữ
        if (seat.status === 'booked' || (seat.status === 'held' && !mySelectedSeats.includes(seat.id))) {
            toast.error('Ghế này đã có người chọn!');
            return;
        }

        let seatsToProcess = [seat];

        // Logic tự động tìm ghế cặp nếu là Sweetbox
        if (seat.type === 'sweetbox') {
            const partnerNumber = seat.seat_number % 2 !== 0 ? seat.seat_number + 1 : seat.seat_number - 1;
            const partnerSeat = seatData.seats.find(s => s.row_letter === seat.row_letter && s.seat_number === partnerNumber);

            if (partnerSeat) {
                if (partnerSeat.status === 'booked' || (partnerSeat.status === 'held' && !mySelectedSeats.includes(partnerSeat.id))) {
                    toast.error('Một nửa của cặp ghế này đã bị chọn mất!');
                    return;
                }
                seatsToProcess.push(partnerSeat);
            }
        }

        const isDeselecting = mySelectedSeats.includes(seat.id) || seat.status === 'held_by_me';

        try {
            if (isDeselecting) {
                // --- LOGIC BỎ CHỌN ---
                await Promise.all(seatsToProcess.map(s => bookingApi.unholdSeat({ showtimeId, seatId: s.id })));
                const idsToRemove = seatsToProcess.map(s => s.id);
                setMySelectedSeats(prev => prev.filter(id => !idsToRemove.includes(id)));
            } else {
                // --- LOGIC CHỌN MỚI & GIA HẠN GHẾ CŨ ---
                await Promise.all(seatsToProcess.map(s => bookingApi.holdSeat({ showtimeId, seatId: s.id })));

                // Gia hạn các ghế đã chọn trước đó để đồng bộ 300s trong Redis
                const oldSeats = mySelectedSeats.filter(id => !seatsToProcess.map(s => s.id).includes(id));
                if (oldSeats.length > 0) {
                    await Promise.all(oldSeats.map(id => bookingApi.holdSeat({ showtimeId, seatId: id })));
                }

                setMySelectedSeats(prev => [...prev, ...seatsToProcess.map(s => s.id)]);
                setTimeLeft(300); // Reset đồng hồ UI
            }
            refetch(); // Cập nhật lại sơ đồ ngay lập tức
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thao tác thất bại');
        }
    };

    const handleCheckout = async () => {
        if (mySelectedSeats.length === 0) return;
        setProcessing(true);
        try {
            const res = await bookingApi.createPayment({
                showtimeId,
                seatIds: mySelectedSeats
            });
            window.location.href = res.data.paymentUrl;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khởi tạo thanh toán');
            setProcessing(false);
        }
    };

    // --- CÁC HÀM TÍNH TOÁN HIỂN THỊ ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const basePrice = parseFloat(seatData?.showtime_info?.base_price || 0);

    const getGroupedCartItems = () => {
        if (!seatData) return [];
        const items = [];
        const processedIds = new Set();
        const selectedDetails = mySelectedSeats.map(id => seatData.seats.find(s => s.id === id)).filter(Boolean);

        selectedDetails.forEach(seat => {
            if (processedIds.has(seat.id)) return;

            if (seat.type === 'sweetbox') {
                const partnerNum = seat.seat_number % 2 !== 0 ? seat.seat_number + 1 : seat.seat_number - 1;
                const partnerSeat = selectedDetails.find(s => s.row_letter === seat.row_letter && s.seat_number === partnerNum);

                if (partnerSeat) {
                    items.push({
                        id: `${seat.id}-${partnerSeat.id}`,
                        label: `Sweetbox ${seat.row_letter}${Math.min(seat.seat_number, partnerSeat.seat_number)}-${seat.row_letter}${Math.max(seat.seat_number, partnerSeat.seat_number)}`,
                        price: (basePrice + 50000) * 2
                    });
                    processedIds.add(seat.id);
                    processedIds.add(partnerSeat.id);
                    return;
                }
            }

            let price = basePrice;
            let typeLabel = 'Thường';
            if (seat.type === 'vip') { price += 20000; typeLabel = 'VIP'; }
            if (seat.type === 'sweetbox') { price += 50000; typeLabel = 'Sweetbox'; }

            items.push({
                id: seat.id,
                label: `Ghế ${seat.row_letter}${seat.seat_number} (${typeLabel})`,
                price: price
            });
            processedIds.add(seat.id);
        });
        return items;
    };

    const groupedCartItems = getGroupedCartItems();
    const totalPrice = groupedCartItems.reduce((sum, item) => sum + item.price, 0);

    const getSeatClassName = (seat) => {
        const base = 'border border-transparent px-1 py-[9px] text-[12px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-80';

        if (mySelectedSeats.includes(seat.id)) {
            return `${base} bg-[#1f8d52] border-white scale-[1.08]`;
        }

        if (seat.status === 'booked') {
            return `${base} bg-[#b0232f]`;
        }

        if (seat.status === 'held' && !mySelectedSeats.includes(seat.id)) {
            return `${base} bg-[#b2720a]`;
        }

        if (seat.type === 'vip') {
            return `${base} bg-[#5f45ad]`;
        }

        if (seat.type === 'sweetbox') {
            return `${base} bg-[#b65a10]`;
        }

        return `${base} bg-[#64748b]`;
    };

    if (isLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải rạp chiếu...</div>;
    if (!seatData) return <div className="py-10 text-center text-[#7b6446]">Không tìm thấy rạp!</div>;

    return (
        <div className="mx-auto mt-10 flex w-full max-w-[1080px] flex-wrap gap-6 px-5 md:mt-8 md:px-4">
            {/* CỘT TRÁI: SƠ ĐỒ GHẾ */}
            <div className="flex-[1_1_620px] border border-[#ddcbb6] bg-white p-8 shadow-[0_8px_22px_rgba(76,45,17,0.10)] lg:basis-[560px] md:p-6 sm:p-5">
                <h3 className="m-0 text-center font-display text-lg tracking-[0.08em] text-brand-500">MÀN HÌNH</h3>
                <div className="mx-auto mb-8 mt-3 h-[6px] w-[82%] bg-[#cfb596]"></div>

                <div className="grid grid-cols-10 gap-2 md:grid-cols-8 sm:grid-cols-6 min-[0px]:max-[420px]:grid-cols-5">
                    {seatData.seats.map(seat => {
                        return (
                            <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.status === 'booked' || (seat.status === 'held' && !mySelectedSeats.includes(seat.id))}
                                className={getSeatClassName(seat)}
                                type="button"
                            >
                                {seat.row_letter}{seat.seat_number}
                            </button>
                        );
                    })}
                </div>
                {/* Chú thích màu sắc */}
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-[#7b6446] min-[0px]:max-[420px]:justify-start min-[0px]:max-[420px]:gap-3">
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#64748b]"></span> Thường</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#5f45ad]"></span> VIP</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#b65a10]"></span> Đôi</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#1f8d52]"></span> Đang chọn</span>
                    <span className="inline-flex items-center gap-2"><span className="h-3 w-3 bg-[#b0232f]"></span> Đã bán</span>
                </div>
            </div>

            {/* CỘT PHẢI: HÓA ĐƠN */}
            <div className="h-fit flex-[1_1_340px] border border-[#ddcbb6] border-t-4 border-t-brand-500 bg-white p-8 shadow-[0_8px_22px_rgba(76,45,17,0.10)] md:p-6 sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-[#ddcbb6] pb-3 sm:flex-col sm:items-start sm:gap-2">
                    <h2 className="m-0 font-display text-[30px] text-[#3b2b19]">Hóa Đơn</h2>
                    {timeLeft > 0 && (
                        <div className={`px-[10px] py-[6px] font-bold text-white ${timeLeft <= 60 ? 'bg-[#b0232f]' : 'bg-[#1f8d52]'}`}>
                            ⏱ {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                <p className="mb-3 text-sm text-[#7b6446]"><strong className="text-[#3b2b19]">Phòng:</strong> {seatData.showtime_info.room_name}</p>
                <p className="mb-3 text-sm text-[#7b6446]"><strong className="text-[#3b2b19]">Thời gian:</strong> {new Date(seatData.showtime_info.start_time).toLocaleString('vi-VN')}</p>

                <div className="min-h-[180px] border border-[#ddcbb6] bg-[#fff6ec] p-4">
                    <h4 className="mb-3 mt-0 text-[#7b6446]">Giỏ hàng:</h4>
                    {groupedCartItems.length === 0 ? (
                        <p className="mt-6 text-center text-[#8c7356]">Chưa có ghế nào.</p>
                    ) : (
                        groupedCartItems.map(item => (
                            <div key={item.id} className="mb-2 flex justify-between gap-2 border-b border-dashed border-[#cfb596] pb-2">
                                <span className="text-xs font-bold text-[#1f8d52]">{item.label}</span>
                                <span className="text-sm text-[#3b2b19]">{item.price.toLocaleString()} đ</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t-2 border-[#ddcbb6] pt-4">
                    <span className="text-lg text-[#7b6446]">Tổng cộng:</span>
                    <span className="text-[30px] font-extrabold text-brand-500 min-[0px]:max-[420px]:text-[22px]">{totalPrice.toLocaleString()} đ</span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={mySelectedSeats.length === 0 || processing}
                    className="mt-5 min-h-[42px] w-full bg-brand-500 px-4 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                >
                    {processing ? 'Đang xử lý...' : 'THANH TOÁN'}
                </button>
            </div>
        </div>
    );
}