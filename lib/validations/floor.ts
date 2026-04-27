import { z } from 'zod';

// Form schema: floor_number is a string in the form (TextInput) but coerced to number
export const floorFormSchema = z.object({
  floor_number: z.string().refine(
    (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= -2 && n <= 99;
    },
    'Floor number must be a whole number between -2 and 99',
  ),
  name: z.string().trim().max(80, 'Name is too long').optional(),
});

export type FloorFormValues = z.infer<typeof floorFormSchema>;
