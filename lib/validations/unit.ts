import { z } from 'zod';

export const unitFormSchema = z.object({
  unit_number: z.string().trim().min(1, 'Unit number is required').max(50, 'Too long'),
  name:        z.string().trim().max(100, 'Too long').optional().or(z.literal('')),
  capacity:    z.coerce.number().int().min(1, 'At least 1').max(20, 'Max 20').default(1),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;
