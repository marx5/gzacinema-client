import { Search } from "lucide-react";
import Input from "../../core/Input";
import Select from "../../core/Select";

export function MovieFilter({
  search = "",
  onSearchChange,
  genre = "ALL",
  onGenreChange,
  genreOptions = [],
  status = "ALL",
  onStatusChange,
  statusOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "NOW_SHOWING", label: "Đang chiếu" },
    { value: "COMING_SOON", label: "Sắp chiếu" },
  ],
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-dark-card border border-dark-border p-3.5 rounded-xl">
      <div className="flex-1 min-w-[200px]">
        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Tìm tên phim, đạo diễn, diễn viên..."
          prefixIcon={<Search size={16} />}
        />
      </div>

      {genreOptions.length > 0 && (
        <div className="w-44">
          <Select
            value={genre}
            onChange={(e) => onGenreChange?.(e.target.value)}
            options={[{ value: "ALL", label: "Tất cả thể loại" }, ...genreOptions]}
          />
        </div>
      )}

      {statusOptions.length > 0 && (
        <div className="w-44">
          <Select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            options={statusOptions}
          />
        </div>
      )}
    </div>
  );
}

export default MovieFilter;
