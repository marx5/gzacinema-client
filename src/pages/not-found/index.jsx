import { Link } from 'react-router-dom';
import { Home, Film } from 'lucide-react';
import { Button } from '../../components/core';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center animate-in fade-in duration-300">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold mb-6 shadow-glow-gold">
                <Film className="w-12 h-12" />
            </div>
            <h1 className="m-0 font-display text-[96px] sm:text-[120px] font-black leading-none gold-text-gradient tracking-tight">
                404
            </h1>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-cinema-text">
                Không tìm thấy trang
            </h2>
            <p className="mt-2 text-sm sm:text-base text-cinema-text-muted max-w-md">
                Trang bạn đang tìm kiếm có thể đã bị xóa hoặc địa chỉ đường dẫn không chính xác.
            </p>
            <div className="mt-8">
                <Link to="/">
                    <Button variant="primary" size="lg" className="rounded-md" leftIcon={<Home className="w-4 h-4" />}>
                        VỀ TRANG CHỦ
                    </Button>
                </Link>
            </div>
        </div>
    );
}
