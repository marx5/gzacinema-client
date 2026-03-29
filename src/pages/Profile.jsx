import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

export default function Profile() {
    const { checkAuth } = useAuthStore();

    const [fullName, setFullName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    const updateMutation = useMutation({
        mutationFn: (data) => authApi.updateProfile(data),
        onSuccess: () => {
            toast.success('Cập nhật hồ sơ thành công!');
            setIsEditingName(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            checkAuth(); // Cập nhật lại thông tin user ở header
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    });

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const updateData = {
            phone_number: phoneNumber
        };

        if (fullName.trim() && fullName.trim() !== (profileData.full_name || '').trim()) {
            updateData.full_name = fullName.trim();
        }

        if (newPassword || oldPassword || confirmPassword) {
            if (!oldPassword) return toast.error('Vui lòng nhập mật khẩu cũ');
            if (!newPassword) return toast.error('Vui lòng nhập mật khẩu mới');
            if (newPassword !== confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');
            updateData.old_password = oldPassword;
            updateData.new_password = newPassword;
        }

        updateMutation.mutate(updateData);
    };

    const isNameChanged = fullName.trim() !== (profileData.full_name || '').trim();
    const isPhoneChanged = phoneNumber.trim() !== (profileData.phone_number || '').trim();
    const hasPasswordInput = !!(oldPassword || newPassword || confirmPassword);
    const shouldShowBottomSaveButton = isNameChanged || isPhoneChanged || hasPasswordInput;

    if (isLoading) return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ddcbb6] border-t-brand-500"></div>
            <p className="mt-4 text-[#7b6446]">Đang tải hồ sơ...</p>
        </div>
    );

    return (
        <div className="mx-auto mt-10 w-full max-w-[720px] px-5 md:mt-8 md:px-4 mb-20">
            <Breadcrumb items={[{ label: 'Hồ sơ cá nhân' }]} />

            <div className="mb-6 border-b border-[#ddcbb6] pb-4">
                <h1 className="m-0 font-display text-[34px] font-extrabold text-[#3b2b19]">Hồ Sơ Của Tôi</h1>
            </div>

            <div className="bg-white p-8 shadow-[0_12px_32px_rgba(76,45,17,0.08)] border border-[#ddcbb6] sm:p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1.5 w-full bg-brand-500"></div>

                <div className="mb-8 flex items-center gap-5 border-b border-dashed border-[#ddcbb6] pb-8">
                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#f6efe3] border-2 border-brand-500 text-3xl font-bold text-brand-600 uppercase shadow-sm">
                        {profileData.full_name?.charAt(0) || profileData.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="m-0 text-[22px] font-display font-bold text-[#3b2b19]">{profileData.full_name}</h2>
                        <p className="m-0 text-[15px] text-[#7b6446]">{profileData.email}</p>
                        <span className={`mt-2 inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest border ${profileData.role === 'admin' ? 'border-red-500 text-red-600' : profileData.role === 'staff' ? 'border-blue-500 text-blue-600' : 'hidden'}`}>
                            Vai trò: {profileData.role}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[#3b2b19]">
                            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Thông tin cơ bản
                        </h3>
                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-1 bg-[#faf7f2] p-5 border border-[#ddcbb6]/50">
                            <div>
                                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8c7356] mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder={profileData.full_name || 'Chưa cập nhật'}
                                    required
                                    readOnly={!isEditingName}
                                    className={`w-full border px-4 py-2.5 text-[15px] text-[#3b2b19] transition-all ${isEditingName
                                        ? 'border-[#ddcbb6] bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
                                        : 'cursor-not-allowed border-[#e4d7c7] bg-[#f4eee6]'
                                        }`}
                                />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {!isEditingName ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsEditingName(true);
                                            }}
                                            className="border border-brand-500 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-brand-600 transition hover:bg-brand-500 hover:text-white"
                                        >
                                            Sửa tên
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={updateMutation.isLoading}
                                                className="bg-brand-500 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                Cập nhật tên
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFullName(profileData.full_name || '');
                                                    setIsEditingName(false);
                                                }}
                                                className="border border-[#c9b299] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#7b6446] transition hover:bg-[#f7f0e7]"
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#8c7356] mb-2">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={profileData.phone_number || 'Chưa cập nhật'}
                                    className="w-full border border-[#ddcbb6] bg-white px-4 py-2.5 text-[15px] text-[#3b2b19] transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[#3b2b19]">
                            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Đổi mật khẩu
                            <span className="text-sm font-normal text-[#8c7356] italic ml-2">(Bỏ trống nếu không muốn đổi)</span>
                        </h3>

                        <div className="flex flex-col gap-4 bg-[#fcf9f4] p-5 border border-[#ddcbb6]/50">
                            <div>
                                <input
                                    type="password"
                                    placeholder="Mật khẩu hiện tại"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full border border-[#ddcbb6] bg-white px-4 py-2.5 text-[15px] text-[#3b2b19] transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border border-[#ddcbb6] bg-white px-4 py-2.5 text-[15px] text-[#3b2b19] transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border border-[#ddcbb6] bg-white px-4 py-2.5 text-[15px] text-[#3b2b19] transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    {shouldShowBottomSaveButton && (
                        <div className="mt-4 flex justify-end pt-4 border-t border-dashed border-[#ddcbb6]">
                            <button
                                type="submit"
                                disabled={updateMutation.isLoading}
                                className="min-w-[180px] bg-brand-500 py-3.5 px-6 text-sm font-bold tracking-wider text-white transition-all hover:bg-brand-600 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed sm:w-full"
                            >
                                {updateMutation.isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        ĐANG LƯU...
                                    </span>
                                ) : 'LƯU THAY ĐỔI'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}