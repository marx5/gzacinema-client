import { Clapperboard } from "lucide-react";

export function LazyLoading({ message = "Đang tải dữ liệu..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4 text-center p-6">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-dark-border border-t-brand-500 animate-spin" />
        <div className="absolute text-brand-500 animate-pulse">
          <Clapperboard size={24} />
        </div>
      </div>
      <p className="text-sm font-medium text-text-secondary animate-pulse">{message}</p>
    </div>
  );
}

export default LazyLoading;
