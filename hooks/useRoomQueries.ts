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
    queryFn: () => apiService.request<{
      success: boolean;
      data: {
        total_rooms: number;
        available_rooms: number;
        occupied_rooms: number;
        maintenance_rooms: number;
      }
    }>('/rooms/occupancy'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

// Get available rooms
export const useAvailableRooms = () => {
  return useQuery({
    queryKey: roomKeys.available(),
    queryFn: () => apiService.request<{
      success: boolean;
      data: Array<{
        id: number;
        room_number: string;
        bed_space: 'A' | 'B';
        type: 'A' | 'B';
      }>
    }>('/rooms/available'),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get room rates
export const useRoomRates = () => {
  return useQuery({
    queryKey: roomKeys.rates(),
    queryFn: () => apiService.request<{
      success: boolean;
      data: {
        bed_space_a: number;
        bed_space_b: number;
      }
    }>('/rooms/rates'),
    staleTime: 10 * 60 * 1000, // 10 minutes - rates don't change often
  });
};
