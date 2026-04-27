import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitsApi } from '../api/properties';

export function useUnits(propertyId?: string, floorId?: string) {
  return useQuery({
    queryKey: ['units', propertyId, floorId],
    queryFn:  () => unitsApi.list(propertyId!, floorId!),
    enabled:  !!propertyId && !!floorId,
    staleTime: 30_000,
    gcTime:   5 * 60_000,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, floorId, data,
    }: {
      propertyId: string;
      floorId:    string;
      data:       { unit_number: string; name?: string; capacity?: number };
    }) => unitsApi.create(propertyId, floorId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['units', vars.propertyId, vars.floorId] });
      qc.invalidateQueries({ queryKey: ['floors', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['slots', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, floorId, unitId, data,
    }: {
      propertyId: string;
      floorId:    string;
      unitId:     string;
      data:       Partial<{ unit_number: string; name: string; capacity: number }>;
    }) => unitsApi.update(propertyId, floorId, unitId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['units', vars.propertyId, vars.floorId] });
      qc.invalidateQueries({ queryKey: ['slots', vars.propertyId] });
    },
  });
}
