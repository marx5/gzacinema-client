// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="mt-20 border-t-4 border-brand-500 bg-[#1a1410] pt-16 text-[#cfb596]">
            <div className="mx-auto w-full max-w-[1080px] px-5 md:px-4">
                <div className="grid grid-cols-4 gap-8 md:grid-cols-4 sm:grid-cols-2">
                    {/* Cột 1: Thương hiệu */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="font-display text-[32px] font-extrabold text-white transition hover:text-brand-500">
                            Gzacinema<span className="text-brand-500">.</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-[#8c7356]">
                            Hệ thống rạp chiếu phim hiện đại bậc nhất, mang đến trải nghiệm điện ảnh đỉnh cao với chất lượng âm thanh và hình ảnh tuyệt hảo.
                        </p>
                    </div>

                    {/* Cột 2: Khám phá */}
                    <div>
                        <h4 className="mb-4 font-display text-lg font-bold text-white uppercase tracking-wider">Khám phá</h4>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li><Link to="/" className="transition hover:text-white hover:underline">Phim Đang Chiếu</Link></li>
                            <li><Link to="/" className="transition hover:text-white hover:underline">Phim Sắp Chiếu</Link></li>
                            <li><Link to="/" className="transition hover:text-white hover:underline">Hệ thống Rạp</Link></li>
                            <li><Link to="/" className="transition hover:text-white hover:underline">Khuyến mãi</Link></li>
                        </ul>
                    </div>

                    {/* Cột 3: Hỗ trợ */}
                    <div>
                        <h4 className="mb-4 font-display text-lg font-bold text-white uppercase tracking-wider">Hỗ trợ</h4>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li><Link to="/" className="transition hover:text-white hover:underline">Điều khoản sử dụng</Link></li>
                            <li><Link to="/" className="transition hover:text-white hover:underline">Chính sách bảo mật</Link></li>
                            <li><Link to="/" className="transition hover:text-white hover:underline">Câu hỏi thường gặp (FAQ)</Link></li>
                            <li><Link to="/" className="transition hover:text-white hover:underline">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Cột 4: Liên hệ */}
                    <div>
                        <h4 className="mb-4 font-display text-lg font-bold text-white uppercase tracking-wider">Chăm sóc khách hàng</h4>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-brand-500">Hotline:</span>
                                <span className="text-white">1900 1234</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-brand-500">Email:</span>
                                <span className="text-white">support@gzacinema.com</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-brand-500">Giờ làm việc:</span>
                                <span>8:00 - 22:00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-16 flex items-center justify-between border-t border-[#3b2b19] py-6 text-xs text-[#8c7356] sm:flex-col sm:gap-4 sm:text-center">
                    <p className="m-0">&copy; {new Date().getFullYear()} Gzacinema. Tất cả quyền được bảo lưu.</p>
                    <div className="flex gap-4">
                        <a href="#" className="transition hover:text-white">Facebook</a>
                        <a href="#" className="transition hover:text-white">Instagram</a>
                        <a href="#" className="transition hover:text-white">Youtube</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}