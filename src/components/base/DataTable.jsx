import TableSkeleton from "../core/TableSkeleton";

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "Không có dữ liệu hiển thị",
  className = "",
  onRowClick,
}) {
  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length || 4} />;
  }

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-dark-border bg-dark-card ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-dark-border bg-dark-surface/60 text-text-secondary text-xs uppercase font-semibold">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`py-3.5 px-4 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.headerClassName || ""}`}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border/50 text-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="py-12 text-center text-gray-500 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row._id || row.id || rIdx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors hover:bg-white/[0.03] ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key || cIdx}
                    className={`py-3.5 px-4 ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left"
                    } ${col.className || ""}`}
                  >
                    {col.render ? col.render(row[col.dataIndex], row, rIdx) : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
