import { useState, useEffect } from 'react';
import { User, Phone, Edit3, Check, X, Save } from 'lucide-react';
import { Input, Button } from '@/components/core';

export default function ProfileInfoForm({
  profile,
  onSubmit,
  isLoading = false,
}) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhoneNumber(profile?.phone_number || '');
  }, [profile?.full_name, profile?.phone_number]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const updateData = {
      phone_number: phoneNumber,
    };

    if (fullName.trim() && fullName.trim() !== (profile?.full_name || '').trim()) {
      updateData.full_name = fullName.trim();
    }

    onSubmit?.(updateData, () => {
      setIsEditingName(false);
    });
  };

  const isNameChanged = fullName.trim() !== (profile?.full_name || '').trim();
  const isPhoneChanged = phoneNumber.trim() !== (profile?.phone_number || '').trim();
  const shouldShowSaveButton = isNameChanged || isPhoneChanged;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-cinema-text">
          <User className="w-4 h-4 text-cinema-gold" />
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md bg-cinema-surface-elevated/40 p-4 sm:p-5 border border-white/5">
          {/* Full Name */}
          <div className="space-y-2">
            <Input
              label="Họ và tên"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={profile?.full_name || 'Nhập họ và tên'}
              disabled={!isEditingName}
              leftIcon={User}
            />

            <div className="mt-2.5 flex flex-wrap gap-2">
              {!isEditingName ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditingName(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-cinema-gold/40 bg-cinema-gold/10 px-3 py-1.5 text-xs font-bold text-cinema-gold transition-all hover:bg-cinema-gold hover:text-cinema-bg cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa tên
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gold-gradient px-3.5 py-1.5 text-xs font-bold text-cinema-bg shadow-glow-gold-sm transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Lưu tên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFullName(profile?.full_name || '');
                      setIsEditingName(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-cinema-text-muted transition hover:bg-white/10 hover:text-cinema-text cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Input
              label="Số điện thoại"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={profile?.phone_number || 'Chưa cập nhật SĐT'}
              leftIcon={Phone}
              helperText="Dùng để nhận mã vé và thông báo đặt vé"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Action */}
      {shouldShowSaveButton && (
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full sm:w-auto min-w-[180px] rounded-md font-bold tracking-wide shadow-glow-gold-sm"
            leftIcon={<Save className="w-4 h-4" />}
          >
            LƯU THAY ĐỔI
          </Button>
        </div>
      )}
    </form>
  );
}
