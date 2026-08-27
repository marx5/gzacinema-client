export default function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse border-b border-dashed border-[#ddcbb6]">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-4">
                            <div className="h-4 w-full rounded bg-[#efe5d6]"></div>
                            {(colIndex === 1 || colIndex === 2) && (
                                <div className="mt-2 h-3 w-2/3 rounded bg-[#f6efe3]"></div>
                            )}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}