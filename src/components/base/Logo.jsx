import { Link } from "react-router-dom";
import { Film } from "lucide-react";

export function Logo({ size = "md", to = "/", className = "", showIcon = true }) {
  const sizeMap = {
    sm: { text: "text-lg", icon: 18 },
    md: { text: "text-2xl", icon: 24 },
    lg: { text: "text-3xl", icon: 30 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 font-black tracking-wider select-none ${className}`}>
      {showIcon && (
        <div className="p-1.5 rounded-lg bg-gradient-to-tr from-brand-600 to-pink-500 text-white shadow-lg shadow-brand-500/20">
          <Film size={currentSize.icon} />
        </div>
      )}
      <span className={`${currentSize.text} bg-gradient-to-r from-white via-gray-200 to-brand-400 bg-clip-text text-transparent`}>
        GZA<span className="text-brand-500">CINEMA</span>
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
