// src/components/Breadcrumb.jsx
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
    return (
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#8c7356] overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
            <Link to="/" className="font-bold hover:text-brand-500 transition">Trang chủ</Link>

            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                    <span>/</span>
                    {item.link ? (
                        <Link to={item.link} className="font-bold hover:text-brand-500 transition">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-bold text-[#3b2b19]">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}