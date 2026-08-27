// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Film, Phone, Mail, Clock, ShieldCheck, Ticket, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-cinema-surface/60 backdrop-blur-md pt-16 text-cinema-text-muted">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Thương hiệu */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-cinema-bg shadow-glow-gold-sm">
                <Film className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="gold-text-gradient font-black text-2xl tracking-wider">
                GZACINEMA
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-cinema-text-muted">
              Hệ thống rạp chiếu phim chuẩn quốc tế với phòng chiếu IMAX, Laser 4K và hệ thống âm thanh vòm Dolby Atmos đỉnh cao.
            </p>
            <div className="flex items-center gap-2 text-xs text-cinema-gold">
              <Sparkles className="w-4 h-4" />
              <span>Trải nghiệm điện ảnh xứng tầm</span>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cinema-text flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cinema-gold" />
              Khám phá
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/?tab=showing" className="hover:text-cinema-gold transition-colors">
                  Phim Đang Chiếu
                </Link>
              </li>
              <li>
                <Link to="/?tab=coming_soon" className="hover:text-cinema-gold transition-colors">
                  Phim Sắp Chiếu
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-cinema-gold transition-colors">
                  Tra Cứu Vé Đã Đặt
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-cinema-gold transition-colors">
                  Chương Trình Hội Viên VIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ & Bảo mật */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cinema-text flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cinema-gold" />
              Chính sách
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <span className="hover:text-cinema-gold transition-colors cursor-pointer">
                  Điều khoản sử dụng
                </span>
              </li>
              <li>
                <span className="hover:text-cinema-gold transition-colors cursor-pointer">
                  Chính sách bảo mật & thanh toán
                </span>
              </li>
              <li>
                <span className="hover:text-cinema-gold transition-colors cursor-pointer">
                  Quy định đổi trả vé
                </span>
              </li>
              <li>
                <span className="hover:text-cinema-gold transition-colors cursor-pointer">
                  Câu hỏi thường gặp (FAQ)
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Chăm sóc khách hàng */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cinema-text">
              Tổng đài hỗ trợ
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cinema-gold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-cinema-text-dim">Hotline 24/7</p>
                  <p className="font-bold text-cinema-text">1900 1234</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cinema-gold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-cinema-text-dim">Email liên hệ</p>
                  <p className="font-bold text-cinema-text">support@gzacinema.com</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cinema-gold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-cinema-text-dim">Thời gian hoạt động</p>
                  <p className="font-medium text-cinema-text">08:00 - 24:00 mỗi ngày</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 py-6 text-xs text-cinema-text-dim gap-4">
          <p>&copy; {new Date().getFullYear()} GzaCinema Corporation. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-cinema-gold transition-colors cursor-pointer">Facebook</span>
            <span className="hover:text-cinema-gold transition-colors cursor-pointer">Instagram</span>
            <span className="hover:text-cinema-gold transition-colors cursor-pointer">YouTube</span>
            <span className="hover:text-cinema-gold transition-colors cursor-pointer">TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}