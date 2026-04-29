import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import {
  propertiesApi, slotsApi,
  type PropertyFilters, type SlotFilters,
} from '../api/properties';
import type { Property } from '../../types/property';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.list,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useProperty(slug: string) {
  return useQuery({
    queryKey: ['properties', slug],
    queryFn: () => propertiesApi.bySlug(slug),
    staleTime: 30_000,
    enabled: !!slug,
  });
}

export function useSlots(
  propertyId?: string,
  vacant?: boolean,
  options?: { allowAll?: boolean },
) {
  return useQuery({
    queryKey: ['slots', propertyId, vacant],
    queryFn: () => slotsApi.list({ property_id: propertyId, vacant }),
    staleTime: 30_000,
    // Without `allowAll`, only fire when a specific property is selected (used by
    // property detail). With `allowAll: true`, fire even when propertyId is
    // undefined — the global slots page wants every slot across every property.
    enabled: !!propertyId || !!options?.allowAll,
  });
}

const SLOTS_PAGE_SIZE = 30;

export function useInfiniteSlots(filters?: Omit<SlotFilters, 'page' | 'page_size'>) {
  return useInfiniteQuery({
    queryKey: ['slots', 'infinite', filters],
    queryFn: ({ pageParam }) => slotsApi.listPaginated({
      ...filters,
      page: pageParam,
      page_size: SLOTS_PAGE_SIZE,
    }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => last.next ? all.length + 1 : undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

const PROPERTIES_PAGE_SIZE = 20;

export function useInfiniteProperties(
  filters?: Omit<PropertyFilters, 'page' | 'page_size'>,
) {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam }) => propertiesApi.listPaginated({
      ...filters,
      page: pageParam,
      page_size: PROPERTIES_PAGE_SIZE,
    }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => last.next ? all.length + 1 : undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; property_type: string; address: string }) => propertiesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug, data,
    }: {
      slug: string;
      data: Partial<{ name: string; property_type: string; address: string }>;
    }) => propertiesApi.update(slug, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['properties', variables.slug] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => propertiesApi.delete(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
