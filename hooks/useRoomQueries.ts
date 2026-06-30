import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  occupancy: () => [...roomKeys.all, 'occupancy'] as const,
  available: () => [...roomKeys.all, 'available'] as const,
  rates: () => [...roomKeys.all, 'rates'] as const,
};

// Get room occupancy statistics
export const useRoomOccupancy = () => {
  return useQuery({
    queryKey: roomKeys.occupancy(),
    queryFn: () => apiService.getRoomOccupancy(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

// Get available rooms
export const useAvailableRooms = () => {
  return useQuery({
    queryKey: roomKeys.available(),
    queryFn: () => apiService.getAvailableRooms(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get room rates
export const useRoomRates = () => {
  return useQuery({
    queryKey: roomKeys.rates(),
    queryFn: () => apiService.getRoomRates(),
    staleTime: 10 * 60 * 1000, // 10 minutes - rates don't change often
  });
};
