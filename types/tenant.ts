export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type WorkType = 'STUDENT' | 'IT' | 'BUSINESS' | 'GOVERNMENT' | 'HEALTHCARE' | 'OTHER';
export type IdProofType = 'AADHAR' | 'PAN' | 'PASSPORT' | 'DL' | 'VOTER' | 'OTHER';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  phone: string;
  gender: Gender;
  slot_number: string;
  slot_type: string;
  monthly_rent: string;
  unit_number: string;
  unit_type: string;
  property_name: string;
  property_slug: string;
  property_type: string;
  join_date: string;
  exit_date: string | null;
  is_active: boolean;
  deposit_amount: string;
  has_unpaid?: boolean;
  // Detail-only fields
  email?: string | null;
  date_of_birth?: string | null;
  photo_url?: string | null;
  permanent_address?: string;
  work_location?: string;
  work_type?: WorkType;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  id_proof_type?: IdProofType;
  id_proof_number?: string;
  description?: string;
}

export interface CreateTenantInput {
  slot_id: string;
  name: string;
  phone: string;
  gender: Gender;
  permanent_address: string;
  join_date: string;
  deposit_amount: string;
  email?: string;
  work_type?: WorkType;
  work_location?: string;
  date_of_birth?: string;
  id_proof_type?: IdProofType;
  id_proof_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  description?: string;
}
