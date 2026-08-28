import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';
import { Button, Modal, Input } from '@/components/core';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.friendlyMessage || 'Đổi mật khẩu thất bại');
    },
  });

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!oldPassword) return toast.error('Vui lòng nhập mật khẩu hiện tại');
    if (!newPassword) return toast.error('Vui lòng nhập mật khẩu mới');
    if (newPassword.length < 6) return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    if (newPassword !== confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');

    changePasswordMutation.mutate({
      old_password: oldPassword,
      new_password: newPassword,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <Modal.Header>
        <div className="flex items-center gap-2 font-display font-bold text-cinema-text">
          <Lock className="w-5 h-5 text-cinema-gold" />
          <span>Đổi Mật Khẩu</span>
        </div>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            required
            leftIcon={Lock}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="text-cinema-text-dim hover:text-cinema-gold transition-colors cursor-pointer"
                aria-label="Toggle old password visibility"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Mật khẩu mới"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
            leftIcon={Lock}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="text-cinema-text-dim hover:text-cinema-gold transition-colors cursor-pointer"
                aria-label="Toggle new password visibility"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
            leftIcon={Lock}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-cinema-text-dim hover:text-cinema-gold transition-colors cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={changePasswordMutation.isPending}
            className="rounded-md"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={changePasswordMutation.isPending}
            className="rounded-md font-bold tracking-wide shadow-glow-gold-sm"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Cập nhật mật khẩu
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
