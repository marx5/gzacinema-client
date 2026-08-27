import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/layouts';
import { Button, Badge, Input } from '../../components/core';
import { User, Lock, Edit3, KeyRound, Check, X, Sparkles, Save, ShieldCheck, Phone } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Profile() {
    const { checkAuth } = useAuthStore();

    // Profile info state
    const [fullName, setFullName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await authApi.getProfile();
            return res.data;
        }
    });

    const profileData = profile?.data || profile || {};

    useEffect(() => {
        setFullName(profileData.full_name || '');
        setPhoneNumber(profileData.phone_number || '');
    }, [profileData.full_name, profileData.phone_number]);

    // Mutation for profile info (name, phone)
    const updateProfileMutation = useMutation({
        mutationFn: (data) => authApi.updateProfile(data),
        onSuccess: () => {
            toast.success('Cập nhật thông tin thành công!');
            setIsEditingName(false);
            checkAuth();
        },
        onError: (error) => toast.error(error.response?.data?.message || error.friendlyMessage || 'Cập nhật thất bại')
    });

    const handleProfileSubmit = (e) => {
        if (e) e.preventDefault();

        const updateData = {
            phone_number: phoneNumber
        };

        if (fullName.trim() && fullName.trim() !== (profileData.full_name || '').trim()) {
            updateData.full_name = fullName.trim();
        }

        updateProfileMutation.mutate(updateData);
    };

    const isNameChanged = fullName.trim() !== (profileData.full_name || '').trim();
    const isPhoneChanged = phoneNumber.trim() !== (profileData.phone_number || '').trim();
    const shouldShowSaveProfileButton = isNameChanged || isPhoneChanged;

    if (isLoading) return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold"></div>
            <p className="mt-4 font-medium text-cinema-text-muted">Đang tải hồ sơ...</p>
        </div>
    );

    const initialLetter = profileData.full_name?.charAt(0) || profileData.email?.charAt(0) || 'U';

    return (
        <div className="mx-auto mt-8 w-full max-w-[760px] px-4 md:px-6 mb-24 animate-in fade-in duration-300">
            <Breadcrumb items={[{ label: 'Hồ sơ cá nhân' }]} />

            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="m-0 font-display text-2xl sm:text-3xl font-extrabold text-cinema-text tracking-tight flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-cinema-gold" />
                    Hồ Sơ Của Tôi
                </h1>
            </div>

            {/* Main Profile Card */}
            <div className="glass-card relative overflow-hidden rounded-md border border-white/10 shadow-cinematic p-6 sm:p-8 space-y-8">
                {/* Gold Top Accent Line */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gold-gradient"></div>

                {/* Profile Header Block */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-8 text-center sm:text-left">
                    <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-md bg-cinema-surface-elevated border-2 border-cinema-gold/60 text-3xl font-black text-cinema-gold shadow-glow-gold-sm">
                        {initialLetter.toUpperCase()}
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-cinema-bg" title="Đang hoạt động">
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                        </div>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                            <h2 className="m-0 text-xl sm:text-2xl font-display font-bold text-cinema-text truncate">
                                {profileData.full_name || 'Chưa cập nhật tên'}
                            </h2>
                            {profileData.role === 'admin' && (
                                <Badge variant="gold" size="sm" className="rounded-md">
                                    Quản trị viên
                                </Badge>
                            )}
                            {profileData.role === 'staff' && (
                                <Badge variant="purple" size="sm" className="rounded-md">
                                    Nhân viên
                                </Badge>
                            )}
                            {(!profileData.role || profileData.role === 'customer') && (
                                <Badge variant="secondary" size="sm" className="rounded-md">
                                    Thành viên
                                </Badge>
                            )}
                        </div>

                        <p className="m-0 text-sm text-cinema-text-muted truncate flex items-center justify-center sm:justify-start gap-1.5">
                            <span>{profileData.email}</span>
                        </p>

                        <p className="text-xs text-cinema-text-dim">
                            Mã tài khoản: <span className="font-mono text-cinema-gold/80 font-medium">#GZA-{profileData.id || '001'}</span>
                        </p>
                    </div>
                </div>

                {/* Section 1: Thông tin cơ bản */}
                <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                                    placeholder={profileData.full_name || 'Nhập họ và tên'}
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
                                                onClick={handleProfileSubmit}
                                                disabled={updateProfileMutation.isLoading}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-gold-gradient px-3.5 py-1.5 text-xs font-bold text-cinema-bg shadow-glow-gold-sm transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Lưu tên
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFullName(profileData.full_name || '');
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
                                    placeholder={profileData.phone_number || 'Chưa cập nhật SĐT'}
                                    leftIcon={Phone}
                                    helperText="Dùng để nhận mã vé và thông báo đặt vé"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action For Profile */}
                    {shouldShowSaveProfileButton && (
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={updateProfileMutation.isLoading}
                                className="w-full sm:w-auto min-w-[180px] rounded-md font-bold tracking-wide shadow-glow-gold-sm"
                                leftIcon={<Save className="w-4 h-4" />}
                            >
                                LƯU THAY ĐỔI
                            </Button>
                        </div>
                    )}
                </form>

                {/* Section 2: Bảo mật & Đổi mật khẩu */}
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
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full sm:w-auto rounded-md shrink-0 border-cinema-gold/30 hover:border-cinema-gold hover:text-cinema-gold font-semibold"
                            leftIcon={<Lock className="w-3.5 h-3.5" />}
                        >
                            Đổi mật khẩu
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal Popup Đổi Mật Khẩu */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
}
