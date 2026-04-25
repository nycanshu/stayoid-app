export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface Payment {
  id: number;
  tenant: number;
  tenant_detail: {
    id: number;
    slug: string;
    name: string;
    phone: string;
    slot_detail: {
      unit_number: string;
      property_name: string;
      property_slug: string;
    };
  };
  amount: number;
  month: number;
  year: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  note: string | null;
  created_at: string;
}

export interface RecordPaymentInput {
  tenant: number;
  amount: number;
  month: number;
  year: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  note?: string;
}
