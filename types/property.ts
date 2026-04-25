export type PropertyType = 'PG' | 'HOSTEL' | 'APARTMENT';

export interface Property {
  id: number;
  slug: string;
  name: string;
  type: PropertyType;
  address: string;
  created_at: string;
}

export interface Floor {
  id: number;
  property: number;
  floor_number: number;
  floor_name: string;
  created_at: string;
}

export interface Unit {
  id: number;
  floor: number;
  unit_number: string;
  capacity: number;
  created_at: string;
}

export type SlotType = 'ROOM' | 'BED';

export interface Slot {
  id: number;
  unit: number;
  slot_number: string;
  slot_type: SlotType;
  monthly_rent: number;
  is_occupied: boolean;
  floor_number: number;
  floor_name: string;
  unit_number: string;
  active_tenant: {
    id: number;
    slug: string;
    name: string;
    has_unpaid: boolean;
  } | null;
}

export interface DashboardProperty {
  id: number;
  slug: string;
  name: string;
  type: PropertyType;
  total_slots: number;
  occupied_slots: number;
  vacant_slots: number;
  expected_rent: number;
  collected_rent: number;
}

export interface Dashboard {
  month: number;
  year: number;
  total_properties: number;
  total_slots: number;
  occupied_slots: number;
  vacant_slots: number;
  occupancy_rate: number;
  expected_rent: number;
  collected_rent: number;
  collection_rate: number;
  properties: DashboardProperty[];
}
