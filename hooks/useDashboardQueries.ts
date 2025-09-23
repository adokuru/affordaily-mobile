import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  payments: () => [...dashboardKeys.all, 'payments'] as const,
  rollCall: () => [...dashboardKeys.all, 'rollCall'] as const,
};

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => apiService.request<{
      success: boolean;
      data: {
        total_rooms: number;
        occupied_rooms: number;
        available_rooms: number;
        pending_checkouts: number;
        total_guests: number;
        total_visitors: number;
        today_revenue: number;
        monthly_revenue: number;
      }
    }>('/dashboard/stats'),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Get dashboard payments
export const useDashboardPayments = () => {
  return useQuery({
    queryKey: dashboardKeys.payments(),
    queryFn: () => apiService.request<{
      success: boolean;
      data: Array<{
        id: number;
        amount: number;
        payment_method: 'cash' | 'transfer';
        created_at: string;
        booking: {
          guest_name: string;
          room_number: string;
        }
      }>
    }>('/dashboard/payments'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get roll call data
export const useRollCall = () => {
  return useQuery({
    queryKey: dashboardKeys.rollCall(),
    queryFn: () => apiService.request<{
      success: boolean;
      data: {
        present_guests: number;
        absent_guests: number;
        checked_in_today: number;
        checked_out_today: number;
      }
    }>('/dashboard/roll-call'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
