import apiClient from './client';
import type { Payment, RecordPaymentInput } from '../../types/payment';

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

  create: (data: RecordPaymentInput) =>
    apiClient.post<Payment>('/payments/', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/payments/${id}/`),
};
