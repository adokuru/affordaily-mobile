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
    queryFn: () => apiService.getDashboardStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Get dashboard payments
export const useDashboardPayments = () => {
  return useQuery({
    queryKey: dashboardKeys.payments(),
    queryFn: () => apiService.getDashboardPayments(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get roll call data
export const useRollCall = () => {
  return useQuery({
    queryKey: dashboardKeys.rollCall(),
    queryFn: () => apiService.getRollCall(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
