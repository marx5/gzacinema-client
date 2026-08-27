// src/components/Breadcrumb.jsx
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-cinema-text-muted overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
      <Link to="/" className="flex items-center gap-1.5 font-medium hover:text-cinema-gold transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>

      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-cinema-text-dim flex-shrink-0" />
          {item.link ? (
            <Link to={item.link} className="font-medium hover:text-cinema-gold transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-none">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}