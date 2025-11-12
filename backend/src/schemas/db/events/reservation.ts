import { z } from 'zod';

export const reservationSchema = z.object({
  cost: z.number(),
  country: z.string(),
  city: z.string(),
  location_name: z.string()
});