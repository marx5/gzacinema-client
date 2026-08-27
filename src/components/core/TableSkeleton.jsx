export function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse border-b border-white/5">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-5 py-4">
                            <div className="h-4 w-full rounded bg-white/10"></div>
                            {(colIndex === 1 || colIndex === 2) && (
                                <div className="mt-2 h-3 w-2/3 rounded bg-white/5"></div>
                            )}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default TableSkeleton;