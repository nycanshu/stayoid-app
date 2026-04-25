export type TenantStatus = 'ACTIVE' | 'EXITED';

export interface Tenant {
  id: number;
  slug: string;
  name: string;
  email: string | null;
  phone: string;
  status: TenantStatus;
  is_active: boolean;
  join_date: string;
  exit_date: string | null;
  deposit_amount: number;
  photo_url: string | null;
  slot: number;
  slot_detail: {
    id: number;
    slot_number: string;
    monthly_rent: number;
    unit_number: string;
    floor_number: number;
    floor_name: string;
    property_id: number;
    property_name: string;
    property_slug: string;
  };
  has_unpaid: boolean;
}
