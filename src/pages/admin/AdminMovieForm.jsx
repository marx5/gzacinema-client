import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { movieApi } from '@/api/movieApi';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Film, Upload, X, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button, Input, Textarea, DatePicker } from '@/components/core';

const movieSchema = z.object({
    title: z.string().min(1, "Tên phim không được để trống"),
    genre: z.string().optional(),
    duration_minutes: z.coerce.number().int().min(1, "Thời lượng > 0"),
    release_date: z.string().min(1, "Vui lòng chọn ngày khởi chiếu"),
    trailer_url: z.string().url("Link trailer không hợp lệ").or(z.literal("")).optional(),
    thumbnail: z.any().refine((file) => file instanceof File || typeof file === 'string', {
        message: "Vui lòng chọn ảnh poster hợp lệ",
    }),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự")
});

export default function AdminMovieForm({ movieId, onClose, onSaveSuccess }) {
    const isEditMode = Boolean(movieId);
    const [previewImage, setPreviewImage] = useState(null);

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
        resolver: zodResolver(movieSchema)
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setValue("thumbnail", file, { shouldValidate: true });
        }
    };

    const { data: movieData, isLoading: isFetchingMovie } = useQuery({
        queryKey: ['admin-movie-detail', movieId],
        queryFn: async () => (await movieApi.getById(movieId)).data,
        enabled: isEditMode,
    });

    useEffect(() => {
        if (isEditMode && movieData) {
            const formattedDate = movieData.release_date ? new Date(movieData.release_date).toISOString().split('T')[0] : '';
            reset({ ...movieData, release_date: formattedDate });

            if (movieData.thumbnail) {
                setPreviewImage(movieData.thumbnail);
                setValue("thumbnail", movieData.thumbnail);
            }
        }
    }, [isEditMode, movieData, reset, setValue]);

    const mutation = useMutation({
        mutationFn: (data) => isEditMode ? movieApi.update(movieId, data) : movieApi.create(data),
        onSuccess: () => {
            toast.success(isEditMode ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');
            if (onSaveSuccess) onSaveSuccess();
        },
        onError: (error) => toast.error(error.friendlyMessage || "Có lỗi xảy ra khi lưu phim")
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative flex w-full max-w-[960px] max-h-[92vh] flex-col overflow-hidden rounded-md border border-white/10 glass-card bg-cinema-surface/95 shadow-cinematic animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-cinema-surface-elevated/80 px-6 py-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <Film className="w-5 h-5 text-cinema-gold" />
                        <h3 className="m-0 font-display text-lg font-bold text-cinema-text">
                            {isEditMode ? 'Chỉnh Sửa Thông Tin Phim' : 'Thêm Phim Điện Ảnh Mới'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md text-cinema-text-muted hover:text-white hover:bg-white/10 transition"
                        aria-label="Close form"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isEditMode && isFetchingMovie ? (
                    <div className="flex-1 py-20 flex flex-col items-center justify-center gap-3 text-cinema-text-muted">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                        <p className="text-xs font-bold">Đang tải dữ liệu phim...</p>
                    </div>
                ) : (
                    /* Body Content */
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Left Poster Uploader */}
                            <div className="md:col-span-4 space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                                    Poster Phim *
                                </label>
                                <div className="aspect-[2/3] w-full max-w-[240px] mx-auto overflow-hidden rounded-md border-2 border-dashed border-white/15 bg-cinema-surface-elevated flex items-center justify-center relative group">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Poster preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4 text-cinema-text-dim space-y-2">
                                            <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                                            <span className="block text-xs">Chưa có ảnh poster</span>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    id="poster-upload"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="poster-upload"
                                    className="block w-full max-w-[240px] mx-auto cursor-pointer rounded-md border border-cinema-gold/40 bg-cinema-gold/10 text-center px-4 py-2 text-xs font-bold text-cinema-gold transition hover:bg-cinema-gold hover:text-cinema-bg"
                                >
                                    <Upload className="w-3.5 h-3.5 inline-block mr-1.5" />
                                    Chọn Ảnh Poster
                                </label>
                                {errors.thumbnail && <p className="text-center text-xs text-red-400">{errors.thumbnail.message}</p>}
                            </div>

                            {/* Right Fields */}
                            <div className="md:col-span-8 space-y-4">
                                <Input
                                    label="Tên phim *"
                                    placeholder="Nhập tên bộ phim..."
                                    error={errors.title?.message}
                                    {...register("title")}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Thể loại"
                                        placeholder="Ví dụ: Hành động, Viễn tưởng..."
                                        error={errors.genre?.message}
                                        {...register("genre")}
                                    />

                                    <Input
                                        label="Thời lượng (phút) *"
                                        type="number"
                                        placeholder="120"
                                        error={errors.duration_minutes?.message}
                                        {...register("duration_minutes")}
                                    />

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

                                    <Input
                                        label="Link Trailer (YouTube)"
                                        placeholder="https://youtube.com/watch?v=..."
                                        error={errors.trailer_url?.message}
                                        {...register("trailer_url")}
                                    />
                                </div>

                                <Textarea
                                    label="Mô tả nội dung phim *"
                                    rows={4}
                                    placeholder="Nhập tóm tắt nội dung cốt truyện..."
                                    error={errors.description?.message}
                                    {...register("description")}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-cinema-surface-elevated/50 px-6 py-4 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="rounded-md"
                    >
                        HỦY BỎ
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={mutation.isPending}
                        className="rounded-md font-bold tracking-wide shadow-glow-gold-sm min-w-[160px]"
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        LƯU THÔNG TIN
                    </Button>
                </div>
            </form>
        </div>
    );
}