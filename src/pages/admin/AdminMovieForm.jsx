import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { movieApi } from '@/api/movieApi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Film, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { Button, Input, Textarea, DatePicker } from '@/components/core';
import { toLocalDateString } from '@/utils/formatters';

const movieSchema = z.object({
    title: z.string().min(1, 'Tên phim không được để trống'),
    genre: z.string().optional(),
    duration_minutes: z.coerce.number().int().min(1, 'Thời lượng phải lớn hơn 0'),
    release_date: z.string().min(1, 'Vui lòng chọn ngày khởi chiếu'),
    trailer_url: z.string().url('Link trailer không hợp lệ').or(z.literal('')).optional(),
    thumbnail: z.any().refine((file) => file instanceof File || (typeof file === 'string' && file.length > 0), {
        message: 'Vui lòng chọn ảnh poster hợp lệ',
    }),
    description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự')
});

const QUICK_GENRES = ['Hành động', 'Viễn tưởng', 'Kinh dị', 'Hoạt hình', 'Tình cảm', 'Hài hước', 'Tâm lý'];
const QUICK_DURATIONS = [95, 110, 120, 135, 150];

export default function AdminMovieForm({ movieId, onClose, onSaveSuccess }) {
    const isEditMode = Boolean(movieId);
    const [previewImage, setPreviewImage] = useState(null);

    const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm({
        resolver: zodResolver(movieSchema),
        defaultValues: {
            title: '',
            genre: '',
            duration_minutes: 120,
            release_date: '',
            trailer_url: '',
            description: ''
        }
    });

    const currentGenre = watch('genre') || '';

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setValue('thumbnail', file, { shouldValidate: true });
        }
    };

    const handleToggleGenreChip = (g) => {
        const parts = currentGenre
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        const exists = parts.includes(g);
        const next = exists ? parts.filter(item => item !== g) : [...parts, g];
        setValue('genre', next.join(', '), { shouldValidate: true });
    };

    const { data: movieData, isLoading: isFetchingMovie } = useQuery({
        queryKey: ['admin-movie-detail', movieId],
        queryFn: async () => (await movieApi.getById(movieId)).data,
        enabled: isEditMode,
    });

    useEffect(() => {
        if (isEditMode && movieData) {
            const formattedDate = movieData.release_date ? toLocalDateString(movieData.release_date) : '';
            reset({ ...movieData, release_date: formattedDate });

            if (movieData.thumbnail) {
                setPreviewImage(movieData.thumbnail);
                setValue('thumbnail', movieData.thumbnail);
            }
        }
    }, [isEditMode, movieData, reset, setValue]);

    const mutation = useMutation({
        mutationFn: (data) => isEditMode ? movieApi.update(movieId, data) : movieApi.create(data),
        onSuccess: () => {
            toast.success(isEditMode ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');
            if (onSaveSuccess) onSaveSuccess();
        },
        onError: (error) => toast.error(error.friendlyMessage || error.response?.data?.message || 'Có lỗi xảy ra khi lưu phim')
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        mutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative flex w-full max-w-[880px] max-h-[92vh] flex-col overflow-hidden rounded-md border border-white/15 bg-[#121324] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#16182D] px-5 py-3.5 shrink-0">
                    <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-cinema-gold" />
                        <h3 className="m-0 font-display text-base font-bold text-white">
                            {isEditMode ? 'Chỉnh Sửa Thông Tin Phim' : 'Thêm Phim Điện Ảnh Mới'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded text-cinema-text-muted hover:text-white hover:bg-white/10 transition cursor-pointer"
                        aria-label="Close form"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {isEditMode && isFetchingMovie ? (
                    <div className="flex-1 py-20 flex flex-col items-center justify-center gap-3 text-cinema-text-muted">
                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                        <p className="text-xs font-medium">Đang tải thông tin phim...</p>
                    </div>
                ) : (
                    /* Body Content */
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Left Poster Uploader */}
                            <div className="md:col-span-4 space-y-2.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                                    Ảnh Poster (2:3) *
                                </label>
                                <label
                                    htmlFor="poster-upload"
                                    className="aspect-[2/3] w-full max-w-[210px] mx-auto overflow-hidden rounded-md border border-dashed border-white/20 bg-[#17192E] flex items-center justify-center relative group cursor-pointer hover:border-cinema-gold/50 transition"
                                >
                                    {previewImage ? (
                                        <>
                                            <img src={previewImage} alt="Poster preview" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white gap-1.5">
                                                <Upload className="w-4 h-4 text-cinema-gold" />
                                                Đổi Poster
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4 text-cinema-text-dim space-y-2">
                                            <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                                            <span className="block text-xs">Nhấn để tải ảnh lên</span>
                                        </div>
                                    )}
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    id="poster-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="poster-upload"
                                    className="block w-full max-w-[210px] mx-auto cursor-pointer rounded-md border border-cinema-gold/30 bg-cinema-gold/10 text-center px-3 py-2 text-xs font-bold text-cinema-gold transition hover:bg-cinema-gold hover:text-cinema-bg"
                                >
                                    <Upload className="w-3.5 h-3.5 inline-block mr-1.5" />
                                    Chọn Tệp Ảnh
                                </label>
                                {errors.thumbnail && <p className="text-center text-xs text-red-400">{errors.thumbnail.message}</p>}
                            </div>

                            {/* Right Fields */}
                            <div className="md:col-span-8 space-y-4">
                                <Input
                                    label="Tên bộ phim *"
                                    placeholder="Nhập tên bộ phim..."
                                    error={errors.title?.message}
                                    {...register('title')}
                                />

                                <div className="space-y-1.5">
                                    <Input
                                        label="Thể loại"
                                        placeholder="Ví dụ: Hành động, Viễn tưởng..."
                                        error={errors.genre?.message}
                                        {...register('genre')}
                                    />
                                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                        <span className="text-[11px] text-cinema-text-dim mr-1">Chọn nhanh:</span>
                                        {QUICK_GENRES.map((g) => {
                                            const active = currentGenre.toLowerCase().includes(g.toLowerCase());
                                            return (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => handleToggleGenreChip(g)}
                                                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                                        active
                                                            ? 'bg-cinema-gold text-cinema-bg font-bold'
                                                            : 'bg-white/5 text-cinema-text-muted hover:text-white border border-white/10'
                                                    }`}
                                                >
                                                    {g}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Input
                                            label="Thời lượng (phút) *"
                                            type="number"
                                            placeholder="120"
                                            error={errors.duration_minutes?.message}
                                            {...register('duration_minutes')}
                                        />
                                        <div className="flex items-center gap-1">
                                            {QUICK_DURATIONS.map((d) => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => setValue('duration_minutes', d, { shouldValidate: true })}
                                                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-cinema-text-muted hover:text-cinema-gold hover:border-cinema-gold/40 cursor-pointer tabular-nums"
                                                >
                                                    {d}p
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Controller
                                        name="release_date"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                label="Ngày khởi chiếu *"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={errors.release_date?.message}
                                                placeholder="Chọn ngày khởi chiếu"
                                            />
                                        )}
                                    />
                                </div>

                                <Input
                                    label="Link Trailer (YouTube)"
                                    placeholder="https://youtube.com/watch?v=..."
                                    error={errors.trailer_url?.message}
                                    {...register('trailer_url')}
                                />

                                <Textarea
                                    label="Mô tả nội dung phim *"
                                    rows={4}
                                    placeholder="Nhập tóm tắt nội dung cốt truyện..."
                                    error={errors.description?.message}
                                    {...register('description')}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 border-t border-white/10 bg-[#16182D] px-5 py-3.5 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="rounded-md"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={mutation.isPending}
                        className="rounded-md font-bold tracking-wide min-w-[140px]"
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Phim Mới'}
                    </Button>
                </div>
            </form>
        </div>
    );
}