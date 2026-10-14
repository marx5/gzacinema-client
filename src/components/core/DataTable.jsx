import React from 'react';
import Button from './Button';
import TableSkeleton from './TableSkeleton';
import { Inbox } from 'lucide-react';

/**
 * DataTable - Component Bảng Dữ Liệu Dùng Chung chuẩn Cinematic UI
 * 
 * @param {Array} columns - Cấu hình các cột [{ key, title, dataIndex, render, align, width, className, headerClassName }]
 * @param {Array} data - Mảng dữ liệu hiển thị
 * @param {boolean} loading - Trạng thái tải dữ liệu lần đầu (hiển thị skeleton)
 * @param {boolean} isFetching - Trạng thái fetch ngầm (hiển thị overlay)
 * @param {string} loadingMessage - Thông báo khi đang fetch
 * @param {string} emptyMessage - Thông báo khi không có dữ liệu
 * @param {ReactNode} emptyIcon - Icon hiển thị khi rỗng
 * @param {string|function} rowKey - Định danh bản ghi (mặc định lấy id hoặc _id)
 * @param {function} onRowClick - Sự kiện click vào dòng
 * @param {object} pagination - Cấu hình phân trang { page, totalPages, onPageChange }
 * @param {string} minWidth - Chiều rộng tối thiểu cho table (mặc định min-w-[850px])
 * @param {string} className - Class tùy biến bao ngoài
 */
export function DataTable({
    columns = [],
    data = [],
    loading = false,
    isFetching = false,
    loadingMessage = 'Đang tải dữ liệu...',
    emptyMessage = 'Không tìm thấy dữ liệu phù hợp.',
    emptyIcon: EmptyIcon = Inbox,
    rowKey = 'id',
    onRowClick,
    pagination,
    minWidth = 'min-w-[850px]',
    className = '',
}) {
    const getRowKey = (item, index) => {
        if (typeof rowKey === 'function') return rowKey(item, index);
        return item?.[rowKey] || item?.id || item?._id || index;
    };

    const getAlignClass = (align) => {
        if (align === 'center') return 'text-center';
        if (align === 'right') return 'text-right';
        return 'text-left';
    };

    const renderEmptyIcon = () => {
        if (!EmptyIcon) return null;
        if (React.isValidElement(EmptyIcon)) {
            return EmptyIcon;
        }
        const IconComponent = EmptyIcon;
        return <IconComponent className="w-10 h-10 text-cinema-text-dim mx-auto mb-2" />;
    };

    const renderCellContent = (col, record, rIdx) => {
        const cellValue = col.dataIndex ? record[col.dataIndex] : undefined;
        if (col.render) {
            return col.render(cellValue, record, rIdx);
        }
        if (cellValue === null || cellValue === undefined) return '—';
        if (typeof cellValue === 'object') {
            if (React.isValidElement(cellValue)) return cellValue;
            return '—';
        }
        return cellValue;
    };

    const hasPagination = pagination && pagination.totalPages > 1;

    return (
        <div className={`relative z-10 rounded-md border border-white/10 bg-[#121324] shadow-sm overflow-hidden ${className}`}>
            {/* Loading Overlay when refetching */}
            {isFetching && !loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-cinema-bg/60 backdrop-blur-[1px] animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 rounded-md border border-cinema-gold/40 bg-cinema-surface px-3.5 py-2 text-xs font-semibold text-cinema-gold shadow-sm">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                        <span>{loadingMessage}</span>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className={`w-full text-left text-sm text-cinema-text border-collapse ${minWidth}`}>
                    <thead className="bg-[#181A30] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cinema-text-muted select-none">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={col.key || col.dataIndex || idx}
                                    style={col.width ? { width: col.width } : undefined}
                                    className={`px-4 py-3.5 ${getAlignClass(col.align)} ${col.headerClassName || ''}`}
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.06] text-[13px]">
                        {loading ? (
                            <TableSkeleton rows={6} columns={columns.length || 5} />
                        ) : !data || data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length || 1}
                                    className="px-4 py-14 text-center text-cinema-text-muted"
                                >
                                    {renderEmptyIcon()}
                                    <div className="text-sm font-medium text-cinema-text-muted">{emptyMessage}</div>
                                </td>
                            </tr>
                        ) : (
                            data.map((record, rIdx) => (
                                <tr
                                    key={getRowKey(record, rIdx)}
                                    onClick={() => onRowClick && onRowClick(record, rIdx)}
                                    className={`hover:bg-white/[0.03] transition-colors duration-100 ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columns.map((col, cIdx) => (
                                        <td
                                            key={col.key || col.dataIndex || cIdx}
                                            className={`px-4 py-3 align-middle ${getAlignClass(col.align)} ${col.className || ''}`}
                                        >
                                            {renderCellContent(col, record, rIdx)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {hasPagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 px-4 py-3 bg-[#15172B]">
                    <span className="text-xs text-cinema-text-muted">
                        Hiển thị <strong className="text-cinema-text font-semibold">{data?.length || 0}</strong> bản ghi • Trang <strong className="text-cinema-gold font-semibold">{pagination.page}</strong> / {pagination.totalPages}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={pagination.page <= 1 || isFetching}
                            onClick={() => pagination.onPageChange?.(pagination.page - 1)}
                            className="rounded-md h-8 px-2.5 text-xs"
                        >
                            &larr; Trước
                        </Button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (pagination.totalPages > 5 && pagination.page > 3) {
                                pageNum = Math.min(
                                    pagination.page - 2 + i,
                                    pagination.totalPages - 4 + i
                                );
                            }
                            const isCurrent = pageNum === pagination.page;
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    disabled={isFetching}
                                    onClick={() => pagination.onPageChange?.(pageNum)}
                                    className={`h-8 min-w-[32px] px-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                                        isCurrent
                                            ? 'bg-cinema-gold text-cinema-bg'
                                            : 'bg-cinema-surface border border-white/10 text-cinema-text-muted hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages || isFetching}
                            onClick={() => pagination.onPageChange?.(pagination.page + 1)}
                            className="rounded-md h-8 px-2.5 text-xs"
                        >
                            Sau &rarr;
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
