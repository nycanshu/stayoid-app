import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { floorsApi } from '../api/properties';

export function useFloors(propertyId?: string) {
  return useQuery({
    queryKey: ['floors', propertyId],
    queryFn:  () => floorsApi.list(propertyId!),
    enabled:  !!propertyId,
    staleTime: 30_000,
    gcTime:   5 * 60_000,
  });
}

export function useCreateFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, data,
    }: {
      propertyId: string;
      data: { floor_number: number; name?: string };
    }) => floorsApi.create(propertyId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['floors', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['slots', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, floorId, data,
    }: {
      propertyId: string;
      floorId:    string;
      data:       Partial<{ floor_number: number; name: string }>;
    }) => floorsApi.update(propertyId, floorId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['floors', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['slots',  vars.propertyId] });
    },
  });
}

export function useDeleteFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, floorId,
    }: {
      propertyId: string;
      floorId:    string;
    }) => floorsApi.delete(propertyId, floorId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['floors', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['slots',  vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
