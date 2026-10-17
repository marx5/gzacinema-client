import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import {
  Sparkles,
  Ticket,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export default function Profile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { checkAuth, logout } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await authApi.getProfile();
      return res.data;
    },
  });

  const { data: historyRes } = useQuery({
    queryKey: ['user', 'bookings', 'recent-preview'],
    queryFn: async () => {
      const res = await authApi.getHistory();
      return res.data;
    },
  });

  const profileData = profile?.data || profile || {};
  const recentBookings = (
    historyRes?.data?.history ||
    historyRes?.history ||
    []
  ).slice(0, 3);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật thông tin hồ sơ thành công!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      checkAuth();
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message ||
          error.friendlyMessage ||
          'Cập nhật thất bại'
      ),
  });

  const handleProfileSubmit = (updateData, onFinished) => {
    updateProfileMutation.mutate(updateData, {
      onSuccess: () => onFinished?.(),
    });
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất tài khoản');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold" />
        <p className="mt-4 font-medium text-cinema-text-muted">
          Đang tải hồ sơ cá nhân...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 sm:mt-8 w-full max-w-[1160px] px-4 md:px-6 mb-24 animate-in fade-in duration-300">
      <Breadcrumb items={[{ label: 'Hồ sơ cá nhân' }]} />

      {/* Page Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <h1 className="m-0 font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cinema-gold" />
            Trung Tâm Tài Khoản & Thẻ Thành Viên
          </h1>
          <p className="m-0 mt-1.5 text-sm text-cinema-text-muted">
            Quản lý hồ sơ cá nhân, theo dõi tích lũy hạng thẻ và lịch sử vé điện tử của bạn tại GzaCinema.
          </p>
        </div>
      </div>

      {/* 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Digital Member Card & KPIs */}
        <div className="lg:col-span-5 xl:col-span-4">
          <ProfileAvatarHeader profile={profileData} />
        </div>

        {/* Right Column: Personal Info Form, Recent Bookings & Security */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <ProfileInfoForm
            profile={profileData}
            onSubmit={handleProfileSubmit}
            isLoading={updateProfileMutation.isPending}
          />

          {/* Recent Bookings Preview Card */}
          <div className="glass-card rounded-2xl border border-white/10 p-6 sm:p-7 shadow-cinematic space-y-4">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <h3 className="m-0 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <Ticket className="w-5 h-5 text-cinema-gold" />
                  Đơn Đặt Vé Gần Đây
                </h3>
                <p className="m-0 mt-1 text-xs text-cinema-text-muted">
                  Các giao dịch đặt vé mới nhất của bạn
                </p>
              </div>

              <Link
                to="/history"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cinema-gold hover:underline"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-8 px-4 text-center">
                <Ticket className="mx-auto h-8 w-8 text-cinema-text-dim mb-2" />
                <p className="m-0 text-sm font-semibold text-cinema-text">
                  Bạn chưa có đơn đặt vé nào
                </p>
                <p className="m-0 mt-1 text-xs text-cinema-text-muted">
                  Hãy chọn một bộ phim yêu thích để trải nghiệm rạp chiếu GzaCinema ngay hôm nay!
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cinema-gold px-4 py-2 text-xs font-bold text-cinema-bg hover:brightness-110 transition"
                >
                  Đặt vé ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const movieTitle =
                    booking.showtime?.movie?.title || 'Suất chiếu GzaCinema';
                  const roomName =
                    booking.showtime?.room?.name || 'Phòng chiếu';
                  const cinemaName =
                    booking.showtime?.room?.cinema?.name || 'GzaCinema';
                  const startTime = booking.showtime?.start_time;
                  const seatLabels = (booking.tickets || [])
                    .map((t) =>
                      t.seat ? `${t.seat.row_letter}${t.seat.seat_number}` : ''
                    )
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <Link
                      key={booking.id}
                      to="/history"
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-cinema-surface-elevated/40 hover:bg-cinema-surface-elevated/80 hover:border-cinema-gold/30 p-4 transition-all group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-white group-hover:text-cinema-gold transition-colors truncate">
                            {movieTitle}
                          </span>
                          <span className="shrink-0 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            {booking.tickets?.length || 0} vé
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cinema-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cinema-gold/70" />
                            {cinemaName} • {roomName}
                          </span>
                          {startTime && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cinema-gold/70" />
                              {formatDateTime(startTime)}
                            </span>
                          )}
                        </div>

                        {seatLabels && (
                          <p className="m-0 text-xs text-cinema-text-dim">
                            Ghế:{' '}
                            <span className="font-mono font-semibold text-cinema-text">
                              {seatLabels}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
                        <span className="font-mono text-sm font-extrabold text-cinema-gold">
                          {formatCurrency(booking.total_amount || 0)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cinema-text-dim group-hover:text-white mt-0.5">
                          <Calendar className="w-3 h-3" />
                          Xem mã QR
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <ProfileSecurityCard
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            onLogout={handleLogout}
          />
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
