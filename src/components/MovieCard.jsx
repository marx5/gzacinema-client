import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
    const defaultImg = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

    return (
        <article className="mx-auto flex h-full w-full max-w-[300px] flex-col justify-between overflow-hidden border border-[#ddcbb6] bg-white shadow-[0_8px_18px_rgba(76,45,17,0.10)] transition hover:-translate-y-[3px] hover:border-brand-500 hover:shadow-[0_12px_24px_rgba(76,45,17,0.16)]">
            <div>
                <img
                    src={movie.thumbnail || defaultImg}
                    alt={movie.title}
                    className="h-[200px] w-full border-b border-[#eadfce] object-cover"
                />

                <div className="p-3">
                    <h3 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-extrabold text-[#3b2b19]">{movie.title}</h3>

                    {/* BỔ SUNG ĐẦY ĐỦ THÔNG TIN */}
                    <p className="my-1.5 text-[13px] text-[#7b6446]"><strong className="text-[#3f2f1f]">Thể loại:</strong> {movie.genre || 'Đang cập nhật'}</p>
                    <p className="my-1.5 text-[13px] text-[#7b6446]"><strong className="text-[#3f2f1f]">Thời lượng:</strong> {movie.duration_minutes} phút</p>
                    <p className="my-1.5 text-[13px] text-[#7b6446]"><strong className="text-[#3f2f1f]">Khởi chiếu:</strong> {new Date(movie.release_date).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>

            <div className="px-3 pb-3">
                <Link to={`/movie/${movie.id}`}>
                    <button className="min-h-[38px] w-full bg-brand-500 px-3 py-[8px] text-[13px] font-bold text-white transition hover:bg-brand-600" type="button">
                        Xem Chi Tiết & Đặt Vé
                    </button>
                </Link>
            </div>
        </article>
    );
}