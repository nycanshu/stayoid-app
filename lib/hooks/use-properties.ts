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

export function useSlots(propertyId?: number, vacant?: boolean) {
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
    mutationFn: (data: Partial<Property>) => propertiesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
