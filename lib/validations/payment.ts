import { z } from 'zod';

export const paymentFormSchema = z.object({
  tenant_id:         z.string().min(1, 'Select a tenant'),
  amount:            z.string().min(1, 'Amount is required').refine(
                       (v) => !isNaN(Number(v)) && Number(v) >= 0,
                       'Enter a valid amount',
                     ),
  payment_for_month: z.number().int().min(1).max(12),
  payment_for_year:  z.number().int().min(2000).max(2100),
  payment_method:    z.enum(['CASH', 'UPI', 'BANK', 'CARD', 'CHEQUE', 'OTHER']),
  payment_status:    z.enum(['PAID', 'PARTIAL', 'PENDING']),
  payment_date:      z.string().optional(),
  notes:             z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
