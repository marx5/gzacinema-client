import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
            <h1 className="m-0 font-display text-[100px] font-extrabold leading-none text-brand-500 md:text-[80px]">
                404
            </h1>
            <h2 className="mt-4 font-display text-[32px] text-[#3b2b19] md:text-[26px]">
                Không tìm thấy trang
            </h2>
            <p className="mt-3 text-base text-[#7b6446]">
                Trang bạn đang tìm kiếm không tồn tại.
            </p>
            <Link
                to="/"
                className="mt-8 inline-block border-2 border-brand-500 bg-brand-500 px-8 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-brand-500"
            >
                VỀ TRANG CHỦ
            </Link>
        </div>
    );
}