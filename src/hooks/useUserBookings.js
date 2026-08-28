import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { mapBookingDtoToEntity } from '@/models/booking.model';

/**
 * Use Case Hook: Lấy và chuẩn hóa danh sách lịch sử đặt vé của người dùng
 */
export const useUserBookings = () => {
  const query = useQuery({
    queryKey: ['user', 'bookings', 'history'],
    queryFn: async () => {
      const res = await authApi.getHistory();
      const rawList = res.data?.history || res.data || [];
      return Array.isArray(rawList)
        ? rawList.map(mapBookingDtoToEntity).filter(Boolean)
        : [];
    },
    staleTime: 1000 * 60 * 2, // 2 phút cache
    retry: 1,
  });

  return {
    bookings: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
