import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { movieApi } from '../../api/movieApi';
import AdminMovieForm from './AdminMovieForm';
import { Film, Plus, Calendar, Clock, Edit3, Trash2, Search, Sparkles, Filter } from 'lucide-react';
import { Button, Badge, Select, TableSkeleton } from '../../components/core';

export default function AdminMovies() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovieId, setEditingMovieId] = useState(null);

    const { data, isFetching } = useQuery({
        queryKey: ['admin-movies', page, statusFilter],
        queryFn: async () => {
            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            const res = await movieApi.getAll(params);
            return res.data;
        },
        placeholderData: keepPreviousData
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => movieApi.delete(id),
        onSuccess: () => {
            toast.success('Xóa phim thành công');
            queryClient.invalidateQueries(['admin-movies']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa phim này')
    });

    const handleDelete = (id, title) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa phim "${title}"? Mọi lịch chiếu liên quan cũng sẽ bị xóa!`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingMovieId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (id) => {
        setEditingMovieId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMovieId(null);
    };

    const handleSaveSuccess = () => {
        queryClient.invalidateQueries(['admin-movies']);
        handleCloseModal();
    };

    const movies = data?.movie || data?.movies || data?.data || data || [];
    const totalPages = data?.total_pages || 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Standardized Action & Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenCreateModal}
                    className="rounded-md font-bold tracking-wide shadow-glow-gold-sm shrink-0"
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    THÊM PHIM MỚI
                </Button>

                {/* Filter Controls on 1 Row - Aligned Right */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 ml-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-cinema-surface text-cinema-gold shrink-0">
                        <Filter className="w-4 h-4" />
                    </div>

                    <div className="w-44 sm:w-52">
                        <Select
                            value={statusFilter}
                            size="sm"
                            onChange={(val) => { setStatusFilter(val); setPage(1); }}
                            options={[
                                { value: '', label: 'Tất cả các phim' },
                                { value: 'showing', label: 'Phim đang chiếu' },
                                { value: 'coming_soon', label: 'Phim sắp chiếu' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Movies Table */}
            <div className="relative z-10 glass-card rounded-md border border-white/10 shadow-cinematic overflow-hidden">
                {isFetching && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-cinema-bg/60 backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 rounded-md border border-cinema-gold/40 bg-cinema-surface px-4 py-2 text-xs font-bold text-cinema-gold shadow-glow-gold-sm">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                            Đang tải danh sách phim...
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-cinema-text min-w-[900px]">
                        <thead className="bg-cinema-surface-elevated/80 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                            <tr>
                                <th className="px-5 py-4 w-[90px]">Poster</th>
                                <th className="px-5 py-4">Tên & Thể Loại</th>
                                <th className="px-5 py-4 w-[130px]">Thời lượng</th>
                                <th className="px-5 py-4 w-[150px]">Khởi chiếu</th>
                                <th className="px-5 py-4 text-center w-[260px]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {!data ? (
                                <TableSkeleton rows={6} columns={5} />
                            ) : movies.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center text-cinema-text-muted">
                                        <Film className="w-10 h-10 text-cinema-text-dim mx-auto mb-2" />
                                        Không tìm thấy bộ phim nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                movies.map((movie) => (
                                    <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3">
                                            <img
                                                src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop'}
                                                alt={movie.title}
                                                loading="lazy"
                                                className="w-[60px] h-[90px] object-cover rounded-md border border-white/10 shadow-sm"
                                            />
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="font-bold text-base text-cinema-text line-clamp-1">
                                                {movie.title}
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <Badge variant="glass" size="sm" className="rounded-md">
                                                    {movie.genre || 'Chưa cập nhật'}
                                                </Badge>
                                                {movie.age_rating && (
                                                    <Badge variant="rose" size="sm" className="rounded-md">
                                                        {movie.age_rating}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-cinema-text-muted font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-cinema-gold" />
                                                <span>{movie.duration_minutes} phút</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-cinema-text-muted">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
                                                <span>{new Date(movie.release_date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/admin/movies/${movie.id}/showtimes`}>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="rounded-md text-xs border-cinema-gold/30 hover:border-cinema-gold hover:text-cinema-gold"
                                                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                                                    >
                                                        Lịch chiếu
                                                    </Button>
                                                </Link>

                                                <Button
                                                    variant="glass"
                                                    size="sm"
                                                    onClick={() => handleOpenEditModal(movie.id)}
                                                    className="rounded-md text-xs hover:border-cinema-gold/40"
                                                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                                                >
                                                    Sửa
                                                </Button>

                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(movie.id, movie.title)}
                                                    className="rounded-md text-xs"
                                                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 border-t border-white/10 p-4 bg-white/[0.01]">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="rounded-md"
                        >
                            &larr; Trước
                        </Button>

                        <span className="px-3 text-xs font-bold text-cinema-text">
                            Trang {page} / {totalPages}
                        </span>

                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-md"
                        >
                            Sau &rarr;
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <AdminMovieForm
                    movieId={editingMovieId}
                    onClose={handleCloseModal}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
}