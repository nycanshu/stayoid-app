import apiClient from './client';
import type { Payment, RecordPaymentInput } from '../../types/payment';

export interface PaymentFilters {
  month?: number;
  year?: number;
  tenant_id?: number;
  property_id?: number;
}

export const paymentsApi = {
  list: (params?: PaymentFilters) =>
    apiClient.get<Payment[]>('/payments/', { params }).then((r) => r.data),

  create: (data: RecordPaymentInput) =>
    apiClient.post<Payment>('/payments/', data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/payments/${id}/`),
};
