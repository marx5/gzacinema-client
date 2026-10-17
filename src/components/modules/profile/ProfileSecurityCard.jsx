import { ShieldCheck, KeyRound, Lock, LogOut, Smartphone } from 'lucide-react';
import { Button } from '@/components/core';

export default function ProfileSecurityCard({
  onOpenPasswordModal,
  onLogout,
}) {
  return (
    <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-7 shadow-cinematic space-y-5">
      <div className="pb-4 border-b border-white/10">
        <h3 className="m-0 flex items-center gap-2 font-display text-lg font-bold text-white">
          <ShieldCheck className="w-5 h-5 text-cinema-gold" />
          Bảo Mật & Phiên Đăng Nhập
        </h3>
        <p className="m-0 mt-1 text-xs text-cinema-text-muted">
          Quản lý mật khẩu và kiểm soát phiên truy cập tài khoản của bạn.
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Password Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-cinema-surface-elevated/40 p-4 border border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="m-0 text-sm font-bold text-white">
                Mật khẩu đăng nhập
              </h4>
              <p className="m-0 text-xs text-cinema-text-muted mt-0.5">
                Nên sử dụng mật khẩu tối thiểu 8 ký tự gồm chữ hoa, chữ thường và số
              </p>
            </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-cinema-surface-elevated/40 p-4 border border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="m-0 text-sm font-bold text-white">
                  Phiên đăng nhập hiện tại
                </h4>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="m-0 text-xs text-cinema-text-muted mt-0.5">
                Đang bảo vệ bằng JWT Access Token & HttpOnly Refresh Cookie
              </p>
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
