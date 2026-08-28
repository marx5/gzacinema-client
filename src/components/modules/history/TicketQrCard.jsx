import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/core';
import { Clock, Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import { TICKET_STATUS_CONFIG } from '@/models/booking.model';

const STATUS_ICONS = {
  check: <CheckCircle2 className="w-3 h-3" />,
  clock: <Clock className="w-3 h-3" />,
  ban: <Ban className="w-3 h-3" />,
  alert: <AlertCircle className="w-3 h-3" />,
};

export default function TicketQrCard({ ticket }) {
  if (!ticket) return null;

  const statusConfig =
    TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.expired;

  return (
    <div className="relative flex items-center justify-between p-4 rounded-2xl bg-cinema-surface-elevated/80 border border-white/5 shadow-card hover:border-cinema-gold/30 transition-all gap-4">
      {/* Ticket Left Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white">
            Ghế {ticket.seatName}
          </span>
          {ticket.seatType && (
            <Badge variant="purple" size="sm">
              {ticket.seatType}
            </Badge>
          )}
        </div>
        <div>
          <Badge
            variant={statusConfig.variant}
            size="sm"
            icon={STATUS_ICONS[statusConfig.icon]}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-inner flex-shrink-0">
        <QRCodeSVG
          value={ticket.id}
          size={72}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
        />
        <span className="text-[9px] font-mono font-bold text-black mt-0.5">SCAN ME</span>
      </div>
    </div>
  );
}

