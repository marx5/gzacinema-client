import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { movieApi } from '../../api/movieApi';

export default function AdminMovies() {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [trailerUrl, setTrailerUrl] = useState('');
    const [editId, setEditId] = useState(null);

    const { data: movies = [], isLoading } = useQuery({
        queryKey: ['admin-movies'],
        queryFn: async () => {
            const res = await movieApi.getAll();
            return res.data;
        },
        onError: () => toast.error('Lỗi tải danh sách phim')
    });

    const createMutation = useMutation({
        mutationFn: (newMovie) => movieApi.create(newMovie),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-movies']);
            toast.success('Thêm phim mới thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi thêm phim')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => movieApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-movies']);
            toast.success('Cập nhật phim thành công!');
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Lỗi khi cập nhật')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => movieApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-movies']);
            toast.success('Đã xóa phim');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Không thể xóa phim này')
    });

    const resetForm = () => {
        setTitle('');
        setGenre('');
        setDescription('');
        setDurationMinutes('');
        setReleaseDate('');
        setThumbnailFile(null);
        setThumbnailPreview('');
        setTrailerUrl('');
        setEditId(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre);
        formData.append('description', description);
        formData.append('duration_minutes', durationMinutes);
        formData.append('release_date', releaseDate);
        formData.append('trailer_url', trailerUrl);

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        if (editId) {
            updateMutation.mutate({ id: editId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEditClick = (movie) => {
        setEditId(movie.id);
        setTitle(movie.title);
        setGenre(movie.genre || '');
        setDescription(movie.description);
        setDurationMinutes(movie.duration_minutes);
        setTrailerUrl(movie.trailer_url || '');

        setThumbnailPreview(movie.thumbnail || '');
        setThumbnailFile(null);

        const formattedDate = new Date(movie.release_date).toISOString().split('T')[0];
        setReleaseDate(formattedDate);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phim này? Các suất chiếu liên quan có thể bị ảnh hưởng!')) return;
        deleteMutation.mutate(id);
    };

    if (isLoading) return <div className="py-10 text-center text-[#7b6446]">Đang tải dữ liệu...</div>;

    const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

    return (
        <div className="mx-auto mt-10 w-full max-w-[1080px] px-5 md:mt-8 md:px-4 grid grid-cols-1 md:grid-cols-[500px_1fr] gap-6">

            {/* CỘT TRÁI: FORM THÊM/SỬA PHIM */}
            <div className="border border-[#ddcbb6] bg-white p-6 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                <h2 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-lg text-[#3b2b19]">
                    {editId ? 'Cập Nhật Phim' : 'Thêm Phim Mới'}
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Tên phim:</label>
                        <input
                            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Thể loại:</label>
                        <input
                            type="text" placeholder="VD: Hành động, Hài hước..." value={genre} onChange={(e) => setGenre(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Link Ảnh Poster (Thumbnail):</label>
                        <input
                            type="file" accept="image/*" onChange={handleFileChange}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                        {thumbnailPreview && (
                            <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-[120px] w-auto object-cover border border-[#ddcbb6]" />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Link Trailer YouTube:</label>
                        <input
                            type="text" placeholder="https://www.youtube.com/watch?v=..." value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Thời lượng (phút):</label>
                        <input
                            type="number" required min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Ngày khởi chiếu:</label>
                        <input
                            type="date" required value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#3b2b19] mb-1">Mô tả nội dung:</label>
                        <textarea
                            required rows="4" value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-[#ddcbb6] px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-3 bg-brand-500 px-4 py-[10px] text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                        {isSubmitting ? 'Đang lưu...' : (editId ? 'Lưu Thay Đổi' : 'Thêm Phim')}
                    </button>

                    {editId && (
                        <button type="button" onClick={resetForm} className="bg-[#cfb596] px-4 py-[10px] text-sm font-bold text-white hover:bg-[#7a8fc1]">
                            Hủy Sửa
                        </button>
                    )}
                </form>
            </div>

            {/* CỘT PHẢI: DANH SÁCH PHIM */}
            <div>
                <h2 className="m-0 border-b border-[#ddcbb6] pb-3 font-display text-2xl text-[#3b2b19]">Phim Trong Hệ Thống</h2>

                <div className="mt-4 flex flex-col gap-3">
                    {movies.length === 0 ? (
                        <p className="border border-[#ddcbb6] bg-white p-8 text-center text-[#8c7356] shadow-[0_8px_22px_rgba(76,45,17,0.10)]">Chưa có phim nào trong hệ thống.</p>
                    ) : (
                        movies.map(movie => (
                            <div key={movie.id} className="border border-[#ddcbb6] bg-white p-3 shadow-[0_8px_22px_rgba(76,45,17,0.10)]">
                                <div className="mb-2 flex justify-between items-start border-b border-[#ddcbb6] pb-2">
                                    <div className="flex gap-2">
                                        {movie.thumbnail && (
                                            <img src={movie.thumbnail} alt={movie.title} className="h-[60px] w-[45px] object-cover" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="m-0 font-bold text-[#3b2b19]">{movie.title}</h3>
                                            <p className="mb-0 m-0 text-xs text-[#8c7356]">Thể loại: {movie.genre || 'Chưa rõ'}</p>
                                            <p className="mb-0 m-0 text-xs text-[#8c7356]">
                                                {movie.duration_minutes} phút | {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(movie)} className="bg-[#b89a4f] px-3 py-2 text-xs font-bold text-white hover:bg-[#9f8042]" type="button">Sửa</button>
                                        <button onClick={() => handleDelete(movie.id)} className="bg-[#b0232f] px-3 py-2 text-xs font-bold text-white hover:bg-[#8a1924]" type="button">Xóa</button>
                                    </div>
                                </div>
                                <p className="mb-0 m-0 text-sm text-[#7b6446] line-clamp-2">
                                    {movie.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}