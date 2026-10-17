import { ShieldCheck, KeyRound, Lock, LogOut, Smartphone } from 'lucide-react';
import { Button } from '@/components/core';

export default function ProfileSecurityCard({
  onOpenPasswordModal,
  onLogout,
}) {
  return (
    <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-7 shadow-cinematic space-y-4">
      <div className="pb-4 border-b border-white/10">
        <h3 className="m-0 flex items-center gap-2 font-display text-lg font-bold text-white">
          <ShieldCheck className="w-5 h-5 text-cinema-gold" />
          Bảo Mật & Phiên Đăng Nhập
        </h3>
      </div>

      <div className="space-y-3">
        {/* Password Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-cinema-surface-elevated/40 p-3.5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold">
              <KeyRound className="w-4 h-4" />
            </div>
            <h4 className="m-0 text-sm font-bold text-white">
              Mật khẩu đăng nhập
            </h4>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenPasswordModal}
            className="w-full sm:w-auto rounded-lg shrink-0 border-cinema-gold/30 hover:border-cinema-gold hover:text-cinema-gold font-semibold"
            leftIcon={<Lock className="w-3.5 h-3.5" />}
          >
            Đổi mật khẩu
          </Button>
        </div>

        {/* Active Session Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-cinema-surface-elevated/40 p-3.5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="m-0 text-sm font-bold text-white">
                Phiên đăng nhập hiện tại
              </h4>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {onLogout && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full sm:w-auto rounded-lg shrink-0 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Đăng xuất
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
