import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Input, Button } from '@/components/core';

export default function ProfileInfoForm({
  profile,
  onSubmit,
  isLoading = false,
}) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhoneNumber(profile?.phone_number || '');
  }, [profile?.full_name, profile?.phone_number]);

  const isNameChanged = fullName.trim() !== (profile?.full_name || '').trim();
  const isPhoneChanged =
    phoneNumber.trim() !== (profile?.phone_number || '').trim();
  const isDirty = isNameChanged || isPhoneChanged;

  const handleReset = () => {
    setFullName(profile?.full_name || '');
    setPhoneNumber(profile?.phone_number || '');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!isDirty) return;

    const updateData = {
      phone_number: phoneNumber.trim(),
    };

    if (fullName.trim()) {
      updateData.full_name = fullName.trim();
    }

    onSubmit?.(updateData);
  };

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-7 shadow-cinematic">
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
        <h3 className="m-0 flex items-center gap-2 font-display text-lg font-bold text-white">
          <User className="w-5 h-5 text-cinema-gold" />
          Thông Tin Cá Nhân
        </h3>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Đã xác thực
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <Input
            label="Họ và tên"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên của bạn"
            required
            leftIcon={User}
          />

          {/* Phone Number */}
          <Input
            label="Số điện thoại"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ví dụ: 0912345678"
            leftIcon={Phone}
          />

          {/* Email (Read-only) */}
          <Input
            label="Địa chỉ Email"
            type="email"
            value={profile?.email || ''}
            disabled
            leftIcon={Mail}
          />

          {/* Role / Account Status (Read-only) */}
          <Input
            label="Vai trò tài khoản"
            type="text"
            value={
              profile?.role === 'admin'
                ? 'Quản trị viên (Admin)'
                : profile?.role === 'staff'
                  ? 'Nhân viên soát vé (Staff)'
                  : 'Khách hàng thành viên (Member)'
            }
            disabled
            leftIcon={ShieldCheck}
          />
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty || isLoading}
            className="rounded-lg border border-white/10"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Khôi phục
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!isDirty}
            className="rounded-lg font-bold tracking-wide shadow-glow-gold-sm px-5"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
