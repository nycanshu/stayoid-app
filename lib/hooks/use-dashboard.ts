import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export function useDashboard(propertyId?: string) {
  return useQuery({
    queryKey: propertyId ? ['dashboard', propertyId] : ['dashboard'],
    queryFn: () => dashboardApi.get(propertyId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
