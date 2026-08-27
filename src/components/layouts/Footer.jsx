import { Link } from 'react-router-dom';
import { Film, Phone, Mail } from 'lucide-react';
import {
  DEFAULT_BRAND_INFO,
  DEFAULT_SOCIAL_LINKS,
} from './footer/footer.data';

export default function Footer({
  brand = DEFAULT_BRAND_INFO,
  socials = DEFAULT_SOCIAL_LINKS,
  companyName = 'GzaCinema Corporation',
  copyrightYear = new Date().getFullYear(),
  className = '',
}) {
  return (
    <footer className={`mt-10 sm:mt-16 border-t border-white/10 bg-cinema-surface/40 backdrop-blur-md pt-6 sm:pt-8 pb-6 text-cinema-text-muted ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Top: Brand & Quick Contact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link to={brand.homeUrl || '/'} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-gradient text-cinema-bg shadow-glow-gold-sm">
                <Film className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="gold-text-gradient font-black text-xl tracking-wider">
                {brand.name}
              </span>
            </Link>
            <span className="hidden md:inline-block text-xs text-cinema-text-dim border-l border-white/15 pl-3">
              Trải nghiệm điện ảnh đỉnh cao
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            <a
              href="tel:19001234"
              className="flex items-center gap-1.5 text-cinema-gold hover:underline font-bold bg-cinema-gold/10 px-3 py-1.5 rounded-lg border border-cinema-gold/20 active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>1900 1234</span>
            </a>
            <a
              href="mailto:support@gzacinema.com"
              className="flex items-center gap-1.5 text-cinema-text-dim hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
              <span>support@gzacinema.com</span>
            </a>
          </div>
        </div>

        {/* Middle: Fast Navigation Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/?tab=showing" className="hover:text-cinema-gold transition-colors py-0.5">
              Phim Đang Chiếu
            </Link>
            <Link to="/?tab=coming_soon" className="hover:text-cinema-gold transition-colors py-0.5">
              Phim Sắp Chiếu
            </Link>
            <Link to="/history" className="hover:text-cinema-gold transition-colors py-0.5">
              Vé Của Tôi
            </Link>
            <Link to="/profile" className="hover:text-cinema-gold transition-colors py-0.5">
              Tài Khoản
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-cinema-text-dim text-[11px] sm:text-xs">
            <span className="hover:text-white transition-colors cursor-pointer">Điều khoản</span>
            <span>·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Bảo mật</span>
            <span>·</span>
            <span className="hover:text-white transition-colors cursor-pointer">FAQ</span>
          </div>
        </div>

        {/* Bottom: Copyright & Socials */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-cinema-text-dim text-center sm:text-left">
          <p>&copy; {copyrightYear} {companyName}. Tất cả các quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            {socials.map((s, idx) => (
              <a
                key={idx}
                href={s.url || '#'}
                className="hover:text-cinema-gold transition-colors py-0.5"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}