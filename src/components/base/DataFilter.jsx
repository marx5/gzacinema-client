import { Search, RotateCcw } from "lucide-react";
import Button from "@/components/core/Button";
import Input from "@/components/core/Input";

export function DataFilter({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children,
  onReset,
  className = "",
}) {
  return (
    <div
      className={`bg-dark-card border border-dark-border rounded-xl p-4 flex flex-wrap items-center gap-3 ${className}`}
    >
      <div className="flex-1 min-w-[240px]">
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          prefixIcon={<Search size={18} />}
        />
      </div>

      {children}

      {onReset && (
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          <RotateCcw size={16} />
          <span>Đặt lại</span>
        </Button>
      )}
    </div>
  );
}

export default DataFilter;
