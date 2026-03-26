import { Link } from 'react-router-dom';
import { useState } from 'react';


export default function MovieCard({ movie }) {
    const defaultImg = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <article className="mx-auto flex h-full w-full max-w-[300px] md:max-w-[180px] lg:max-w-[200px] flex-col justify-between overflow-hidden border border-[#ddcbb6] bg-white shadow-[0_8px_18px_rgba(76,45,17,0.10)] transition hover:-translate-y-[3px] hover:border-brand-500 hover:shadow-[0_12px_24px_rgba(76,45,17,0.16)]">
            <div className="relative bg-[#eadfce]">
                {/* CHUẨN UX: Sử dụng aspect-[2/3] để poster phim không bị méo */}
                <img
                    src={movie.thumbnail || defaultImg}
                    alt={movie.title}
                    onLoad={() => setIsLoaded(true)}
                    className={`aspect-[2/3] w-full border-b border-[#eadfce] object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className="p-2 md:p-3">
                    {/* SỬA: Giảm kích thước text và padding từ md: để card gọn hơn trên Laptop */}
                    <h3 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] md:text-[18px] lg:text-[16px] font-extrabold text-[#3b2b19]" title={movie.title}>{movie.title}</h3>

                    <p className="my-1.5 text-[11px] md:text-[13px] text-[#7b6446] truncate"><strong className="text-[#3f2f1f]">Thể loại:</strong> {movie.genre || 'Đang cập nhật'}</p>
                    <p className="my-1 text-[11px] md:text-[13px] text-[#7b6446]"><strong className="text-[#3f2f1f]">Thời lượng:</strong> {movie.duration_minutes} phút</p>
                    <p className="my-1 text-[11px] md:text-[13px] text-[#7b6446]"><strong className="text-[#3f2f1f]">Khởi chiếu:</strong> {new Date(movie.release_date).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>

            <div className="px-2 md:px-3 pb-2 md:pb-3 mt-auto pt-1 md:pt-2">
                <Link to={`/movie/${movie.id}`}>
                    <button className="min-h-[32px] md:min-h-[38px] w-full bg-brand-500 px-2 py-[6px] md:py-[8px] text-[11px] md:text-[13px] font-bold text-white transition hover:bg-brand-600" type="button">
                        Xem Chi Tiết & Đặt Vé
                    </button>
                </Link>
            </div>
        </article>
    );
}