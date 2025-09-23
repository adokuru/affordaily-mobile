import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService, LoginCredentials, User } from '@/services/api';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Get current user profile
export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => apiService.getProfile(),
    enabled: apiService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => apiService.login(credentials),
    onSuccess: (response) => {
      // Set token in API service
      apiService.setToken(response.data.access_token);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Set user data in cache
      queryClient.setQueryData(authKeys.user(), response.data.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      // Clear token
      apiService.clearToken();
      
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear local data even if API call fails
      apiService.clearToken();
      queryClient.clear();
    },
  });
};
