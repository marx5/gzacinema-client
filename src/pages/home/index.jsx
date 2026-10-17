import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '@/api/movieApi';
import { HeroBannerSlider, MovieTabSection } from '@/components/home';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const tabFromUrl = searchParams.get('tab');
  const activeTab = tabFromUrl === 'coming_soon' ? 'coming_soon' : 'showing';
  const moviesSectionRef = useRef(null);

  // Cuộn tới danh sách phim nếu query param tab thay đổi hoặc có hash #movies-section
  useEffect(() => {
    if ((tabFromUrl === 'coming_soon' || location.hash === '#movies-section') && moviesSectionRef.current) {
      moviesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tabFromUrl, location.hash]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // Top 10 Ranking Movies Query (Dành cho Hero Banner Spotlight)
  const { data: rankingMovies = [], isLoading: isLoadingRanking } = useQuery({
    queryKey: ['movies', 'ranking'],
    queryFn: async () => {
      const res = await movieApi.getRanking(10);
      return res.data;
    },
  });

  // Showing Movies Query
  const { data: showingMovies = [], isLoading: isLoadingShowing } = useQuery({
    queryKey: ['movies', 'showing'],
    queryFn: async () => {
      const res = await movieApi.getShowing({ limit: 50 });
      return res.data?.movie || [];
    },
  });

  // Coming Soon Movies Query
  const { data: comingSoonMovies = [], isLoading: isLoadingComingSoon } = useQuery({
    queryKey: ['movies', 'coming_soon'],
    queryFn: async () => {
      const fetchUpcoming = movieApi.getUpcoming || movieApi.getComingSoon;
      const res = await fetchUpcoming({ limit: 50 });
      return res.data?.movie || [];
    },
  });

  const tabMovies = activeTab === 'showing' ? showingMovies : comingSoonMovies;
  const isLoadingTabMovies = activeTab === 'showing' ? isLoadingShowing : isLoadingComingSoon;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Hero Banner Spotlight Top 10 */}
      <HeroBannerSlider movies={rankingMovies} isLoading={isLoadingRanking} />

      {/* Danh sách phim theo Tab (Đang chiếu / Sắp chiếu) */}
      <MovieTabSection
        activeTab={activeTab}
        onTabChange={handleTabChange}
        movies={tabMovies}
        isLoading={isLoadingTabMovies}
        sectionRef={moviesSectionRef}
      />
    </div>
  );
}
