import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '../../api/cinemaApi';

export default function AdminCinemas() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [editId, setEditId] = useState(null);

    const { data: cinemas = [], isLoading } = useQuery({
        queryKey: ['admin-cinemas'],
        queryFn: async () => {
            const res = await cinemaApi.getAll();
            return res.data;
        },
        onError: () => toast.error('Lỗi tải danh sách rạp')
    });

    const createMutation = useMutation({
        mutationFn: (newCinema) => cinemaApi.create(newCinema),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-cinemas']);
            toast.success('Thêm rạp mới thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi thêm rạp')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => cinemaApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-cinemas']);
            toast.success('Cập nhật rạp thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi cập nhật')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => cinemaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-cinemas']);
            toast.success('Đã xóa rạp');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa rạp này')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            updateMutation.mutate({ id: editId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa rạp này? Toàn bộ phòng và suất chiếu liên quan sẽ bị ảnh hưởng!')) return;
        deleteMutation.mutate(id);
    };

    const handleEditClick = (cinema) => {
        setEditId(cinema.id);
        setFormData({ name: cinema.name, address: cinema.address });
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ name: '', address: '' });
    };

    if (isLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải hệ thống...</div>;

    const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4 grid grid-cols-[380px_1fr] gap-6 md:grid-cols-1">
            {/* CỘT TRÁI: FORM THÊM/SỬA */}
            <div className="border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                <h2 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-lg text-[#3b2b19]">
                    {editId ? 'Cập Nhật Rạp' : 'Thêm Rạp Mới'}
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Tên rạp:</label>
                        <input
                            type="text" required value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Địa chỉ:</label>
                        <textarea
                            required rows="3" value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 bg-brand-500 px-4 py-[10px] text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Đang xử lý...' : (editId ? 'Lưu Thay Đổi' : 'Thêm Rạp')}
                    </button>

                    {editId && (
                        <button type="button" onClick={resetForm} className="bg-[#cfb596] px-4 py-[10px] text-sm font-bold text-white hover:bg-[#7a8fc1]">
                            Hủy Sửa
                        </button>
                    )}
                </form>
            </div>

            {/* CỘT PHẢI: DANH SÁCH RẠP */}
            <div>
                <h2 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-2xl text-[#3b2b19]">Danh Sách Rạp</h2>

                <div className="mt-4 flex flex-col gap-3">
                    {cinemas.length === 0 ? (
                        <p className="border border-[#ddcbb6] bg-white p-8 text-center text-[#8c7356] shadow-[0_8px_22px_rgba(76,45,17,0.10)]">Chưa có rạp nào trong hệ thống.</p>
                    ) : (
                        cinemas.map(cinema => (
                            <div key={cinema.id} className="border border-[#ddcbb6] bg-white p-4 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                                <div className="mb-3 flex justify-between border-b border-[#ddcbb6] pb-3 md:flex-col md:gap-3">
                                    <div>
                                        <h3 className="m-0 font-bold text-[#3b2b19]">{cinema.name}</h3>
                                        <p className="mb-0 m-0 mt-1 text-sm text-[#8c7356]">{cinema.address}</p>
                                    </div>

                                    <div className="flex flex-col gap-2 md:flex-row">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditClick(cinema)} className="bg-[#b89a4f] px-3 py-2 text-xs font-bold text-white hover:bg-[#9f8042]" type="button">Sửa</button>
                                            <button onClick={() => handleDelete(cinema.id)} className="bg-[#b0232f] px-3 py-2 text-xs font-bold text-white hover:bg-[#8a1924]" type="button">Xóa</button>
                                        </div>
                                        <Link to={`/admin/cinemas/${cinema.id}/rooms`}>
                                            <button className="w-full bg-brand-500 px-3 py-2 text-xs font-bold text-white hover:bg-brand-600" type="button">Quản lý Phòng</button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}