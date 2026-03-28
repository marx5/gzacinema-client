import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { movieApi } from '../../api/movieApi';
import { optimizeCloudinaryUrl } from '../../utils/cloudinary';
import AdminMovieForm from './AdminMovieForm';
import TableSkeleton from '../../components/TableSkeleton';
import Breadcrumb from '../../components/Breadcrumb';

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

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phim này? Mọi lịch chiếu liên quan cũng sẽ bị ảnh hưởng!')) {
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
        <div className="mx-auto mt-6 w-full max-w-[1200px] px-4 md:mt-8 mb-20">
            <Breadcrumb items={[{ label: 'Quản trị', link: '/admin' }, { label: 'Quản lý Phim' }]} />
            <div className="mb-6 flex items-center justify-between sm:flex-col sm:items-start sm:gap-4">
                <h1 className="m-0 font-display text-[32px] text-[#3b2b19]">Quản Lý Phim</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-brand-500 px-5 py-[10px] text-sm font-bold text-white transition hover:bg-brand-600"
                >
                    + THÊM PHIM MỚI
                </button>
            </div>

            <div className="mb-6 flex items-center gap-3 bg-white p-4 border border-[#ddcbb6] shadow-sm">
                <label className="text-sm font-bold text-[#3b2b19]">Lọc theo trạng thái:</label>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-[#ddcbb6] bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                    <option value="">Tất cả các phim</option>
                    <option value="showing">Đang chiếu</option>
                    <option value="coming_soon">Sắp chiếu</option>
                </select>
            </div>

            <div className="relative overflow-x-auto border border-[#ddcbb6] bg-white shadow-[0_8px_22px_rgba(76,45,17,0.08)]">

                {isFetching && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                        <span className="rounded-md border border-[#ddcbb6] bg-white px-5 py-2 text-sm font-bold text-brand-600 shadow-md">
                            Đang tải dữ liệu...
                        </span>
                    </div>
                )}

                <table className="w-full text-left text-sm text-[#3b2b19] min-w-[900px]">
                    <thead className="bg-[#fff6ec] border-b border-[#ddcbb6]">
                        <tr>
                            <th className="px-4 py-4 font-bold w-[80px]">Poster</th>
                            <th className="px-4 py-4 font-bold">Thông tin phim</th>
                            <th className="px-4 py-4 font-bold w-[120px]">Thời lượng</th>
                            <th className="px-4 py-4 font-bold w-[140px]">Khởi chiếu</th>
                            <th className="px-4 py-4 font-bold text-center w-[240px]">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!data ? (
                            <TableSkeleton rows={6} columns={5} />
                        ) : movies.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-10 text-center text-[#8c7356]">Không tìm thấy bộ phim nào.</td></tr>
                        ) : (
                            movies.map(movie => (
                                <tr key={movie.id} className="border-b border-dashed border-[#ddcbb6] transition hover:bg-[#faf4ed]">
                                    <td className="px-4 py-3">
                                        <img src={optimizeCloudinaryUrl(movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop', 100)} alt={movie.title} loading="lazy" className="w-[60px] h-[90px] object-cover border border-[#ddcbb6]" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-[16px] text-brand-700">{movie.title}</div>
                                        <div className="mt-1 text-xs text-[#8c7356] uppercase tracking-wide">{movie.genre || 'Chưa cập nhật'}</div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-[#7b6446]">{movie.duration_minutes} phút</td>
                                    <td className="px-4 py-3">{new Date(movie.release_date).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <Link to={`/admin/movies/${movie.id}/showtimes`} className="border border-brand-500 bg-[#fffaf3] px-3 py-[6px] text-xs font-bold text-brand-600 transition hover:bg-brand-500 hover:text-white">
                                                LỊCH CHIẾU
                                            </Link>
                                            <button
                                                onClick={() => handleOpenEditModal(movie.id)}
                                                className="bg-[#b2720a] px-3 py-[6px] text-xs font-bold text-white transition hover:bg-[#8f5a06]"
                                            >
                                                SỬA
                                            </button>

                                            <button onClick={() => handleDelete(movie.id)} className="bg-[#b0232f] px-3 py-[6px] text-xs font-bold text-white transition hover:bg-[#8a1924]">
                                                XÓA
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="border border-[#ddcbb6] bg-white px-4 py-2 text-sm font-bold text-[#7b6446] disabled:opacity-50 hover:bg-[#fff6ec] transition"
                    >
                        &larr; TRƯỚC
                    </button>

                    <span className="flex items-center px-4 py-2 text-sm font-bold text-[#3b2b19]">
                        Trang {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="border border-[#ddcbb6] bg-white px-4 py-2 text-sm font-bold text-[#7b6446] disabled:opacity-50 hover:bg-[#fff6ec] transition"
                    >
                        SAU &rarr;
                    </button>
                </div>
            )}

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