import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { movieApi } from '@/api/movieApi';
import AdminMovieForm from './AdminMovieForm';
import { Film, Plus, Calendar, Clock, Edit3, Trash2, Search, Sparkles, Filter } from 'lucide-react';
import { Button, Badge, Select, DataTable } from '@/components/core';

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

    const columns = useMemo(() => [
        {
            title: 'Poster',
            dataIndex: 'thumbnail',
            width: '90px',
            render: (thumbnail, movie) => (
                <img
                    src={thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop'}
                    alt={movie.title}
                    loading="lazy"
                    className="w-[60px] h-[90px] object-cover rounded-md border border-white/10 shadow-sm"
                />
            )
        },
        {
            title: 'Tên & Thể Loại',
            dataIndex: 'title',
            render: (title, movie) => (
                <div>
                    <div className="font-bold text-base text-cinema-text line-clamp-1">
                        {title}
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
                </div>
            )
        },
        {
            title: 'Thời lượng',
            dataIndex: 'duration_minutes',
            width: '130px',
            render: (duration) => (
                <div className="flex items-center gap-1.5 text-xs text-cinema-text-muted font-medium">
                    <Clock className="w-3.5 h-3.5 text-cinema-gold" />
                    <span>{duration} phút</span>
                </div>
            )
        },
        {
            title: 'Khởi chiếu',
            dataIndex: 'release_date',
            width: '150px',
            render: (releaseDate) => (
                <div className="flex items-center gap-1.5 text-xs text-cinema-text-muted">
                    <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
                    <span>{new Date(releaseDate).toLocaleDateString('vi-VN')}</span>
                </div>
            )
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: '140px',
            align: 'center',
            render: (_, movie) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link to={`/admin/movies/${movie.id}/showtimes`}>
                        <button
                            type="button"
                            title="Quản lý lịch chiếu"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-cinema-gold/30 bg-cinema-surface text-cinema-gold transition-all hover:border-cinema-gold hover:bg-cinema-gold/10 hover:shadow-glow-gold-sm"
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                    </Link>

                    <button
                        type="button"
                        title="Chỉnh sửa thông tin phim"
                        onClick={() => handleOpenEditModal(movie.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400 transition-all hover:border-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        title="Xóa phim"
                        onClick={() => handleDelete(movie.id, movie.title)}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], []);

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
            <DataTable
                columns={columns}
                data={movies}
                loading={!data}
                isFetching={isFetching}
                loadingMessage="Đang tải danh sách phim..."
                emptyMessage="Không tìm thấy bộ phim nào phù hợp."
                emptyIcon={Film}
                pagination={{
                    page,
                    totalPages,
                    onPageChange: setPage
                }}
            />

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