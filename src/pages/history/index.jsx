import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { authApi } from '../../api/authApi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Breadcrumb } from '../../components/layouts';
import { Badge } from '../../components/core';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock, Ban } from 'lucide-react';

export default function History() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await authApi.getHistory();
      return res.data?.history || res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-20 flex flex-col items-center justify-center gap-4 text-cinema-text-muted animate-pulse">
        <Ticket className="w-12 h-12 text-cinema-gold animate-bounce" />
        <p className="text-base font-semibold">Đang tải danh sách vé điện tử...</p>
      </div>
    );
  }

  const getTicketStatusBadge = (status) => {
    if (status === 'used') {
      return <Badge variant="dark" size="sm" icon={<Clock className="w-3 h-3" />}>ĐÃ SỬ DỤNG</Badge>;
    }
    if (status === 'refunded') {
      return <Badge variant="rose" size="sm" icon={<Ban className="w-3 h-3" />}>ĐÃ HOÀN TIỀN</Badge>;
    }
    return <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>HỢP LỆ</Badge>;
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Vé của tôi' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-cinema-gold" />
          Vé Điện Tử Của Tôi
        </h1>
        <Badge variant="glass" size="md">
          Tổng cộng: {history.length} đơn hàng
        </Badge>
      </div>

      {history.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center border border-white/10 space-y-3">
          <Ticket className="w-12 h-12 text-cinema-text-dim mx-auto" />
          <h3 className="text-lg font-bold text-white">Chưa có vé nào được đặt</h3>
          <p className="text-sm text-cinema-text-muted max-w-md mx-auto">
            Khám phá ngay các bộ phim bom tấn đang chiếu tại rạp và đặt vé trải nghiệm!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {history.map((booking) => {
            const st = booking.showtime;
            return (
              <div
                key={booking.id}
                className="relative overflow-hidden rounded-3xl glass-card border border-white/10 shadow-cinematic p-6 sm:p-8 space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" size="sm">E-Ticket Pass</Badge>
                      <span className="text-xs text-cinema-text-dim font-mono">
                        Mã đơn: #{booking.id.split('-')[0].toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white">{st.movie.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-cinema-text-muted">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
                        {st.room.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
                        {formatDateTime(st.start_time)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-cinema-text-dim">Tổng thanh toán</p>
                    <p className="text-2xl font-black text-cinema-gold">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Tickets grid */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-cinema-text-dim">
                    Danh sách vé xem phim ({booking.tickets.length} ghế)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="relative flex items-center justify-between p-4 rounded-2xl bg-cinema-surface-elevated/80 border border-white/5 shadow-card hover:border-cinema-gold/30 transition-all gap-4"
                      >
                        {/* Ticket left info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-white">
                              Ghế {ticket.seat.row_letter}{ticket.seat.seat_number}
                            </span>
                            <Badge variant="purple" size="sm">
                              {ticket.seat.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div>{getTicketStatusBadge(ticket.status)}</div>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-inner flex-shrink-0">
                          <QRCodeSVG
                            value={ticket.id}
                            size={72}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"M"}
                          />
                          <span className="text-[9px] font-mono font-bold text-black mt-0.5">SCAN ME</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
