import apiClient from './client';
import type { Tenant } from '../../types/tenant';

export interface TenantFilters {
  query?: string;
  property_id?: number;
  active?: boolean;
  unpaid?: boolean;
  month?: number;
  year?: number;
}

export interface CreateTenantInput {
  name: string;
  phone: string;
  email?: string;
  slot: number;
  join_date: string;
  deposit_amount?: number;
  photo_url?: string;
}

export const tenantsApi = {
  list: (params?: TenantFilters) =>
    apiClient.get<Tenant[]>('/tenants/', { params }).then((r) => r.data),

  bySlug: (slug: string) =>
    apiClient.get<Tenant>(`/tenants/${slug}/`).then((r) => r.data),

  create: (data: CreateTenantInput) =>
    apiClient.post<Tenant>('/tenants/', data).then((r) => r.data),

  update: (id: number, data: Partial<CreateTenantInput>) =>
    apiClient.patch<Tenant>(`/tenants/${id}/`, data).then((r) => r.data),

  exit: (id: number, exit_date: string) =>
    apiClient.post<Tenant>(`/tenants/${id}/exit/`, { exit_date }).then((r) => r.data),
};
