import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, CreateBookingData } from '@/services/api';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...bookingKeys.lists(), filters] as const,
  active: () => [...bookingKeys.all, 'active'] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
};

// Get all bookings
export const useBookings = () => {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: () => apiService.getBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get active bookings
export const useActiveBookings = () => {
  return useQuery({
    queryKey: bookingKeys.active(),
    queryFn: () => apiService.getActiveBookings(),
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates for active bookings
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => apiService.createBooking(data),
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
    },
    onError: (error) => {
      console.error('Create booking failed:', error);
    },
  });
};

// Checkout booking mutation
export const useCheckoutBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      bookingId, 
      data 
    }: { 
      bookingId: number; 
      data: { 
        damage_notes?: string; 
        key_returned?: boolean; 
        early_checkout?: boolean; 
      } 
    }) => apiService.checkoutBooking(bookingId, data),
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
    },
    onError: (error) => {
      console.error('Checkout booking failed:', error);
    },
  });
};

// Extend booking mutation
export const useExtendBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      bookingId, 
      additionalNights 
    }: { 
      bookingId: number; 
      additionalNights: number; 
    }) => apiService.extendBooking(bookingId, additionalNights),
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
    },
    onError: (error) => {
      console.error('Extend booking failed:', error);
    },
  });
};
