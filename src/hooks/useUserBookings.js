import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/useAuthStore';
import { mapBookingDtoToEntity } from '@/models/booking.model';

/**
 * Use Case Hook: Lấy và chuẩn hóa danh sách lịch sử đặt vé của người dùng
 */
export const useUserBookings = ({ page = 1, limit = 10 } = {}) => {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['user', 'bookings', 'history', user?.id, { page, limit }],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const res = await authApi.getHistory({ page, limit });
      const rawList = res.data?.history || res.data?.bookings || res.data || [];
      const mapped = Array.isArray(rawList)
        ? rawList.map(mapBookingDtoToEntity).filter(Boolean)
        : [];
      const rawPagination = res.data?.pagination || null;

      return {
        bookings: mapped,
        pagination: rawPagination || {
          page,
          limit,
          totalItems: mapped.length,
          totalPages: Math.max(1, Math.ceil(mapped.length / limit)),
        },
      };
    },
    staleTime: 1000 * 60 * 2, // 2 phút cache
    retry: 1,
  });

  return {
    bookings: query.data?.bookings || [],
    pagination: query.data?.pagination || {
      page,
      limit,
      totalItems: 0,
      totalPages: 1,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
