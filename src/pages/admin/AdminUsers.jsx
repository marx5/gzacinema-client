import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  QrCode,
  UserCheck,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';
import { userApi } from '@/api/userApi';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Input, Modal, DataTable } from '@/components/core';
import { formatCurrency } from '@/utils/formatters';

const ROLE_TABS = [
  { id: 'all', label: 'Tất cả vai trò' },
  { id: 'user', label: 'Khách hàng' },
  { id: 'staff', label: 'Nhân viên (Staff)' },
  { id: 'admin', label: 'Quản trị viên (Admin)' },
];

const ROLE_OPTIONS = [
  {
    value: 'user',
    label: 'Khách hàng (User)',
    desc: 'Đặt vé, thanh toán và quản lý vé cá nhân',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: UserCheck,
  },
  {
    value: 'staff',
    label: 'Nhân viên soát vé (Staff)',
    desc: 'Quét mã QR check-in vé và xem sơ đồ phòng chiếu',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    icon: QrCode,
  },
  {
    value: 'admin',
    label: 'Quản trị viên (Admin)',
    desc: 'Toàn quyền quản lý hệ thống, phim, rạp, suất chiếu và người dùng',
    badgeClass: 'bg-cinema-gold/15 text-cinema-gold border-cinema-gold/40',
    icon: Shield,
  },
];

const INITIAL_FORM = {
  full_name: '',
  email: '',
  phone_number: '',
  role: 'user',
  password: '',
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const [userToDelete, setUserToDelete] = useState(null);

  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'admin',
      'users',
      { page, limit, role: roleFilter, search: searchQuery },
    ],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      };
      const res = await userApi.getUsers(params);
      return res.data?.data || res.data || {};
    },
  });

  const users = data?.users || [];
  const pagination = data?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  };
  const summary = data?.summary || {
    total_users: 0,
    admin_count: 0,
    staff_count: 0,
    customer_count: 0,
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (payload) => userApi.createUser(payload),
    onSuccess: () => {
      toast.success('Tạo tài khoản người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      handleCloseFormModal();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.friendlyMessage ||
          'Không thể tạo tài khoản'
      );
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => userApi.updateUser(id, payload),
    onSuccess: () => {
      toast.success('Cập nhật thông tin tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      handleCloseFormModal();
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.friendlyMessage ||
          'Cập nhật tài khoản thất bại'
      );
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id) => userApi.deleteUser(id),
    onSuccess: () => {
      toast.success('Đã xóa tài khoản người dùng!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setUserToDelete(null);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.friendlyMessage ||
          'Xóa tài khoản thất bại'
      );
    },
  });

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData(INITIAL_FORM);
    setShowPassword(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setFormData({
      full_name: targetUser.full_name || '',
      email: targetUser.email || '',
      phone_number: targetUser.phone_number || '',
      role: targetUser.role || 'user',
      password: '',
    });
    setShowPassword(false);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingUser(null);
    setFormData(INITIAL_FORM);
    setShowPassword(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      return toast.error('Họ và tên phải có ít nhất 2 ký tự');
    }

    if (!editingUser) {
      if (!formData.email.trim()) {
        return toast.error('Vui lòng nhập địa chỉ email');
      }
      if (!formData.password || formData.password.length < 6) {
        return toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      createUserMutation.mutate({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || null,
        role: formData.role,
        password: formData.password,
      });
    } else {
      if (formData.password && formData.password.length < 6) {
        return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      }
      const payload = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim() || null,
        role: formData.role,
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }
      updateUserMutation.mutate({
        id: editingUser.id,
        payload,
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'Người Dùng',
        accessorKey: 'full_name',
        cell: (row) => {
          const initial =
            row.full_name?.charAt(0) || row.email?.charAt(0) || 'U';
          const isMe = String(row.id) === String(currentUser?.id);
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cinema-gold/15 border border-cinema-gold/40 font-display text-sm font-black text-cinema-gold">
                {initial.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate">
                    {row.full_name || 'Chưa cập nhật'}
                  </span>
                  {isMe && (
                    <span className="rounded bg-cinema-gold/20 border border-cinema-gold/40 px-1.5 py-0.5 text-[10px] font-bold text-cinema-gold">
                      Bạn
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-cinema-text-dim">
                  #GZA-{String(row.id).slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Thông Tin Liên Hệ',
        accessorKey: 'email',
        cell: (row) => (
          <div className="space-y-1 min-w-[190px]">
            <p className="m-0 flex items-center gap-1.5 text-xs text-cinema-text">
              <Mail className="w-3.5 h-3.5 text-cinema-gold/70 shrink-0" />
              <span className="truncate">{row.email}</span>
            </p>
            <p className="m-0 flex items-center gap-1.5 text-xs text-cinema-text-muted">
              <Phone className="w-3.5 h-3.5 text-cinema-text-dim shrink-0" />
              <span>{row.phone_number || 'Chưa cập nhật SĐT'}</span>
            </p>
          </div>
        ),
      },
      {
        header: 'Vai Trò',
        accessorKey: 'role',
        cell: (row) => {
          const roleMeta =
            ROLE_OPTIONS.find((r) => r.value === row.role) || ROLE_OPTIONS[0];
          const Icon = roleMeta.icon;
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${roleMeta.badgeClass}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {row.role === 'admin'
                ? 'Admin'
                : row.role === 'staff'
                  ? 'Staff'
                  : 'Khách hàng'}
            </span>
          );
        },
      },
      {
        header: 'Hoạt Động Mua Vé',
        accessorKey: 'booking_count',
        cell: (row) => {
          const count = Number(row.booking_count || 0);
          const spent = Number(row.total_spent || 0);
          return (
            <div className="space-y-0.5">
              <p className="m-0 font-mono text-xs font-bold text-cinema-gold">
                {formatCurrency(spent)}
              </p>
              <p className="m-0 text-[11px] text-cinema-text-muted">
                {count} đơn thanh toán
              </p>
            </div>
          );
        },
      },
      {
        header: 'Ngày Tạo',
        accessorKey: 'createdAt',
        cell: (row) => (
          <span className="text-xs text-cinema-text-muted font-mono">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '—'}
          </span>
        ),
      },
      {
        header: 'Thao Tác',
        accessorKey: 'actions',
        className: 'text-right',
        cell: (row) => {
          const isMe = String(row.id) === String(currentUser?.id);
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal(row)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-cinema-gold/15 hover:border-cinema-gold/40 hover:text-cinema-gold px-2.5 py-1.5 text-xs font-semibold text-cinema-text transition-colors cursor-pointer"
                title="Chỉnh sửa & phân quyền"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>

              <button
                type="button"
                onClick={() => setUserToDelete(row)}
                disabled={isMe}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title={
                  isMe
                    ? 'Không thể tự xóa tài khoản của chính mình'
                    : 'Xóa tài khoản'
                }
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [currentUser?.id]
  );

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#121426] p-4 flex items-center justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-cinema-text-muted">
              Tổng Tài Khoản
            </p>
            <p className="m-0 mt-1.5 font-mono text-2xl font-extrabold text-white">
              {summary.total_users || 0}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cinema-gold/15 border border-cinema-gold/30 text-cinema-gold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121426] p-4 flex items-center justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-cinema-text-muted">
              Khách Hàng (User)
            </p>
            <p className="m-0 mt-1.5 font-mono text-2xl font-extrabold text-emerald-400">
              {summary.customer_count || 0}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121426] p-4 flex items-center justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-cinema-text-muted">
              Nhân Viên (Staff)
            </p>
            <p className="m-0 mt-1.5 font-mono text-2xl font-extrabold text-sky-400">
              {summary.staff_count || 0}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121426] p-4 flex items-center justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-cinema-text-muted">
              Quản Trị Viên (Admin)
            </p>
            <p className="m-0 mt-1.5 font-mono text-2xl font-extrabold text-cinema-gold">
              {summary.admin_count || 0}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cinema-gold/15 border border-cinema-gold/30 text-cinema-gold">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Actions Bar */}
      <div className="rounded-xl border border-white/10 bg-[#121426] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ROLE_TABS.map((tab) => {
              const active = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setRoleFilter(tab.id);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-cinema-gold text-cinema-bg shadow-glow-gold-sm'
                      : 'bg-white/5 text-cinema-text-muted hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border border-white/10"
              leftIcon={
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
                />
              }
            >
              Làm mới
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="font-bold shadow-glow-gold-sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Thêm Tài Khoản
            </Button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cinema-text-dim absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo họ tên, địa chỉ email hoặc số điện thoại..."
              className="w-full rounded-lg border border-white/10 bg-[#0B0C16] pl-10 pr-9 py-2 text-sm text-white placeholder:text-cinema-text-dim focus:border-cinema-gold focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cinema-text-dim hover:text-white cursor-pointer"
                title="Xóa từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="shrink-0 px-4 py-2"
          >
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Users DataTable */}
      <div className="rounded-xl border border-white/10 bg-[#121426] overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="Không tìm thấy tài khoản người dùng nào phù hợp với bộ lọc."
          pagination={{
            currentPage: pagination.currentPage || page,
            totalPages: pagination.totalPages || 1,
            totalItems: pagination.totalItems || users.length,
            limit,
            onPageChange: (nextPage) => setPage(nextPage),
          }}
        />
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        className="max-w-lg"
      >
        <Modal.Header>
          <div className="flex items-center gap-2 font-display font-bold text-white">
            {editingUser ? (
              <>
                <Edit3 className="w-5 h-5 text-cinema-gold" />
                <span>Chỉnh Sửa & Phân Quyền Tài Khoản</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 text-cinema-gold" />
                <span>Tạo Tài Khoản Người Dùng Mới</span>
              </>
            )}
          </div>
        </Modal.Header>

        <form onSubmit={handleFormSubmit}>
          <Modal.Body className="space-y-4">
            <Input
              label="Họ và tên"
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Nhập họ và tên người dùng"
              required
              leftIcon={Users}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Địa chỉ Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="example@gzacinema.vn"
                required
                disabled={Boolean(editingUser)}
                leftIcon={Mail}
              />

              <Input
                label="Số điện thoại"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                placeholder="0912345678"
                leftIcon={Phone}
              />
            </div>

            {/* Role Selector Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                Vai trò & Quyền truy cập
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.role === opt.value;
                  const isSelfAdminDemote =
                    editingUser &&
                    String(editingUser.id) === String(currentUser?.id) &&
                    opt.value !== 'admin';

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isSelfAdminDemote}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: opt.value }))
                      }
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-cinema-gold bg-cinema-gold/10'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${opt.badgeClass}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase text-cinema-gold">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="m-0 mt-0.5 text-xs text-cinema-text-muted">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Input */}
            <Input
              label={
                editingUser
                  ? 'Đặt lại mật khẩu mới (Bỏ trống nếu giữ nguyên)'
                  : 'Mật khẩu khởi tạo'
              }
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={
                editingUser
                  ? 'Nhập tối thiểu 6 ký tự nếu muốn cấp lại mật khẩu'
                  : 'Tối thiểu 6 ký tự'
              }
              required={!editingUser}
              leftIcon={Lock}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-cinema-text-dim hover:text-cinema-gold transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseFormModal}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="font-bold shadow-glow-gold-sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        className="max-w-md"
      >
        <Modal.Header>
          <div className="flex items-center gap-2 font-display font-bold text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Xác Nhận Xóa Tài Khoản</span>
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-3">
          <p className="m-0 text-sm text-cinema-text">
            Bạn có chắc chắn muốn xóa tài khoản{' '}
            <span className="font-bold text-white">
              {userToDelete?.full_name}
            </span>{' '}
            (<span className="text-cinema-gold">{userToDelete?.email}</span>)
            khỏi hệ thống?
          </p>
          <p className="m-0 text-xs text-cinema-text-muted">
            Tài khoản bị xóa sẽ không thể đăng nhập nữa, nhưng dữ liệu hóa đơn lịch sử vẫn được bảo toàn cho đối soát doanh thu.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUserToDelete(null)}
            disabled={deleteUserMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={deleteUserMutation.isPending}
            onClick={() =>
              userToDelete && deleteUserMutation.mutate(userToDelete.id)
            }
            className="!bg-rose-600 hover:!bg-rose-500 !text-white font-bold"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
