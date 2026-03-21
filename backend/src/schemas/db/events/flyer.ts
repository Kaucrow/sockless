import { z } from 'zod';

export const flyerSchema = z.object({
  url: z.string(),
});