import { useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Badge, Modal } from '@/components/core';
import { Clock, Ban, CheckCircle2, AlertCircle, Maximize2, MapPin, Calendar, Ticket as TicketIcon } from 'lucide-react';
import { TICKET_STATUS_CONFIG } from '@/models/booking.model';
import { formatDateTime } from '@/utils/formatters';

const STATUS_ICONS = {
  check: <CheckCircle2 className="w-3 h-3" />,
  clock: <Clock className="w-3 h-3" />,
  ban: <Ban className="w-3 h-3" />,
  alert: <AlertCircle className="w-3 h-3" />,
};

export default function TicketQrCard({ ticket, booking }) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (!ticket) return null;

  const statusConfig =
    TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.expired;

  const shortTicketId = String(ticket.id || '').includes('-')
    ? String(ticket.id).split('-')[0].toUpperCase()
    : String(ticket.id || '').slice(0, 8).toUpperCase();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsZoomOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsZoomOpen(true);
          }
        }}
        className="group relative flex items-center justify-between p-4 rounded-2xl bg-cinema-surface-elevated/80 border border-white/5 shadow-card hover:border-cinema-gold/40 hover:bg-cinema-surface-elevated transition-all gap-4 cursor-pointer active:scale-[0.99]"
      >
        {/* Ticket Left Info */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-black text-white group-hover:text-cinema-gold transition-colors">
              Ghế {ticket.seatName}
            </span>
            {ticket.seatType && (
              <Badge variant="purple" size="sm">
                {ticket.seatType}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={statusConfig.variant}
              size="sm"
              icon={STATUS_ICONS[statusConfig.icon]}
            >
              {statusConfig.label}
            </Badge>
            <span className="text-[11px] font-mono text-cinema-text-dim">
              #{shortTicketId}
            </span>
          </div>
          <p className="text-[11px] text-cinema-gold/80 font-medium flex items-center gap-1 pt-0.5">
            <Maximize2 className="w-3 h-3" />
            <span>Chạm để phóng to QR</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
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

      {/* Full-Size QR Code Modal */}
      <Modal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        className="max-w-md"
      >
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2 text-base sm:text-lg">
            <TicketIcon className="w-5 h-5 text-cinema-gold" />
            <span>Vé Điện Tử • Ghế {ticket.seatName}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex flex-col items-center text-center space-y-5">
          {/* Movie & Showtime Context */}
          {booking && (
            <div className="w-full space-y-1.5 bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
              <h4 className="text-base font-black text-white line-clamp-1">
                {booking.movieTitle}
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-cinema-text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
                  {booking.cinemaName
                    ? `${booking.cinemaName} • ${booking.roomName}`
                    : booking.roomName}
                </span>
                {booking.startTime && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
                    {formatDateTime(booking.startTime)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* High-Contrast QR Code Canvas */}
          <div className="p-5 rounded-2xl bg-white shadow-2xl border-4 border-cinema-gold/40 flex flex-col items-center">
            <QRCodeCanvas
              value={ticket.id}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
            <span className="mt-2.5 text-xs font-mono font-bold text-slate-900 tracking-wider">
              #{ticket.id}
            </span>
          </div>

          {/* Seat & Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Badge variant="gold" size="md" className="text-sm font-black px-3 py-1">
              Ghế {ticket.seatName} {ticket.seatType ? `(${ticket.seatType})` : ''}
            </Badge>
            <Badge
              variant={statusConfig.variant}
              size="md"
              icon={STATUS_ICONS[statusConfig.icon]}
            >
              {statusConfig.label}
            </Badge>
          </div>

          <p className="text-xs text-cinema-text-dim max-w-xs">
            Vui lòng đưa mã QR này cho nhân viên tại quầy soát vé để vào phòng chiếu.
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
}

