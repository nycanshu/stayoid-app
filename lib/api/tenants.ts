import apiClient from './client';
import type { Tenant, CreateTenantInput } from '../../types/tenant';
import type { Paginated } from '../../types/api';

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
  /** Returns a flat array — used by callers that want "give me up to page_size tenants". */
  list: (params?: TenantFilters) =>
    apiClient
      .get<{ results: Tenant[] } | Tenant[]>('/tenants/', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.results)),

  /** Returns the full paginated envelope — used by useInfiniteTenants. */
  listPaginated: (params?: TenantFilters) =>
    apiClient
      .get<Paginated<Tenant> | Tenant[]>('/tenants/', { params })
      .then((r) => (Array.isArray(r.data)
        ? { count: r.data.length, next: null, previous: null, results: r.data }
        : r.data)),

  bySlug: (slug: string) =>
    apiClient.get<Tenant>(`/tenants/${slug}/`).then((r) => r.data),

  create: (data: CreateTenantInput) =>
    apiClient.post<Tenant>('/tenants/', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateTenantInput>) =>
    apiClient.patch<Tenant>(`/tenants/${id}/`, data).then((r) => r.data),

  exit: (id: string, exit_date: string) =>
    apiClient.post<Tenant>(`/tenants/${id}/exit/`, { exit_date }).then((r) => r.data),
};
