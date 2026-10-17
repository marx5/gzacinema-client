import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Check,
  Crown,
  Ticket,
  Wallet,
  ShoppingBag,
  Copy,
  Calendar,
  Shield,
  Film,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const ROLE_CONFIG = {
  admin: {
    label: 'Quản trị viên',
    badgeClass: 'bg-cinema-gold/15 text-cinema-gold border-cinema-gold/40',
  },
  staff: {
    label: 'Nhân viên soát vé',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  },
  user: {
    label: 'Khách hàng thành viên',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
};

function getMembershipTier(totalSpent = 0) {
  const spent = Number(totalSpent) || 0;
  if (spent >= 5000000) {
    return {
      name: 'Diamond VVIP',
      accent: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/15',
      barColor: 'from-cyan-400 to-blue-500',
      nextTier: null,
      progress: 100,
    };
  }
  if (spent >= 2000000) {
    return {
      name: 'Gold VIP',
      accent: 'text-cinema-gold border-cinema-gold/40 bg-cinema-gold/15',
      barColor: 'from-cinema-gold to-amber-500',
      nextTier: 'Diamond VVIP',
      target: 5000000,
      progress: Math.min(100, Math.round(((spent - 2000000) / 3000000) * 100)),
    };
  }
  if (spent >= 500000) {
    return {
      name: 'Silver Member',
      accent: 'text-slate-200 border-slate-300/30 bg-white/10',
      barColor: 'from-slate-300 to-slate-100',
      nextTier: 'Gold VIP',
      target: 2000000,
      progress: Math.min(100, Math.round(((spent - 500000) / 1500000) * 100)),
    };
  }
  return {
    name: 'Standard Member',
    accent: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    barColor: 'from-cinema-gold/80 to-cinema-gold',
    nextTier: 'Silver Member',
    target: 500000,
    progress: Math.min(100, Math.round((spent / 500000) * 100)),
  };
}

export default function ProfileAvatarHeader({ profile }) {
  const initialLetter =
    profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';
  const roleInfo = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.user;
  const stats = profile?.stats || {
    total_bookings: 0,
    total_tickets: 0,
    total_spent: 0,
  };
  const tier = getMembershipTier(stats.total_spent);

  const shortMemberCode = profile?.id
    ? `GZA-${String(profile.id).slice(0, 8).toUpperCase()}`
    : 'GZA-MEMBER';

  const joinDateText = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Thành viên GzaCinema';

  const handleCopyId = () => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(shortMemberCode);
    toast.success('Đã sao chép mã thành viên!');
  };

  return (
    <div className="space-y-5">
      {/* Digital Member Pass Card */}
      <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#181A30] via-[#121324] to-[#0D0E1B] p-6 shadow-cinematic">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-cinema-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gold-gradient" />

        {/* Card Top Header: Brand & Tier Badge */}
        <div className="relative flex items-center justify-between gap-2 pb-5 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cinema-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-cinema-gold" />
            <span>GzaCinema Pass</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${tier.accent}`}
          >
            <Crown className="w-3 h-3" />
            {tier.name}
          </span>
        </div>

        {/* Avatar & Identity */}
        <div className="relative mt-5 flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cinema-gold/25 to-cinema-surface-elevated border-2 border-cinema-gold/60 text-3xl font-black text-cinema-gold shadow-glow-gold-sm">
            {initialLetter.toUpperCase()}
            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#121324]"
              title="Tài khoản đang hoạt động"
            >
              <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h2 className="m-0 font-display text-xl font-extrabold text-white truncate">
              {profile?.full_name || 'Chưa cập nhật tên'}
            </h2>
            <p className="m-0 text-xs text-cinema-text-muted truncate">
              {profile?.email}
            </p>
            <div className="pt-0.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${roleInfo.badgeClass}`}
              >
                <Shield className="w-3 h-3" />
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Member Code & Join Date Strip */}
        <div className="relative mt-5 grid grid-cols-2 gap-2.5 rounded-xl bg-black/30 border border-white/5 p-3">
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-cinema-text-dim">
              Mã thành viên
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-cinema-gold">
                #{shortMemberCode}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-cinema-text-dim hover:text-white transition-colors cursor-pointer"
                title="Sao chép mã thành viên"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="border-l border-white/10 pl-3">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-cinema-text-dim">
              Ngày tham gia
            </p>
            <p className="m-0 mt-1 flex items-center gap-1 text-xs font-semibold text-cinema-text">
              <Calendar className="w-3.5 h-3.5 text-cinema-gold/80 shrink-0" />
              <span className="truncate">{joinDateText}</span>
            </p>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="relative mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-cinema-text-muted">
              Tiến trình tích lũy hạng thẻ
            </span>
            <span className="font-mono font-bold text-cinema-gold">
              {tier.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tier.barColor} transition-all duration-500`}
              style={{ width: `${Math.max(6, tier.progress)}%` }}
            />
          </div>
          <p className="m-0 text-[11px] text-cinema-text-dim">
            {tier.nextTier ? (
              <>
                Cần chi tiêu thêm{' '}
                <span className="font-semibold text-cinema-text">
                  {formatCurrency(Math.max(0, tier.target - Number(stats.total_spent || 0)))}
                </span>{' '}
                để thăng hạng <span className="text-cinema-gold font-semibold">{tier.nextTier}</span>
              </>
            ) : (
              'Bạn đã đạt hạng thẻ cao nhất tại GzaCinema!'
            )}
          </p>
        </div>
      </div>

      {/* 3 Activity KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl border border-white/10 p-3.5 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-cinema-gold/10 text-cinema-gold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="m-0 font-mono text-lg font-extrabold text-white">
            {stats.total_bookings || 0}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-cinema-text-muted">
            Đơn đặt vé
          </p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-3.5 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
            <Ticket className="w-4 h-4" />
          </div>
          <p className="m-0 font-mono text-lg font-extrabold text-white">
            {stats.total_tickets || 0}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-cinema-text-muted">
            Vé đã mua
          </p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-3.5 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="m-0 font-mono text-sm sm:text-base font-extrabold text-cinema-gold truncate" title={formatCurrency(stats.total_spent || 0)}>
            {formatCurrency(stats.total_spent || 0)}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-cinema-text-muted">
            Tổng chi tiêu
          </p>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="glass-card rounded-2xl border border-white/10 p-4 space-y-2">
        <p className="m-0 px-1 text-xs font-bold uppercase tracking-wider text-cinema-text-dim">
          Lối tắt nhanh
        </p>
        <Link
          to="/history"
          className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cinema-gold/30 px-3.5 py-2.5 text-sm font-semibold text-cinema-text transition-all group"
        >
          <span className="flex items-center gap-2.5">
            <Ticket className="w-4 h-4 text-cinema-gold" />
            <span>Lịch sử đặt vé & Mã QR</span>
          </span>
          <ArrowUpRight className="w-4 h-4 text-cinema-text-dim group-hover:text-cinema-gold transition-colors" />
        </Link>

        <Link
          to="/"
          className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cinema-gold/30 px-3.5 py-2.5 text-sm font-semibold text-cinema-text transition-all group"
        >
          <span className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-cinema-gold" />
            <span>Khám phá phim đang chiếu</span>
          </span>
          <ArrowUpRight className="w-4 h-4 text-cinema-text-dim group-hover:text-cinema-gold transition-colors" />
        </Link>

        {(profile?.role === 'admin' || profile?.role === 'staff') && (
          <Link
            to={profile?.role === 'staff' ? '/admin/checkin' : '/admin'}
            className="flex items-center justify-between rounded-xl border border-cinema-gold/25 bg-cinema-gold/10 hover:bg-cinema-gold/20 px-3.5 py-2.5 text-sm font-bold text-cinema-gold transition-all group"
          >
            <span className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" />
              <span>
                {profile?.role === 'staff'
                  ? 'Mở Quầy Soát Vé QR'
                  : 'Mở Bảng Điều Khiển Admin'}
              </span>
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
