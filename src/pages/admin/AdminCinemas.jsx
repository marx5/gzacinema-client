import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cinemaApi } from '@/api/cinemaApi';
import {
    Building2,
    Plus,
    Edit3,
    Trash2,
    MapPin,
    Tv,
    Search,
    X,
    ArrowRight
} from 'lucide-react';
import { Button, Badge, Input, Textarea } from '@/components/core';

export default function AdminCinemas() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: cinemas = [], isLoading, isError } = useQuery({
        queryKey: ['admin-cinemas'],
        queryFn: async () => {
            const res = await cinemaApi.getAll();
            return res.data;
        }
    });

    useEffect(() => {
        if (isError) toast.error('Lỗi tải danh sách rạp');
    }, [isError]);

    const createMutation = useMutation({
        mutationFn: (newCinema) => cinemaApi.create(newCinema),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cinemas'] });
            toast.success('Thêm cụm rạp mới thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi thêm rạp')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => cinemaApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cinemas'] });
            toast.success('Cập nhật thông tin rạp thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi cập nhật')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => cinemaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cinemas'] });
            toast.success('Đã xóa cụm rạp');
            if (editId) resetForm();
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

    const filteredCinemas = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return cinemas;
        return cinemas.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.address || '').toLowerCase().includes(q)
        );
    }, [cinemas, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cinema-gold" />
                <p className="mt-3 text-xs font-medium text-cinema-text-muted">Đang tải hệ thống cụm rạp...</p>
            </div>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 4 Cols: Form Thêm/Sửa Cụm Rạp */}
            <div className="lg:col-span-4">
                <div className="rounded-md border border-white/10 bg-[#121324] p-5 space-y-4 lg:sticky lg:top-20">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="m-0 font-display text-sm font-bold text-white flex items-center gap-2">
                            {editId ? (
                                <>
                                    <Edit3 className="w-4 h-4 text-cinema-gold" />
                                    Cập Nhật Cụm Rạp
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 text-cinema-gold" />
                                    Thêm Cụm Rạp Mới
                                </>
                            )}
                        </h3>
                        {editId && (
                            <Badge variant="gold" size="sm">
                                Đang sửa
                            </Badge>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Tên cụm rạp *"
                            size="sm"
                            type="text"
                            required
                            value={formData.name}
                            placeholder="Ví dụ: GZACINEMA Landmark 81"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <Textarea
                            label="Địa chỉ chi tiết *"
                            required
                            rows={3}
                            value={formData.address}
                            placeholder="Tầng, Tòa nhà, Số đường, Quận/Huyện, Tỉnh/Thành phố..."
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />

                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                isLoading={isSubmitting}
                                className="flex-1 rounded-md font-bold tracking-wide"
                            >
                                {isSubmitting ? 'Đang lưu...' : (editId ? 'Lưu Thay Đổi' : 'Thêm Cụm Rạp')}
                            </Button>

                            {editId && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
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

            {/* Right 8 Cols: Danh Sách Cụm Rạp */}
            <div className="lg:col-span-8 space-y-4">
                {/* Search & Count Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-white/10 bg-[#121324] p-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cinema-gold" />
                        <span className="text-xs font-bold text-white">
                            Danh Sách Cụm Rạp ({filteredCinemas.length} / {cinemas.length})
                        </span>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-cinema-text-dim absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm theo tên rạp hoặc địa chỉ..."
                            className="w-full rounded-md border border-white/10 bg-[#0E101E] pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-cinema-text-dim outline-none focus:border-cinema-gold"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-cinema-text-dim hover:text-white cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredCinemas.length === 0 ? (
                    <div className="rounded-md border border-white/10 bg-[#121324] p-12 text-center text-cinema-text-muted space-y-2">
                        <Building2 className="w-8 h-8 text-cinema-text-dim mx-auto" />
                        <p className="text-xs font-medium">Không tìm thấy cụm rạp nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCinemas.map((cinema, idx) => {
                            const isEditingThis = editId === cinema.id;
                            return (
                                <div
                                    key={cinema.id}
                                    className={`rounded-md border bg-[#121324] p-4 transition-colors ${
                                        isEditingThis
                                            ? 'border-cinema-gold bg-cinema-gold/[0.04]'
                                            : 'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/10 bg-[#181A30] text-xs font-black text-cinema-gold tabular-nums">
                                                #{idx + 1}
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="m-0 text-sm font-bold text-white truncate">
                                                        {cinema.name}
                                                    </h4>
                                                    {isEditingThis && (
                                                        <Badge variant="gold" size="sm">Đang chọn sửa</Badge>
                                                    )}
                                                </div>
                                                <p className="m-0 text-xs text-cinema-text-muted flex items-start gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-cinema-gold shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{cinema.address}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 shrink-0">
                                            <Link to={`/admin/cinemas/${cinema.id}/rooms`}>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 items-center gap-1.5 px-3 rounded border border-cinema-gold/30 bg-cinema-gold/10 text-xs font-semibold text-cinema-gold hover:bg-cinema-gold hover:text-cinema-bg transition cursor-pointer"
                                                >
                                                    <Tv className="w-3.5 h-3.5" />
                                                    <span>Phòng chiếu</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </Link>

                                            <button
                                                type="button"
                                                title="Sửa thông tin cụm rạp"
                                                onClick={() => handleEditClick(cinema)}
                                                className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:border-blue-400/50 hover:text-blue-400 transition cursor-pointer"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                title="Xóa cụm rạp"
                                                onClick={() => handleDelete(cinema.id, cinema.name)}
                                                className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#1B1E36] text-cinema-text-muted hover:border-red-400/50 hover:text-red-400 transition cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}