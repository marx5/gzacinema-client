import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Profile() {
    const { checkAuth } = useAuthStore();

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await authApi.getProfile();
            return res.data;
        },
        onSuccess: (data) => {
            if (data) {
                setFullName(data.full_name || '');
                setPhoneNumber(data.phone_number || '');
            }
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => authApi.updateProfile(data),
        onSuccess: () => {
            toast.success('Cập nhật hồ sơ thành công!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            checkAuth();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const updateData = {
            full_name: fullName,
            phone_number: phoneNumber
        };

        if (newPassword) {
            if (!oldPassword) return toast.error('Vui lòng nhập mật khẩu cũ');
            if (newPassword !== confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');
            updateData.old_password = oldPassword;
            updateData.new_password = newPassword;
        }

        updateMutation.mutate(updateData);
    };

    if (isLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải hồ sơ...</div>;

    return (
        <div className="mx-auto mt-10 w-full max-w-[600px] px-5 md:mt-8 md:px-4">
            <h1 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-[34px] text-[#3b2b19]">Hồ Sơ Của Tôi</h1>

            <div className="mt-5 border border-[#ddcbb6] bg-white p-8 shadow-[0_8px_22px_rgba(76,45,17,0.10)] sm:p-5">
                <div className="mb-6 flex items-center gap-4 border-b border-dashed border-[#ddcbb6] pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white uppercase">
                        {profile?.email?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="m-0 text-xl font-bold text-[#3b2b19]">{profile?.email}</h2>
                        <span className="mt-1 inline-block bg-[#fff6ec] px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#8c7356] border border-[#ddcbb6]">
                            Vai trò: {profile?.role}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">Họ và tên:</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border border-[#ddcbb6] px-3 py-2 text-sm focus:outline-brand-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3b2b19] mb-2">Số điện thoại:</label>
                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm focus:outline-brand-500" />
                        </div>
                    </div>

                    <div className="mt-4 border-t border-[#ddcbb6] pt-5">
                        <h3 className="m-0 mb-4 text-base font-bold text-[#3b2b19]">Đổi Mật Khẩu (Tùy chọn)</h3>
                        <div className="flex flex-col gap-4">
                            <input type="password" placeholder="Mật khẩu hiện tại" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm focus:outline-brand-500" />
                            <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm focus:outline-brand-500" />
                            <input type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-[#ddcbb6] px-3 py-2 text-sm focus:outline-brand-500" />
                        </div>
                    </div>

                    <button type="submit" disabled={updateMutation.isLoading} className="mt-2 bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                        {updateMutation.isLoading ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                    </button>
                </form>
            </div>
        </div>
    );
}