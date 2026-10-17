import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { Breadcrumb } from '@/components/layouts';
import {
  ProfileAvatarHeader,
  ProfileInfoForm,
  ProfileSecurityCard,
  ChangePasswordModal,
} from '@/components/modules/profile';
import { Sparkles } from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();
  const { checkAuth } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await authApi.getProfile();
      return res.data;
    },
  });

  const profileData = profile?.data || profile || {};

  // Mutation cập nhật thông tin cá nhân
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      checkAuth();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || error.friendlyMessage || 'Cập nhật thất bại'),
  });

  const handleProfileSubmit = (updateData, onFinished) => {
    updateProfileMutation.mutate(updateData, {
      onSuccess: () => onFinished?.(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold" />
        <p className="mt-4 font-medium text-cinema-text-muted">Đang tải hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-[760px] px-4 md:px-6 mb-24 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'Hồ sơ cá nhân' }]} />

      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h1 className="m-0 font-display text-2xl sm:text-3xl font-extrabold text-cinema-text tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-cinema-gold" />
          Hồ Sơ Cá Nhân
        </h1>
      </div>

      {/* Main Profile Card Container */}
      <div className="glass-card relative overflow-hidden rounded-md border border-white/10 shadow-cinematic p-6 sm:p-8 space-y-8">
        <div className="absolute top-0 left-0 h-1 w-full bg-gold-gradient" />

        {/* Khối Avatar & Thông tin tài khoản */}
        <ProfileAvatarHeader profile={profileData} />

        {/* Form Cập nhật thông tin cá nhân */}
        <ProfileInfoForm
          profile={profileData}
          onSubmit={handleProfileSubmit}
          isLoading={updateProfileMutation.isPending}
        />

        {/* Khối Bảo mật & Trigger Đổi mật khẩu */}
        <ProfileSecurityCard
          onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        />
      </div>

      {/* Modal Popup Đổi Mật Khẩu */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
