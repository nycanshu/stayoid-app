import apiClient from './client';
import type { Tenant, CreateTenantInput } from '../../types/tenant';

export interface TenantFilters {
  query?: string;
  property_id?: string;
  active?: boolean;
  unpaid?: boolean;
  month?: number;
  year?: number;
  page?: number;
  page_size?: number;
}

export const tenantsApi = {
  list: (params?: TenantFilters) =>
    apiClient
      .get<{ results: Tenant[] } | Tenant[]>('/tenants/', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.results)),

  bySlug: (slug: string) =>
    apiClient.get<Tenant>(`/tenants/${slug}/`).then((r) => r.data),

  create: (data: CreateTenantInput) =>
    apiClient.post<Tenant>('/tenants/', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateTenantInput>) =>
    apiClient.patch<Tenant>(`/tenants/${id}/`, data).then((r) => r.data),

  exit: (id: string, exit_date: string) =>
    apiClient.post<Tenant>(`/tenants/${id}/exit/`, { exit_date }).then((r) => r.data),
};
