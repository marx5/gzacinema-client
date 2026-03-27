import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { movieApi } from '../../api/movieApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(movieSchema)
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setValue("thumbnail", file, { shouldValidate: true });
        }
    };

    const { isLoading: isFetchingMovie } = useQuery({
        queryKey: ['admin-movie-detail', movieId],
        queryFn: async () => (await movieApi.getById(movieId)).data,
        enabled: isEditMode,
        onSuccess: (data) => {
            if (data) {
                const formattedDate = data.release_date ? new Date(data.release_date).toISOString().split('T')[0] : '';
                reset({ ...data, release_date: formattedDate });

                if (data.thumbnail) {
                    setPreviewImage(data.thumbnail);
                    setValue("thumbnail", data.thumbnail);
                }
            }
        }
    });

    const mutation = useMutation({
        mutationFn: (data) => isEditMode ? movieApi.update(movieId, data) : movieApi.create(data),
        onSuccess: () => {
            toast.success('Lưu thông tin phim thành công!');
            if (onSaveSuccess) onSaveSuccess();
        },
        onError: (error) => toast.error(error.friendlyMessage || "Có lỗi xảy ra")
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative flex w-full max-w-[1000px] max-h-[95vh] flex-col overflow-hidden rounded-lg bg-[#fbf8f3] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
                {/* 1. HEADER CỐ ĐỊNH TRÊN CÙNG */}
                <div className="flex items-center justify-between bg-[#3b2b19] px-6 py-4 md:px-5 md:py-3 sm:flex-col sm:gap-4 sm:items-start shrink-0">
                    <h2 className="m-0 font-display text-[26px] text-white sm:text-2xl">
                        {isEditMode ? 'Chỉnh Sửa Phim' : 'Khai Báo Phim Mới'}
                    </h2>
                    <div className="flex items-center gap-3 sm:w-full sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-[#cfb596] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#b59b7a] transition"
                        >
                            HỦY BỎ
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isLoading}
                            className="bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70 transition"
                        >
                            {mutation.isLoading ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
                        </button>
                    </div>
                </div>

                {isEditMode && isFetchingMovie ? (
                    <div className="flex-1 py-20 text-center font-bold text-[#7b6446]">Đang tải dữ liệu phim...</div>
                ) : (
                    /* 2. BODY CÓ THỂ CUỘN LÊN XUỐNG */
                    <div className="flex-1 overflow-y-auto p-6 md:p-5 custom-scrollbar">
                        <div className="flex flex-col md:flex-row gap-8 md:gap-10">

                            {/* 2.1 CỘT TRÁI: POSTER PHIM */}
                            <div className="w-full shrink-0 md:w-[260px]">
                                <label className="mb-2 block text-sm font-bold text-[#3b2b19]">Poster Phim *</label>
                                <div className="aspect-[2/3] w-full max-w-[260px] sm:max-w-full mx-auto overflow-hidden border border-dashed border-[#cfb596] bg-white shadow-sm">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="flex h-full items-center justify-center text-sm font-medium text-[#8c7356]">
                                            Chưa có ảnh
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file" accept="image/*" id="poster-upload" className="hidden"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="poster-upload"
                                    className="mt-4 block w-full max-w-[260px] sm:max-w-full mx-auto cursor-pointer border border-[#ddcbb6] bg-white text-center px-4 py-2.5 text-sm font-bold text-[#7b6446] transition hover:border-brand-500 hover:text-brand-600 hover:bg-[#fffaf3]"
                                >
                                    CHỌN ẢNH TỪ MÁY
                                </label>
                                {errors.thumbnail && <p className="mt-2 text-center text-xs font-bold text-red-500">{errors.thumbnail.message}</p>}
                            </div>

                            {/* 2.2 CỘT PHẢI: THÔNG TIN CHI TIẾT VÀ MÔ TẢ */}
                            <div className="flex-1 flex flex-col gap-6">
                                {/* Nhóm các input ngắn */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1 block text-sm font-bold text-[#3b2b19]">Tên phim *</label>
                                        <input {...register("title")} className="w-full border border-[#ddcbb6] bg-white p-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-bold text-[#3b2b19]">Thể loại</label>
                                        <input {...register("genre")} placeholder="Ví dụ: Hành động, Viễn tưởng..." className="w-full border border-[#ddcbb6] bg-white p-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-bold text-[#3b2b19]">Ngày khởi chiếu *</label>
                                        <input type="date" {...register("release_date")} className="w-full border border-[#ddcbb6] bg-white p-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                                        {errors.release_date && <p className="mt-1 text-xs text-red-500">{errors.release_date.message}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-bold text-[#3b2b19]">Thời lượng (phút) *</label>
                                        <input type="number" {...register("duration_minutes")} className="w-full border border-[#ddcbb6] bg-white p-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                                        {errors.duration_minutes && <p className="mt-1 text-xs text-red-500">{errors.duration_minutes.message}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-bold text-[#3b2b19]">Link Trailer (YouTube)</label>
                                        <input {...register("trailer_url")} placeholder="https://youtube.com/..." className="w-full border border-[#ddcbb6] bg-white p-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                                        {errors.trailer_url && <p className="mt-1 text-xs text-red-500">{errors.trailer_url.message}</p>}
                                    </div>
                                </div>

                                {/* Textarea Mô tả (Nằm cùng cột bên phải) */}
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-[#3b2b19]">Mô tả nội dung phim *</label>
                                    <textarea
                                        {...register("description")}
                                        rows="6"
                                        placeholder="Nhập tóm tắt nội dung phim..."
                                        className="w-full resize-y border border-[#ddcbb6] bg-white p-3 text-sm focus:border-brand-500 focus:outline-none leading-relaxed"
                                    />
                                    {errors.description && <p className="mt-1 text-xs font-bold text-red-500">{errors.description.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}