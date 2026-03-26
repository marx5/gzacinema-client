export default function SkeletonCard() {
    return (
        <article className="mx-auto flex h-full w-full max-w-[300px] animate-pulse flex-col justify-between overflow-hidden border border-[#ddcbb6] bg-white shadow-sm md:max-w-[180px] lg:max-w-[200px]">
            {/* Vùng ảnh */}
            <div className="aspect-[2/3] w-full bg-[#eadfce]"></div>

            {/* Vùng text */}
            <div className="p-2 md:p-3">
                <div className="mb-3 h-[18px] w-3/4 rounded bg-[#eadfce]"></div>
                <div className="mb-2 h-3 w-1/2 rounded bg-[#eadfce]"></div>
                <div className="mb-2 h-3 w-2/3 rounded bg-[#eadfce]"></div>
            </div>

            {/* Vùng nút bấm */}
            <div className="mt-auto px-2 pb-2 pt-1 md:px-3 md:pb-3 md:pt-2">
                <div className="h-[32px] w-full rounded bg-[#eadfce] md:h-[38px]"></div>
            </div>
        </article>
    );
}