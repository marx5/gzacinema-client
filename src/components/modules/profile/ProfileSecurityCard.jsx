import { ShieldCheck, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/core';

export default function ProfileSecurityCard({ onOpenPasswordModal }) {
  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-cinema-text">
        <ShieldCheck className="w-4 h-4 text-cinema-gold" />
        Bảo mật tài khoản
      </h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-md bg-cinema-surface-elevated/40 p-4 sm:p-5 border border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="m-0 text-sm font-bold text-cinema-text">Mật khẩu đăng nhập</h4>
            <p className="m-0 text-xs text-cinema-text-muted mt-0.5">
              Đổi mật khẩu định kỳ để bảo vệ tài khoản và lịch sử đặt vé của bạn
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenPasswordModal}
          className="w-full sm:w-auto rounded-md shrink-0 border-cinema-gold/30 hover:border-cinema-gold hover:text-cinema-gold font-semibold"
          leftIcon={<Lock className="w-3.5 h-3.5" />}
        >
          Đổi mật khẩu
        </Button>
      </div>
    </div>
  );
}
