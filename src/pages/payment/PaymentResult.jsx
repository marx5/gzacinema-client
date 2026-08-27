import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Home, Ticket } from 'lucide-react';
import { Button } from '../../components/core';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('processing');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');

    const timer = setTimeout(() => {
      if (responseCode === '00') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    let timer;
    if (status === 'success') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/history');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="mx-auto my-16 w-full max-w-lg px-4">
      <div className="relative overflow-hidden rounded-3xl glass-card border border-white/10 p-8 sm:p-10 text-center shadow-cinematic">
        {/* Status Line */}
        <div
          className={`absolute top-0 left-0 h-1.5 w-full transition-colors duration-500 ${
            status === 'success'
              ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]'
              : status === 'error'
              ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
              : 'bg-cinema-gold shadow-[0_0_15px_rgba(234,179,8,0.8)]'
          }`}
        />

        {status === 'processing' && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cinema-gold/15 border border-cinema-gold/30 text-cinema-gold">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-white">Đang xử lý giao dịch...</h2>
            <p className="text-sm text-cinema-text-muted max-w-xs">
              Hệ thống đang xác nhận thanh toán với ngân hàng. Vui lòng không đóng trình duyệt.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-5 py-4 animate-scaleUp">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-glow-purple">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Thanh Toán Thành Công!</h2>
              <p className="text-sm text-cinema-text-muted mt-2">
                Vé điện tử đã được phát hành. Chúc bạn có một trải nghiệm xem phim tuyệt vời tại GzaCinema!
              </p>
            </div>

            {/* Countdown card */}
            <div className="w-full rounded-2xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
              <p className="text-xs font-semibold text-cinema-text-muted">
                Tự động chuyển hướng tới <strong className="text-cinema-gold">Vé Của Tôi</strong> sau {countdown}s
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gold-gradient transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Link to="/history" className="w-full">
                <Button variant="primary" size="md" className="w-full" leftIcon={<Ticket className="w-4 h-4" />}>
                  Xem Vé Của Tôi
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-5 py-4 animate-scaleUp">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <XCircle className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Thanh Toán Thất Bại</h2>
              <p className="text-sm text-cinema-text-muted mt-2">
                Giao dịch đã bị huỷ hoặc xảy ra lỗi kết nối với cổng thanh toán VNPAY.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full pt-2">
              <Link to="/" className="w-full">
                <Button variant="secondary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
                  Quay Lại Trang Chủ
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
