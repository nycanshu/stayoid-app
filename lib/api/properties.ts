import apiClient from './client';
import type { Property, Floor, Unit, Slot, Dashboard } from '../../types/property';

export const propertiesApi = {
  list: () =>
    apiClient.get<Property[]>('/properties/').then((r) => r.data),

  bySlug: (slug: string) =>
    apiClient.get<Property>(`/properties/by-slug/${slug}/`).then((r) => r.data),

  create: (data: Partial<Property>) =>
    apiClient.post<Property>('/properties/', data).then((r) => r.data),

  update: (slug: string, data: Partial<Property>) =>
    apiClient.put<Property>(`/properties/by-slug/${slug}/`, data).then((r) => r.data),

  delete: (slug: string) =>
    apiClient.delete(`/properties/by-slug/${slug}/`),

  dashboard: (propertyId?: number) =>
    apiClient
      .get<Dashboard>('/dashboard/', { params: propertyId ? { property_id: propertyId } : {} })
      .then((r) => r.data),
};

export const floorsApi = {
  create: (propertyId: number, data: { floor_number: number; floor_name?: string }) =>
    apiClient.post<Floor>(`/properties/${propertyId}/floors/`, data).then((r) => r.data),
};

export const unitsApi = {
  create: (
    propertyId: number,
    floorId: number,
    data: { unit_number: string; capacity: number },
  ) =>
    apiClient
      .post<Unit>(`/properties/${propertyId}/floors/${floorId}/units/`, data)
      .then((r) => r.data),
};

export const slotsApi = {
  list: (params: { property_id?: number; vacant?: boolean }) =>
    apiClient.get<Slot[]>('/slots/', { params }).then((r) => r.data),

  create: (propertyId: number, floorId: number, unitId: number, data: { monthly_rent: number }) =>
    apiClient
      .post<Slot>(`/properties/${propertyId}/floors/${floorId}/units/${unitId}/slots/`, data)
      .then((r) => r.data),
};
