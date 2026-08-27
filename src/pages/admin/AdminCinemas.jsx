import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '../../api/cinemaApi';
import { Building2, Plus, Edit3, Trash2, MapPin, Sparkles, Tv } from 'lucide-react';
import { Button, Badge, Input, Textarea } from '../../components/core';

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
            toast.success('Thêm cụm rạp mới thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi thêm rạp')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => cinemaApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-cinemas']);
            toast.success('Cập nhật thông tin rạp thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi cập nhật')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => cinemaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-cinemas']);
            toast.success('Đã xóa cụm rạp');
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

    const handleDelete = (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa rạp "${name}"? Toàn bộ phòng chiếu và suất chiếu liên quan sẽ bị xóa!`)) return;
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

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cinema-gold" />
                <p className="mt-4 font-medium text-cinema-text-muted">Đang tải hệ thống rạp...</p>
            </div>
        );
    }

    const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Thêm/Sửa Cụm Rạp */}
                <div className="lg:col-span-5">
                    <div className="glass-card rounded-md border border-white/10 p-6 shadow-cinematic space-y-5 lg:sticky lg:top-24">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="m-0 font-display text-base font-bold text-cinema-text flex items-center gap-2">
                                <Plus className="w-4 h-4 text-cinema-gold" />
                                {editId ? 'Cập Nhật Cụm Rạp' : 'Thêm Cụm Rạp Mới'}
                            </h3>
                            {editId && (
                                <Badge variant="gold" size="sm">
                                    Đang chỉnh sửa
                                </Badge>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Tên cụm rạp *"
                                type="text"
                                required
                                value={formData.name}
                                placeholder="Ví dụ: GZACINEMA Landmark 81"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <Textarea
                                label="Địa chỉ rạp *"
                                required
                                rows={3}
                                value={formData.address}
                                placeholder="Tầng, Tòa nhà, Số đường, Phường/Quận, Thành phố..."
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />

                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    isLoading={isSubmitting}
                                    className="flex-1 rounded-md font-bold tracking-wide shadow-glow-gold-sm"
                                >
                                    {isSubmitting ? 'ĐANG XỬ LÝ...' : (editId ? 'LƯU THAY ĐỔI' : 'THÊM CỤM RẠP')}
                                </Button>

                                {editId && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="md"
                                        onClick={resetForm}
                                        className="rounded-md text-xs"
                                    >
                                        Hủy
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Danh Sách Rạp */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="m-0 font-display text-lg font-bold text-cinema-text">
                            Danh Sách Cụm Rạp ({cinemas.length})
                        </h3>
                    </div>

                    {cinemas.length === 0 ? (
                        <div className="glass-card rounded-md border border-white/10 p-12 text-center text-cinema-text-muted space-y-2">
                            <Building2 className="w-10 h-10 text-cinema-text-dim mx-auto" />
                            <p className="text-sm font-semibold">Chưa có rạp nào trong hệ thống.</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {cinemas.map(cinema => (
                                <div
                                    key={cinema.id}
                                    className="glass-card rounded-md border border-white/10 p-5 shadow-sm space-y-4 hover:border-cinema-gold/30 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <h4 className="m-0 text-base font-bold text-cinema-text">
                                                {cinema.name}
                                            </h4>
                                            <p className="m-0 text-xs text-cinema-text-muted flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                                                <span>{cinema.address}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                            <button
                                                type="button"
                                                title="Sửa thông tin cụm rạp"
                                                onClick={() => handleEditClick(cinema)}
                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400 transition-all hover:border-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Xóa cụm rạp"
                                                onClick={() => handleDelete(cinema.id, cinema.name)}
                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                                        <span className="text-xs text-cinema-text-dim">
                                            Quản lý sơ đồ ghế & phòng chiếu
                                        </span>
                                        <Link to={`/admin/cinemas/${cinema.id}/rooms`}>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="rounded-md text-xs border-cinema-gold/30 hover:border-cinema-gold hover:text-cinema-gold"
                                                leftIcon={<Tv className="w-3.5 h-3.5" />}
                                            >
                                                Quản lý Phòng chiếu &rarr;
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}