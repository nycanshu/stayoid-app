import { z } from 'zod';

export const slotFormSchema = z.object({
  slot_number:  z.string().trim().min(1, 'Slot number is required').max(50, 'Too long'),
  name:         z.string().trim().max(100, 'Too long').optional().or(z.literal('')),
  monthly_rent: z
    .string()
    .trim()
    .min(1, 'Rent is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid amount'),
});

export type SlotFormValues = z.infer<typeof slotFormSchema>;
