import { Check } from 'lucide-react';

export default function ProfileAvatarHeader({ profile }) {
  const initialLetter =
    profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-8 text-center sm:text-left">
      <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-md bg-cinema-surface-elevated border-2 border-cinema-gold/60 text-3xl font-black text-cinema-gold shadow-glow-gold-sm">
        {initialLetter.toUpperCase()}
        <div
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-cinema-bg"
          title="Đang hoạt động"
        >
          <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
        </div>
      </div>

      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <h2 className="m-0 text-xl sm:text-2xl font-display font-bold text-cinema-text truncate">
            {profile?.full_name || 'Chưa cập nhật tên'}
          </h2>
        </div>

        <p className="m-0 text-sm text-cinema-text-muted truncate flex items-center justify-center sm:justify-start gap-1.5">
          <span>{profile?.email}</span>
        </p>

        <p className="text-xs text-cinema-text-dim">
          Mã tài khoản:{' '}
          <span className="font-mono text-cinema-gold/80 font-medium">
            #GZA-{profile?.id || '001'}
          </span>
        </p>
      </div>
    </div>
  );
}
