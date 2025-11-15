import { z } from 'zod';

export const locationSchema = z.object({
  location_id: z.uuid(),
  country: z.string(),
  city: z.string(),
  name: z.string(),
});