import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { movieApi } from '../api/movieApi';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';

export default function Home() {
    const [activeTab, setActiveTab] = useState('showing');

    const { data: movies = [], isLoading } = useQuery({
        queryKey: ['movies', activeTab],
        queryFn: async () => {
            const res = activeTab === 'showing'
                ? await movieApi.getShowing()
                : await movieApi.getComingSoon();
            return res.data.movie;
        },
        placeholderData: keepPreviousData
    });

    return (
        <div className="mx-auto mt-12 w-full max-w-[1080px] px-5 md:mt-5 md:px-4">

            <div className="mb-6 flex gap-3 overflow-x-auto border-b-2 border-[#dcc9b3] pb-3 custom-scrollbar">
                <button
                    className={`whitespace-nowrap border px-4 py-[10px] text-sm font-bold transition ${activeTab === 'showing'
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-[#d8c8b4] bg-white text-[#5d4931] hover:border-brand-500 hover:text-brand-700'
                        }`}
                    onClick={() => setActiveTab('showing')}
                    type="button"
                >
                    Phim Đang Chiếu
                </button>
                <button
                    className={`whitespace-nowrap border px-4 py-[10px] text-sm font-bold transition ${activeTab === 'coming_soon'
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-[#d8c8b4] bg-white text-[#5d4931] hover:border-brand-500 hover:text-brand-700'
                        }`}
                    onClick={() => setActiveTab('coming_soon')}
                    type="button"
                >
                    Phim Sắp Chiếu
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <SkeletonCard key={n} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>
            )}
        </div>
    );
}