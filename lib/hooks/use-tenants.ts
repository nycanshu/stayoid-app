import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { tenantsApi, type TenantFilters } from '../api/tenants';
import type { CreateTenantInput } from '../../types/tenant';

export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: ['tenants', filters],
    queryFn: () => tenantsApi.list(filters),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

const TENANTS_PAGE_SIZE = 20;

/**
 * Paginated tenant list. Pages of 20, server-driven filter / search / property
 * scope go into the queryKey so changing them resets to page 1.
 */
export function useInfiniteTenants(filters?: Omit<TenantFilters, 'page' | 'page_size'>) {
  return useInfiniteQuery({
    queryKey: ['tenants', 'infinite', filters],
    queryFn: ({ pageParam }) => tenantsApi.listPaginated({
      ...filters,
      page: pageParam,
      page_size: TENANTS_PAGE_SIZE,
    }),
    initialPageParam: 1,
    getNextPageParam: (last, all) =>
      last.next ? all.length + 1 : undefined,
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

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, data,
    }: {
      id: string;
      data: Partial<CreateTenantInput>;
    }) => tenantsApi.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['tenants', updated.slug] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useExitTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, exit_date }: { id: string; exit_date: string }) =>
      tenantsApi.exit(id, exit_date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
