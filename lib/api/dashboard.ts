import apiClient from './client';
import type { Dashboard } from '../../types/property';

export const dashboardApi = {
  get: (propertyId?: string) =>
    apiClient
      .get<Dashboard>('/dashboard/', {
        params: propertyId ? { property_id: propertyId } : {},
      })
      .then((r) => r.data),
};
