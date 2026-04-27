import { useMutation, useQueryClient } from '@tanstack/react-query';
import { slotsApi } from '../api/properties';

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, floorId, unitId, data,
    }: {
      propertyId: string;
      floorId:    string;
      unitId:     string;
      data:       { slot_number: string; name?: string; monthly_rent: string };
    }) => slotsApi.create(propertyId, floorId, unitId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['slots', vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['units', vars.propertyId, vars.floorId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, floorId, unitId, slotId, data,
    }: {
      propertyId: string;
      floorId:    string;
      unitId:     string;
      slotId:     string;
      data:       Partial<{ slot_number: string; name: string; monthly_rent: string }>;
    }) => slotsApi.update(propertyId, floorId, unitId, slotId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['slots', vars.propertyId] });
    },
  });
}
