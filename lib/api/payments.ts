import apiClient from './client';
import type { Payment, RecordPaymentInput } from '../../types/payment';
import type { Paginated } from '../../types/api';

export interface PaymentFilters {
  month?: number;
  year?: number;
  tenant_id?: string;
  property_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export const paymentsApi = {
  list: (params?: PaymentFilters) =>
    apiClient
      .get<{ results: Payment[] } | Payment[]>('/payments/', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.results)),

  listPaginated: (params?: PaymentFilters) =>
    apiClient
      .get<Paginated<Payment> | Payment[]>('/payments/', { params })
      .then((r) => (Array.isArray(r.data)
        ? { count: r.data.length, next: null, previous: null, results: r.data }
        : r.data)),

  create: (data: RecordPaymentInput) =>
    apiClient.post<Payment>('/payments/', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/payments/${id}/`),
};
