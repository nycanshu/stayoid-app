import { z } from 'zod';

export const propertyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Property name is required')
    .max(255, 'Property name must be 255 characters or fewer'),
  property_type: z.enum(['PG', 'FLAT']),
  address: z.string().trim().min(1, 'Address is required'),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
