import { z } from 'zod';

const phoneRegex = /^\d{10}$/;

export const tenantFormSchema = z.object({
  // Required
  name:              z.string().trim().min(1, 'Name is required').max(100),
  phone:             z.string().regex(phoneRegex, 'Phone must be 10 digits'),
  gender:            z.enum(['MALE', 'FEMALE', 'OTHER']),
  permanent_address: z.string().trim().min(1, 'Address is required'),
  join_date:         z.string().min(1, 'Join date is required'),
  deposit_amount:    z.string().min(1, 'Deposit is required').refine(
                       (v) => !isNaN(Number(v)) && Number(v) >= 0,
                       'Enter a valid deposit amount',
                     ),
  slot_id:           z.string().min(1, 'Select a slot'),

  // Optional with empty-string tolerance
  email:                    z.string().email('Invalid email').or(z.literal('')).optional(),
  work_type:                z.enum(['STUDENT', 'IT', 'BUSINESS', 'GOVERNMENT', 'HEALTHCARE', 'OTHER']).or(z.literal('')).optional(),
  work_location:            z.string().optional(),
  id_proof_type:            z.enum(['AADHAR', 'PAN', 'PASSPORT', 'DL', 'VOTER', 'OTHER']).or(z.literal('')).optional(),
  id_proof_number:          z.string().optional(),
  emergency_contact_name:   z.string().optional(),
  emergency_contact_phone:  z.string().refine(
                              (v) => !v || phoneRegex.test(v),
                              'Phone must be 10 digits',
                            ).optional(),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
