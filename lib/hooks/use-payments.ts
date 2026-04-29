import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { paymentsApi, type PaymentFilters } from '../api/payments';
import type { RecordPaymentInput } from '../../types/payment';

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentsApi.list(filters),
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  });
}

const PAYMENTS_PAGE_SIZE = 20;

export function useInfinitePayments(filters?: Omit<PaymentFilters, 'page' | 'page_size'>) {
  return useInfiniteQuery({
    queryKey: ['payments', 'infinite', filters],
    queryFn: ({ pageParam }) => paymentsApi.listPaginated({
      ...filters,
      page: pageParam,
      page_size: PAYMENTS_PAGE_SIZE,
    }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => last.next ? all.length + 1 : undefined,
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentInput) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['tenants'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
