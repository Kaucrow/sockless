import { z } from 'zod';

export const reservationSchema = z.object({
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  country: z.string(),
  city: z.string(),
  location_name: z.string()
});