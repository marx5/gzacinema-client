import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { systemApi } from '../../api/systemApi';
import Breadcrumb from '../../components/Breadcrumb';

export default function StaffCheckIn() {
    const [scannedId, setScannedId] = useState('');
    const [isScannerLocked, setIsScannerLocked] = useState(false);

    const checkInMutation = useMutation({
        mutationFn: (ticketId) => systemApi.checkInTicket(ticketId),
        onSuccess: (res) => {
            toast.success(
                `✅ CHECK-IN THÀNH CÔNG!\nGhế: ${res.data.seat.row_letter}${res.data.seat.seat_number}\nGiá: ${parseInt(res.data.price).toLocaleString()} VNĐ`,
                { duration: 4000 }
            );
            setTimeout(() => setIsScannerLocked(false), 1200);
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Không thể check-in vé này';
            toast.error(`❌ LỖI: ${message}`, { duration: 4000 });
            setTimeout(() => setIsScannerLocked(false), 1200);
        }
    });

    const handleCheckIn = (result) => {
        if (checkInMutation.isLoading || isScannerLocked || !result || result.length === 0) return;

        const ticketId = result[0].rawValue;
        if (!ticketId) return;

        setIsScannerLocked(true);
        setScannedId(ticketId);

        checkInMutation.mutate(ticketId);
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4">
            <Breadcrumb items={[{ label: 'Nhân viên', link: '/staff/checkin' }, { label: 'Soát vé QR' }]} />
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19] min-[0px]:max-[420px]:text-[28px]">Soát Vé (Check-in)</h1>
            <p className="mb-0 mt-3 text-sm text-[#7b6446]">Đưa mã QR của khách hàng vào khung hình</p>

            <div className="mt-4 mx-auto w-full max-w-[820px] border border-[#ddcbb6] bg-white p-3 sm:p-4 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                <div className="relative mx-auto w-full overflow-hidden rounded-md border border-[#eadfce] bg-[#f8f2e9] aspect-square">
                    <Scanner
                        onScan={handleCheckIn}
                        allowMultiple={false}
                        scanDelay={2000}
                    />

                    {(checkInMutation.isLoading || isScannerLocked) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(21,34,56,0.7)] p-4 text-center text-white">
                            <strong>Đang xác thực vé...</strong>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 border border-[#ddcbb6] bg-[#fff6ec] p-4">
                <p className="mb-2 mt-0 text-xs uppercase tracking-[0.06em] text-[#8c7356]">ID vừa quét:</p>
                <code className="break-all bg-[#3b2b19] px-[10px] py-[6px] text-xs text-[#fff6ec]">
                    {scannedId || 'Đang chờ quét...'}
                </code>
            </div>

            <div className="mt-5 border-l-4 border-l-[#cfb596] bg-[#fff6ec] px-4 py-3 text-sm text-[#7b6446]">
                Giao diện dành riêng cho nhân viên soát vé tại cửa phòng chiếu.
            </div>
        </div>
    );
}