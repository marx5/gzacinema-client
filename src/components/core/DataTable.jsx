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
        <div className={`relative z-10 glass-card rounded-md border border-white/10 shadow-cinematic overflow-hidden ${className}`}>
            {/* Loading Overlay when refetching */}
            {isFetching && !loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-cinema-bg/60 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 rounded-md border border-cinema-gold/40 bg-cinema-surface px-4 py-2 text-xs font-bold text-cinema-gold shadow-glow-gold-sm">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cinema-gold border-t-transparent" />
                        <span>{loadingMessage}</span>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className={`w-full text-left text-sm text-cinema-text ${minWidth}`}>
                    <thead className="bg-cinema-surface-elevated/80 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-cinema-text-muted">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={col.key || col.dataIndex || idx}
                                    style={col.width ? { width: col.width } : undefined}
                                    className={`px-5 py-4 ${getAlignClass(col.align)} ${col.headerClassName || ''}`}
                                >
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <TableSkeleton rows={6} columns={columns.length || 5} />
                        ) : !data || data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length || 1}
                                    className="px-5 py-12 text-center text-cinema-text-muted"
                                >
                                    {renderEmptyIcon()}
                                    <div className="text-sm font-medium">{emptyMessage}</div>
                                </td>
                            </tr>
                        ) : (
                            data.map((record, rIdx) => (
                                <tr
                                    key={getRowKey(record, rIdx)}
                                    onClick={() => onRowClick && onRowClick(record, rIdx)}
                                    className={`hover:bg-white/[0.02] transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columns.map((col, cIdx) => (
                                        <td
                                            key={col.key || col.dataIndex || cIdx}
                                            className={`px-5 py-3.5 ${getAlignClass(col.align)} ${col.className || ''}`}
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
                <div className="flex items-center justify-center gap-2 border-t border-white/10 p-4 bg-white/[0.01]">
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={pagination.page <= 1 || isFetching}
                        onClick={() => pagination.onPageChange?.(pagination.page - 1)}
                        className="rounded-md"
                    >
                        &larr; Trước
                    </Button>

                    <span className="px-3 text-xs font-bold text-cinema-text">
                        Trang {pagination.page} / {pagination.totalPages}
                    </span>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages || isFetching}
                        onClick={() => pagination.onPageChange?.(pagination.page + 1)}
                        className="rounded-md"
                    >
                        Sau &rarr;
                    </Button>
                </div>
            )}
        </div>
    );
}

export default DataTable;
