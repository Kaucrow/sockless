import { z } from 'zod';

export const addMethodProfileSchema = z.object({
  subsystem: z.string(),
  class : z.string(),
  method: z.string(),
  profile: z.string()
});