import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');

        if (responseCode === '00') {
            setStatus('success');
        } else {
            setStatus('error');
        }
    }, [searchParams]);

    return (
        <div className="mx-auto mt-10 w-full max-w-[560px] px-5 md:mt-8 md:px-4">
            <div className="border border-[#ddcbb6] border-t-4 border-t-brand-500 bg-white p-8 text-center shadow-[0_8px_22px_rgba(76,45,17,0.10)] md:p-6">
                {status === 'processing' && (
                    <>
                        <div className="mb-4 text-[60px] leading-none">...</div>
                        <h2 className="m-0 font-display text-[34px] text-[#3b2b19] md:text-[30px]">Đang xử lý kết quả...</h2>
                        <p className="mt-3 text-[14px] text-[#7b6446]">Hệ thống đang xác nhận giao dịch với cổng thanh toán.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mb-4 text-[60px] leading-none">Thanh toan OK</div>
                        <h2 className="m-0 font-display text-[34px] text-[#1f8d52] md:text-[30px]">Thanh toán thành công!</h2>
                        <p className="mt-3 text-[14px] text-[#7b6446]">Cảm ơn bạn đã đặt vé tại Gzacinema.</p>
                        <div className="mt-6">
                            <Link to="/history">
                                <button className="btn btn-primary" type="button">Xem vé của tôi</button>
                            </Link>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mb-4 text-[60px] leading-none">Thanh toan loi</div>
                        <h2 className="m-0 font-display text-[34px] text-[#b0232f] md:text-[30px]">Thanh toán thất bại!</h2>
                        <p className="mt-3 text-[14px] text-[#7b6446]">Giao dịch đã bị hủy hoặc xảy ra lỗi.</p>
                        <div className="mt-6">
                            <Link to="/">
                                <button className="btn btn-secondary" type="button">Về trang chủ</button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}