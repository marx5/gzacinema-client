import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('processing');
    const [countdown, setCountdown] = useState(5); // Đếm ngược 5 giây

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');

        // Tạo một khoảng trễ nhỏ (1 giây) để user kịp nhìn thấy trạng thái "Đang xử lý",
        // giúp trải nghiệm mượt mà hơn thay vì chớp tắt đột ngột.
        const timer = setTimeout(() => {
            if (responseCode === '00') {
                setStatus('success');
            } else {
                setStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchParams]);

    // Hook xử lý đếm ngược và tự động chuyển hướng
    useEffect(() => {
        let timer;
        if (status === 'success') {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/history'); // Tự động chuyển về trang lịch sử
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status, navigate]);

    return (
        <div className="mx-auto mt-12 w-full max-w-[500px] px-5 md:mt-8 md:px-4 mb-20">
            <div className="relative overflow-hidden border border-[#ddcbb6] bg-white p-8 text-center shadow-[0_12px_32px_rgba(76,45,17,0.12)] md:p-6 transition-all duration-500">

                <div className={`absolute top-0 left-0 h-1.5 w-full transition-colors duration-500 ${status === 'success' ? 'bg-[#1f8d52]' : status === 'error' ? 'bg-[#b0232f]' : 'bg-brand-500'
                    }`} />

                {status === 'processing' && (
                    <div className="flex flex-col items-center transition-opacity duration-500">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f6efe3]">
                            <svg className="h-10 w-10 animate-spin text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h2 className="m-0 font-display text-[28px] font-bold text-[#3b2b19]">Đang xử lý...</h2>
                        <p className="mt-3 text-[15px] leading-relaxed text-[#7b6446]">Hệ thống đang xác nhận giao dịch<br />Vui lòng không đóng trang này.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center transition-opacity duration-500">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f5ed]">
                            <svg className="h-10 w-10 text-[#1f8d52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="m-0 font-display text-[28px] font-bold text-[#1f8d52]">Thanh toán thành công!</h2>
                        <p className="mt-3 text-[15px] leading-relaxed text-[#7b6446]">Cảm ơn bạn đã đặt vé tại Gzacinema.<br />Chúc bạn xem phim vui vẻ!</p>

                        <div className="mt-8 w-full bg-[#f6efe3] p-4 border border-[#ddcbb6]">
                            <p className="m-0 text-sm font-bold text-[#3b2b19]">
                                Chuyển đến <span className="text-brand-500">Vé của tôi</span> sau {countdown} giây
                            </p>
                            <div className="mt-3 h-1.5 w-full overflow-hidden bg-[#e0d4c3]">
                                <div
                                    className="h-full bg-brand-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 5) * 100}%` }}
                                />
                            </div>
                        </div>

                        <Link to="/history" className="mt-6 w-full">
                            <button className="w-full bg-brand-500 px-4 py-[14px] text-sm font-bold tracking-wider text-white transition hover:bg-brand-600 hover:shadow-lg" type="button">
                                XEM VÉ CỦA TÔI NGAY
                            </button>
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center transition-opacity duration-500">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fceceb]">
                            <svg className="h-10 w-10 text-[#b0232f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="m-0 font-display text-[28px] font-bold text-[#b0232f]">Thanh toán thất bại!</h2>
                        <p className="mt-3 text-[15px] leading-relaxed text-[#7b6446]">Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình kết nối với cổng thanh toán.</p>

                        <div className="mt-8 flex w-full flex-col gap-3">
                            <Link to="/" className="w-full">
                                <button className="w-full bg-[#cfb596] px-4 py-[14px] text-sm font-bold tracking-wider text-white transition hover:bg-[#b59b7a]" type="button">
                                    VỀ TRANG CHỦ
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}