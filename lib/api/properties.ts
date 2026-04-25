import apiClient from './client';
import type { Property, Floor, Unit, Slot } from '../../types/property';

export const propertiesApi = {
  list: () =>
    apiClient
      .get<{ results: Property[] } | Property[]>('/properties/')
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.results)),

  bySlug: (slug: string) =>
    apiClient.get<Property>(`/properties/by-slug/${slug}/`).then((r) => r.data),

  create: (data: { name: string; property_type: string; address: string }) =>
    apiClient.post<Property>('/properties/', data).then((r) => r.data),

  update: (slug: string, data: Partial<{ name: string; property_type: string; address: string }>) =>
    apiClient.put<Property>(`/properties/by-slug/${slug}/`, data).then((r) => r.data),

  delete: (slug: string) =>
    apiClient.delete(`/properties/by-slug/${slug}/`),
};

export const floorsApi = {
  create: (propertyId: string, data: { floor_number: number; name?: string }) =>
    apiClient.post<Floor>(`/properties/${propertyId}/floors/`, data).then((r) => r.data),
};

export const unitsApi = {
  create: (propertyId: string, floorId: string, data: { unit_number: string; capacity?: number }) =>
    apiClient
      .post<Unit>(`/properties/${propertyId}/floors/${floorId}/units/`, data)
      .then((r) => r.data),
};

export const slotsApi = {
  list: (params: { property_id?: string; vacant?: boolean }) =>
    apiClient
      .get<{ results: Slot[] } | Slot[]>('/slots/', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.results)),

  create: (
    propertyId: string,
    floorId: string,
    unitId: string,
    data: { slot_number: string; monthly_rent: string },
  ) =>
    apiClient
      .post<Slot>(`/properties/${propertyId}/floors/${floorId}/units/${unitId}/slots/`, data)
      .then((r) => r.data),
};
