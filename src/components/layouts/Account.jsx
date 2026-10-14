import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Ticket, Settings, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function Account({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-white/5 transition focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
          {(user.full_name || user.fullName) ? (user.full_name || user.fullName).charAt(0).toUpperCase() : <User size={16} />}
        </div>
        <span className="text-sm font-medium text-gray-200 hidden md:block max-w-[120px] truncate">
          {user.full_name || user.fullName || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-dark-border/60">
            <p className="text-sm font-semibold text-white truncate">{user.full_name || user.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-400">
              {user.role}
            </span>
          </div>

          <div className="py-1 text-sm text-gray-300">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 hover:text-white transition"
            >
              <User size={16} />
              <span>Thông tin tài khoản</span>
            </Link>

            <Link
              to="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 hover:text-white transition"
            >
              <Ticket size={16} />
              <span>Lịch sử đặt vé</span>
            </Link>

            {user.role?.toLowerCase() === "admin" && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-brand-400 hover:bg-brand-500/10 transition"
              >
                <ShieldCheck size={16} />
                <span>Trang quản trị</span>
              </Link>
            )}

            {user.role?.toLowerCase() === "staff" && (
              <Link
                to="/admin/checkin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-blue-400 hover:bg-blue-500/10 transition"
              >
                <ShieldCheck size={16} />
                <span>Trang soát vé</span>
              </Link>
            )}
          </div>

          <div className="border-t border-dark-border/60 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger-500 hover:bg-danger-500/10 transition text-left"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
