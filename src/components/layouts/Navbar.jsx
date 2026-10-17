// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Film,
  User,
  Ticket,
  LayoutDashboard,
  QrCode,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/core';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng mobile drawer khi đổi route
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/');
    setIsMenuOpen(false);
    setIsMobileNavOpen(false);
  };

  const handleMoviesSectionClick = (e) => {
    setIsMobileNavOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      e.preventDefault();
      navigate('/#movies-section');
    }
  };

  const isHomeActive = location.pathname === '/' && location.hash !== '#movies-section';
  const isHistoryActive = location.pathname.startsWith('/history');

  return (
    <header className="sticky top-0 z-[900] w-full border-b border-white/10 bg-cinema-bg/90 backdrop-blur-xl shadow-lg transition-all">
      <nav className="mx-auto flex h-16 sm:h-[72px] w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-4">
        {/* LEFT: LOGO & PRIMARY DESKTOP NAV */}
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-2 font-display text-xl sm:text-2xl font-black tracking-tight text-white transition min-h-[44px]">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gold-gradient text-cinema-bg shadow-glow-gold-sm transition-transform group-hover:scale-105">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </div>
            <span className="gold-text-gradient font-black text-xl sm:text-2xl tracking-wider">
              GZACINEMA
            </span>
          </Link>

          {/* Primary Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isHomeActive
                  ? 'text-cinema-gold'
                  : 'text-cinema-text-muted hover:text-white'
              }`}
            >
              Trang Chủ
            </Link>

            <a
              href="/#movies-section"
              onClick={handleMoviesSectionClick}
              className="text-sm font-semibold text-cinema-text-muted hover:text-white transition-colors cursor-pointer"
            >
              Lịch Chiếu & Phim
            </a>

            {isAuthenticated && (
              <Link
                to="/history"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isHistoryActive
                    ? 'text-cinema-gold'
                    : 'text-cinema-text-muted hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4 text-cinema-gold" />
                <span>Vé Của Tôi</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm font-semibold text-cinema-gold hover:text-cinema-gold-light transition-colors flex items-center gap-1.5 bg-cinema-gold/10 px-3 py-1.5 rounded-lg border border-cinema-gold/25"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Quản Trị</span>
              </Link>
            )}

            {isAuthenticated && user?.role === 'staff' && (
              <Link
                to="/admin/checkin"
                className="text-sm font-semibold text-cinema-gold hover:text-cinema-gold-light transition-colors flex items-center gap-1.5 bg-cinema-gold/10 px-3 py-1.5 rounded-lg border border-cinema-gold/25"
              >
                <QrCode className="w-4 h-4" />
                <span>Soát Vé</span>
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT: USER PROFILE, ACTIONS & MOBILE MENU TRIGGER */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative flex items-center gap-2 sm:gap-3" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex min-h-[44px] items-center gap-2 sm:gap-2.5 rounded-full border border-white/10 bg-cinema-surface/80 py-1.5 pl-1.5 sm:pl-2 pr-3 text-sm font-semibold text-cinema-text shadow-sm backdrop-blur-md transition hover:border-cinema-gold/50 hover:bg-cinema-surface-elevated cursor-pointer active:scale-95"
                aria-expanded={isMenuOpen}
                aria-label="User menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient font-black text-xs text-cinema-bg shadow-inner">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline-block max-w-[120px] truncate text-xs text-cinema-text">
                  {user?.full_name}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-cinema-text-muted transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-cinema-gold' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-[115%] z-[999] w-[calc(100vw-2rem)] max-w-[280px] sm:w-64 overflow-hidden rounded-xl border border-white/10 bg-cinema-surface/95 shadow-cinematic backdrop-blur-xl animate-scaleUp">
                  {/* User Profile Header */}
                  <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-cinema-text">{user?.full_name || 'Tài khoản'}</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user?.role === 'admin'
                          ? 'bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/30'
                          : user?.role === 'staff'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-white/10 text-cinema-text-muted'
                      }`}>
                        {user?.role === 'admin' ? 'Admin' : user?.role === 'staff' ? 'Staff' : 'Member'}
                      </span>
                    </div>
                    <p className="truncate text-xs text-cinema-text-dim mt-0.5">{user?.email}</p>
                  </div>

                  <div className="flex flex-col p-1.5 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-cinema-text-muted hover:bg-white/5 hover:text-cinema-gold transition active:bg-white/10"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-cinema-text-muted hover:bg-white/5 hover:text-cinema-gold transition active:bg-white/10"
                    >
                      <Ticket className="h-4 w-4 shrink-0" />
                      <span>Vé của tôi</span>
                    </Link>

                    {/* Dedicated Admin Access */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="my-1 border-t border-white/10"></div>
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-cinema-gold bg-cinema-gold/10 hover:bg-cinema-gold/20 border border-cinema-gold/25 transition-all active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2.5">
                            <LayoutDashboard className="h-4 w-4 text-cinema-gold shrink-0" />
                            <span>Trang Quản Trị</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </>
                    )}

                    {/* Dedicated Staff Access */}
                    {user?.role === 'staff' && (
                      <>
                        <div className="my-1 border-t border-white/10"></div>
                        <Link
                          to="/admin/checkin"
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-cinema-gold bg-cinema-gold/10 hover:bg-cinema-gold/20 border border-cinema-gold/25 transition-all active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2.5">
                            <QrCode className="h-4 w-4 text-cinema-gold shrink-0" />
                            <span>Soát Vé QR</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-white/10"></div>
                    <button
                      onClick={handleLogout}
                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer active:bg-rose-500/20"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-cinema-surface/80 text-cinema-text-muted hover:text-white hover:border-cinema-gold/40 transition cursor-pointer"
            aria-label="Mở menu điều hướng"
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X className="w-5 h-5 text-cinema-gold" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t border-white/10 bg-cinema-surface/95 backdrop-blur-xl px-4 py-3 space-y-1.5 shadow-cinematic animate-fadeIn">
          <Link
            to="/"
            onClick={() => setIsMobileNavOpen(false)}
            className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              isHomeActive
                ? 'bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/30'
                : 'text-cinema-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-cinema-gold shrink-0" />
            <span>Trang Chủ</span>
          </Link>

          <a
            href="/#movies-section"
            onClick={handleMoviesSectionClick}
            className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cinema-text-muted hover:bg-white/5 hover:text-white transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-cinema-gold shrink-0" />
            <span>Lịch Chiếu & Phim</span>
          </a>

          {isAuthenticated ? (
            <>
              <Link
                to="/history"
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isHistoryActive
                    ? 'bg-cinema-gold/15 text-cinema-gold border border-cinema-gold/30'
                    : 'text-cinema-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4 text-cinema-gold shrink-0" />
                <span>Vé Của Tôi</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cinema-text-muted hover:bg-white/5 hover:text-white transition"
              >
                <User className="w-4 h-4 text-cinema-gold shrink-0" />
                <span>Hồ Sơ Cá Nhân</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cinema-gold bg-cinema-gold/10 border border-cinema-gold/25 transition"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Trang Quản Trị</span>
                </Link>
              )}

              {user?.role === 'staff' && (
                <Link
                  to="/admin/checkin"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cinema-gold bg-cinema-gold/10 border border-cinema-gold/25 transition"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>Soát Vé QR</span>
                </Link>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10 mt-2">
              <Link to="/login" onClick={() => setIsMobileNavOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full min-h-[42px] text-xs font-bold">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileNavOpen(false)}>
                <Button variant="primary" size="sm" className="w-full min-h-[42px] text-xs font-bold">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}