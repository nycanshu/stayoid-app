export type PaymentMethod = 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'CHEQUE' | 'OTHER';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface Payment {
  id: string;
  tenant_id: string;
  tenant_slug: string;
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  property_slug: string;
  property_type: string;
  unit_number: string;
  unit_type: string;
  slot_number: string;
  slot_type: string;
  amount: string;
  payment_date: string;
  payment_for_month: number;
  payment_for_year: number;
  month_year_display: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  notes?: string;
}

export interface RecordPaymentInput {
  tenant_id: string;
  amount: string;
  payment_date: string;
  payment_for_month: number;
  payment_for_year: number;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  transaction_id?: string;
  notes?: string;
}
