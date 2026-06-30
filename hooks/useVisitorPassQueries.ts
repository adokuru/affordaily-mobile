import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, CreateVisitorPassData } from '@/services/api';
import { bookingKeys } from './useBookingQueries';
import { dashboardKeys } from './useDashboardQueries';

export const visitorPassKeys = {
  all: ['visitor-passes'] as const,
  activeForBooking: (bookingId: number) => [...visitorPassKeys.all, 'booking', bookingId, 'active'] as const,
};

export const useActiveVisitorPassesForBooking = (
  bookingId?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: visitorPassKeys.activeForBooking(bookingId ?? 0),
    queryFn: () => apiService.getActiveVisitorPassesForBooking(bookingId!),
    enabled: enabled && !!bookingId,
    staleTime: 30 * 1000,
  });
};

export const useCreateVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVisitorPassData) => apiService.createVisitorPass(data),
    onSuccess: (response) => {
      const bookingId = response.data.booking.id;

      queryClient.invalidateQueries({ queryKey: visitorPassKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });

      if (bookingId) {
        queryClient.invalidateQueries({
          queryKey: visitorPassKeys.activeForBooking(bookingId),
        });
      }
    },
  });
};

export const useCheckoutVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitorPassId: number) => apiService.checkoutVisitorPass(visitorPassId),
    onSuccess: (response) => {
      const bookingId = response.data.booking.id;

      queryClient.invalidateQueries({ queryKey: visitorPassKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });

      if (bookingId) {
        queryClient.invalidateQueries({
          queryKey: visitorPassKeys.activeForBooking(bookingId),
        });
      }
    },
  });
};
