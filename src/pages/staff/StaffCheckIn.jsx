import { useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { systemApi } from '@/api/systemApi';
import { QrCode, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/core';

export default function StaffCheckIn() {
    const [scannedId, setScannedId] = useState('');
    const [lastTicket, setLastTicket] = useState(null);
    const [isScannerLocked, setIsScannerLocked] = useState(false);
    const immediateLockRef = useRef(false);
    const lastScanRef = useRef({ id: '', time: 0 });

    const RE_SCAN_COOLDOWN_MS = 6000;

    const unlockScanner = () => {
        setTimeout(() => {
            immediateLockRef.current = false;
            setIsScannerLocked(false);
        }, 2200);
    };

    const checkInMutation = useMutation({
        mutationFn: (ticketId) => systemApi.checkInTicket(ticketId),
        onSuccess: (res) => {
            const ticket = res?.data;
            const seatLabel =
                ticket?.seat?.row_letter && ticket?.seat?.seat_number
                    ? `${ticket.seat.row_letter}${ticket.seat.seat_number}`
                    : (ticket?.seat_code || 'N/A');
            const priceValue = Number(ticket?.price || 0);

            setLastTicket({
                id: ticket?.id || scannedId,
                seatLabel,
                priceValue,
                time: new Date().toLocaleTimeString('vi-VN'),
                status: 'success'
            });

            toast.success(
                `✅ CHECK-IN THÀNH CÔNG!\nGhế: ${seatLabel}\nGiá: ${priceValue.toLocaleString()} VNĐ`,
                { duration: 4000 }
            );
            unlockScanner();
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Không thể check-in vé này';
            setLastTicket({
                id: scannedId,
                status: 'error',
                message,
                time: new Date().toLocaleTimeString('vi-VN')
            });
            toast.error(`❌ LỖI: ${message}`, { duration: 4000 });
            unlockScanner();
        }
    });

    const handleCheckIn = (result) => {
        if (immediateLockRef.current || checkInMutation.isPending || isScannerLocked || !result || result.length === 0) return;

        const ticketId = result[0].rawValue;
        if (!ticketId) return;

        const now = Date.now();
        const isRecentDuplicate =
            lastScanRef.current.id === ticketId &&
            now - lastScanRef.current.time < RE_SCAN_COOLDOWN_MS;

        if (isRecentDuplicate) return;

        immediateLockRef.current = true;
        lastScanRef.current = { id: ticketId, time: now };

        setIsScannerLocked(true);
        setScannedId(ticketId);

        checkInMutation.mutate(ticketId);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Main Scanner Card & Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* QR Scanner Area */}
                <div className="lg:col-span-7">
                    <div className="glass-card rounded-md border border-white/10 p-5 sm:p-6 shadow-cinematic space-y-4">
                        <p className="text-xs text-cinema-text-muted">
                            Hướng camera về phía mã QR trên vé của khách hàng để hệ thống tự động xác thực và check-in.
                        </p>

                        <div className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-md border border-cinema-gold/30 bg-cinema-bg/90 aspect-square shadow-glow-gold-sm">
                            <Scanner
                                onScan={handleCheckIn}
                                allowMultiple={false}
                                scanDelay={2000}
                            />

                            {(checkInMutation.isPending || isScannerLocked) && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center text-white space-y-2">
                                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-cinema-gold border-t-transparent" />
                                    <span className="text-sm font-bold text-cinema-gold">Đang xác thực vé...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status & Last Scan Panel */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Live Ticket Info */}
                    <div className="glass-card rounded-md border border-white/10 p-5 shadow-cinematic space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                            <Sparkles className="w-4 h-4 text-cinema-gold" />
                            <h3 className="m-0 font-display text-sm font-bold text-cinema-text">
                                Kết Quả Quét Gần Nhất
                            </h3>
                        </div>

                        {lastTicket ? (
                            <div className={`p-4 rounded-md border ${
                                lastTicket.status === 'success'
                                    ? 'border-emerald-500/30 bg-emerald-500/10'
                                    : 'border-rose-500/30 bg-rose-500/10'
                            } space-y-2`}>
                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                        lastTicket.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                        {lastTicket.status === 'success' ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" /> CHECK-IN HỢP LỆ
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" /> TỪ CHỐI / LỖI
                                            </>
                                        )}
                                    </span>
                                    <span className="text-[10px] text-cinema-text-dim">{lastTicket.time}</span>
                                </div>

                                {lastTicket.status === 'success' ? (
                                    <div className="space-y-1 pt-1 text-xs text-cinema-text">
                                        <p>Vị trí ghế: <strong className="text-cinema-gold font-mono text-sm">{lastTicket.seatLabel}</strong></p>
                                        <p>Giá vé: <strong>{lastTicket.priceValue?.toLocaleString()} VNĐ</strong></p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-rose-300 pt-1">{lastTicket.message}</p>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-xs text-cinema-text-dim border border-dashed border-white/10 rounded-md">
                                Chưa có vé nào được quét trong phiên làm việc này.
                            </div>
                        )}

                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-cinema-text-dim mb-1.5">
                                Mã vé vừa nhận diện:
                            </p>
                            <code className="block break-all rounded-md border border-white/10 bg-cinema-surface px-3 py-2 text-xs font-mono text-cinema-gold">
                                {scannedId || 'Đang chờ quét mã QR...'}
                            </code>
                        </div>
                    </div>

                    {/* Operational Note */}
                    <div className="glass-card rounded-md border border-cinema-gold/20 bg-cinema-gold/5 p-4 text-xs text-cinema-text-muted flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-cinema-gold shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Vé hợp lệ sẽ được chuyển sang trạng thái <strong>ĐÃ SỬ DỤNG</strong> ngay lập tức để ngăn chặn hành vi sử dụng lại vé nhiều lần.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}