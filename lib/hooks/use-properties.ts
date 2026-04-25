import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi, slotsApi } from '../api/properties';
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

export function useSlots(propertyId?: string, vacant?: boolean) {
  return useQuery({
    queryKey: ['slots', propertyId, vacant],
    queryFn: () => slotsApi.list({ property_id: propertyId, vacant }),
    staleTime: 30_000,
    enabled: !!propertyId,
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
