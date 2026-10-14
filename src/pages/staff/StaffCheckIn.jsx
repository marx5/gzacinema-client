import { useRef, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { systemApi } from '@/api/systemApi';
import {
    QrCode,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Camera,
    CameraOff,
    Keyboard,
    History,
    Trash2
} from 'lucide-react';
import { Button, Badge } from '@/components/core';
import { formatCurrency } from '@/utils/formatters';

export default function StaffCheckIn() {
    const [scannedId, setScannedId] = useState('');
    const [manualId, setManualId] = useState('');
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [lastTicket, setLastTicket] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [isScannerLocked, setIsScannerLocked] = useState(false);

    const immediateLockRef = useRef(false);
    const lastScanRef = useRef({ id: '', time: 0 });

    const RE_SCAN_COOLDOWN_MS = 5000;

    const unlockScanner = () => {
        setTimeout(() => {
            immediateLockRef.current = false;
            setIsScannerLocked(false);
        }, 1800);
    };

    const checkInMutation = useMutation({
        mutationFn: (ticketId) => systemApi.checkInTicket(ticketId),
        onSuccess: (res, ticketId) => {
            const ticket = res?.data;
            const seatLabel =
                ticket?.seat?.row_letter && ticket?.seat?.seat_number
                    ? `${ticket.seat.row_letter}${ticket.seat.seat_number}`
                    : (ticket?.seat_code || 'Hợp lệ');
            const priceValue = Number(ticket?.price || 0);
            const timeStr = new Date().toLocaleTimeString('vi-VN');

            const entry = {
                id: ticket?.id || ticketId,
                seatLabel,
                priceValue,
                time: timeStr,
                status: 'success'
            };

            setLastTicket(entry);
            setScanHistory((prev) => [entry, ...prev].slice(0, 30));

            toast.success(
                `CHECK-IN THÀNH CÔNG! Ghế: ${seatLabel}`,
                { duration: 3500 }
            );
            unlockScanner();
        },
        onError: (error, ticketId) => {
            const message = error.response?.data?.message || 'Không thể check-in vé này';
            const timeStr = new Date().toLocaleTimeString('vi-VN');

            const entry = {
                id: ticketId,
                status: 'error',
                message,
                time: timeStr
            };

            setLastTicket(entry);
            setScanHistory((prev) => [entry, ...prev].slice(0, 30));

            toast.error(`TỪ CHỐI: ${message}`, { duration: 4000 });
            unlockScanner();
        }
    });

    const triggerCheckIn = (rawTicketId) => {
        const ticketId = (rawTicketId || '').trim();
        if (!ticketId) return;

        immediateLockRef.current = true;
        lastScanRef.current = { id: ticketId, time: Date.now() };

        setIsScannerLocked(true);
        setScannedId(ticketId);
        checkInMutation.mutate(ticketId);
    };

    const handleCameraScan = (result) => {
        if (
            !isCameraEnabled ||
            immediateLockRef.current ||
            checkInMutation.isPending ||
            isScannerLocked ||
            !result ||
            result.length === 0
        ) {
            return;
        }

        const ticketId = result[0]?.rawValue;
        if (!ticketId) return;

        const now = Date.now();
        const isRecentDuplicate =
            lastScanRef.current.id === ticketId &&
            now - lastScanRef.current.time < RE_SCAN_COOLDOWN_MS;

        if (isRecentDuplicate) return;

        triggerCheckIn(ticketId);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualId.trim()) {
            toast.error('Vui lòng nhập hoặc dán mã vé cần soát');
            return;
        }
        triggerCheckIn(manualId.trim());
        setManualId('');
    };

    const successCount = scanHistory.filter((i) => i.status === 'success').length;
    const errorCount = scanHistory.filter((i) => i.status === 'error').length;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 6 Cols: Manual Input + Camera QR Scanner */}
                <div className="lg:col-span-6 space-y-4">
                    {/* Manual Ticket ID / USB Barcode Scanner Input */}
                    <div className="rounded-md border border-white/10 bg-[#121324] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                                <Keyboard className="w-4 h-4 text-cinema-gold" />
                                Nhập Mã Vé / Máy Quét Cầm Tay
                            </h3>
                            <span className="text-[11px] text-cinema-text-dim">Nhấn Enter để xác thực</span>
                        </div>

                        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="Dán hoặc nhập mã vé (UUID) vào đây..."
                                className="flex-1 rounded-md border border-white/10 bg-[#0E101E] px-3.5 py-2 text-xs font-mono text-white placeholder:text-cinema-text-dim outline-none focus:border-cinema-gold"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                isLoading={checkInMutation.isPending}
                                className="rounded-md font-bold tracking-wide shrink-0"
                            >
                                Xác Thực Vé
                            </Button>
                        </form>
                    </div>

                    {/* Camera QR Scanner Card */}
                    <div className="rounded-md border border-white/10 bg-[#121324] p-4 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div>
                                <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                                    <QrCode className="w-4 h-4 text-cinema-gold" />
                                    Quét Mã QR Bằng Camera
                                </h3>
                                <p className="m-0 text-[11px] text-cinema-text-dim mt-0.5">
                                    Đưa mã QR trên vé điện tử vào khung ngắm để tự động check-in
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCameraEnabled((prev) => !prev)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition cursor-pointer ${
                                    isCameraEnabled
                                        ? 'border-white/15 bg-[#1B1E36] text-cinema-text hover:text-white'
                                        : 'border-cinema-gold/40 bg-cinema-gold/15 text-cinema-gold'
                                }`}
                            >
                                {isCameraEnabled ? (
                                    <>
                                        <CameraOff className="w-3.5 h-3.5" />
                                        <span>Tắt Camera</span>
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>Bật Camera</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-md border border-white/15 bg-[#0B0C16] aspect-square flex items-center justify-center">
                            {isCameraEnabled ? (
                                <Scanner
                                    onScan={handleCameraScan}
                                    allowMultiple={false}
                                    scanDelay={2000}
                                />
                            ) : (
                                <div className="text-center p-6 space-y-2 text-cinema-text-dim">
                                    <CameraOff className="w-10 h-10 mx-auto opacity-50" />
                                    <p className="text-xs font-medium">Camera đang tạm tắt để tiết kiệm tài nguyên.</p>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsCameraEnabled(true)}
                                        className="rounded-md text-xs mt-1"
                                    >
                                        Kích hoạt lại Camera
                                    </Button>
                                </div>
                            )}

                            {(checkInMutation.isPending || isScannerLocked) && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-4 text-center text-white space-y-2">
                                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                                    <span className="text-xs font-bold text-cinema-gold">Đang kiểm tra trạng thái vé...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right 6 Cols: Latest Result + Session Scan History */}
                <div className="lg:col-span-6 space-y-4">
                    {/* Live Ticket Result */}
                    <div className="rounded-md border border-white/10 bg-[#121324] p-4 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="m-0 font-display text-sm font-bold text-white">
                                Kết Quả Xác Thực Gần Nhất
                            </h3>
                            {lastTicket && (
                                <span className="text-xs text-cinema-text-dim tabular-nums">
                                    Lúc {lastTicket.time}
                                </span>
                            )}
                        </div>

                        {lastTicket ? (
                            <div className={`p-4 rounded-md border ${
                                lastTicket.status === 'success'
                                    ? 'border-emerald-500/40 bg-emerald-500/10'
                                    : 'border-rose-500/40 bg-rose-500/10'
                            } space-y-2.5`}>
                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1.5 text-sm font-black uppercase ${
                                        lastTicket.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                        {lastTicket.status === 'success' ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" /> VÉ HỢP LỆ — CHO PHÉP VÀO RẠP
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" /> TỪ CHỐI CHECK-IN
                                            </>
                                        )}
                                    </span>
                                </div>

                                {lastTicket.status === 'success' ? (
                                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                                        <div className="rounded bg-black/25 p-2.5 border border-white/10">
                                            <span className="text-[10px] uppercase text-cinema-text-dim block">Vị trí ghế</span>
                                            <strong className="text-lg font-mono font-black text-cinema-gold">{lastTicket.seatLabel}</strong>
                                        </div>
                                        <div className="rounded bg-black/25 p-2.5 border border-white/10">
                                            <span className="text-[10px] uppercase text-cinema-text-dim block">Mệnh giá vé</span>
                                            <strong className="text-sm font-bold text-white tabular-nums">{formatCurrency(lastTicket.priceValue)}</strong>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="m-0 text-xs font-semibold text-rose-200">{lastTicket.message}</p>
                                )}

                                <div className="pt-1 text-[11px] font-mono text-cinema-text-dim break-all">
                                    Mã vé: {lastTicket.id}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-cinema-text-dim border border-dashed border-white/10 rounded-md">
                                Chưa có vé nào được quét trong phiên làm việc này.
                            </div>
                        )}

                        {scannedId && (
                            <div className="flex items-center justify-between rounded border border-white/10 bg-[#0E101E] px-3 py-2 text-xs">
                                <span className="text-cinema-text-dim">Mã nhận diện cuối:</span>
                                <code className="font-mono text-cinema-gold truncate max-w-[260px]">{scannedId}</code>
                            </div>
                        )}
                    </div>

                    {/* Session Scan History */}
                    <div className="rounded-md border border-white/10 bg-[#121324] overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/10 bg-[#16182D] px-4 py-3">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-cinema-gold" />
                                <h3 className="m-0 font-display text-sm font-bold text-white">
                                    Lịch Sử Soát Vé Phiên Này ({scanHistory.length})
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="emerald" size="sm">{successCount} đạt</Badge>
                                <Badge variant="rose" size="sm">{errorCount} lỗi</Badge>
                                {scanHistory.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setScanHistory([])}
                                        title="Xóa lịch sử phiên"
                                        className="p-1 rounded text-cinema-text-dim hover:text-white cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {scanHistory.length === 0 ? (
                            <div className="py-10 text-center text-xs text-cinema-text-dim">
                                Danh sách vé vừa soát sẽ hiển thị tại đây.
                            </div>
                        ) : (
                            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.06]">
                                {scanHistory.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {item.status === 'success' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold text-white truncate">
                                                    {item.status === 'success'
                                                        ? `Ghế ${item.seatLabel} — ${formatCurrency(item.priceValue)}`
                                                        : item.message}
                                                </div>
                                                <div className="font-mono text-[11px] text-cinema-text-dim truncate">
                                                    {item.id}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] text-cinema-text-dim tabular-nums shrink-0">
                                            {item.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Operational Note */}
                    <div className="rounded-md border border-cinema-gold/20 bg-cinema-gold/5 p-3.5 text-xs text-cinema-text-muted flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-cinema-gold shrink-0 mt-0.5" />
                        <p className="m-0 leading-relaxed">
                            Vé hợp lệ sau khi xác thực sẽ chuyển ngay sang trạng thái <strong className="text-white">ĐÃ SỬ DỤNG</strong> để chống quay vòng vé.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}