export type PropertyType = 'PG' | 'FLAT';
export type UnitType = 'ROOM' | 'FLAT';
export type SlotType = 'BED' | 'MEMBER';

export interface Property {
  id: string;
  slug: string;
  name: string;
  property_type: PropertyType;
  property_type_display: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: string;
  slug: string;
  floor_number: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  slug: string;
  unit_type: UnitType;
  unit_number: string;
  name: string;
  capacity: number;
}

export interface Slot {
  id: string;
  slug: string;
  slot_type: SlotType;
  slot_number: string;
  monthly_rent: string;
  is_occupied: boolean;
  unit_number: string;
  unit_slug: string;
  floor_number: number;
  floor_name: string;
  floor_slug: string;
  property_id: string;
  property_name: string;
  property_slug: string;
  property_type: PropertyType;
  active_tenant: {
    id: string;
    slug: string;
    name: string;
    phone: string;
  } | null;
}

export interface DashboardSummary {
  total_properties: number;
  total_slots: number;
  occupied_slots: number;
  vacant_slots: number;
  occupancy_rate: number;
  active_tenants: number;
}

export interface DashboardCurrentMonth {
  month: number;
  year: number;
  display: string;
  expected_rent: string;
  collected_rent: string;
  pending_rent: string;
  collection_rate: number;
  paid_count: number;
  pending_count: number;
}

export interface DashboardProperty {
  id: string;
  name: string;
  total_slots: number;
  occupied: number;
  vacant: number;
  expected_rent: string;
  collected_rent: string;
}

export interface DashboardRecentPayment {
  id: string;
  tenant_name: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  property_name: string;
}

export interface Dashboard {
  summary: DashboardSummary;
  current_month: DashboardCurrentMonth;
  properties: DashboardProperty[];
  recent_payments: DashboardRecentPayment[];
}
