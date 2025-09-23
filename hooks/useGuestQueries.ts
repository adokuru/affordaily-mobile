import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

// Query keys
export const guestKeys = {
  all: ['guests'] as const,
  searchByPhone: (phone: string) => [...guestKeys.all, 'search', phone] as const,
};

// Search guest by phone number
export const useGuestSearch = (phone: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: guestKeys.searchByPhone(phone),
    queryFn: () => apiService.searchGuestByPhone(phone),
    enabled: enabled && phone.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once for search queries
  });
};
