import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi, type TenantFilters, type CreateTenantInput } from '../api/tenants';

export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: ['tenants', filters],
    queryFn: () => tenantsApi.list(filters),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useTenant(slug: string) {
  return useQuery({
    queryKey: ['tenants', slug],
    queryFn: () => tenantsApi.bySlug(slug),
    staleTime: 60_000,
    enabled: !!slug,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantInput) => tenantsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useExitTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, exit_date }: { id: number; exit_date: string }) =>
      tenantsApi.exit(id, exit_date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
