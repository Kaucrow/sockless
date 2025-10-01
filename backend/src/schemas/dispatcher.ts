import { z } from 'zod';

export const toProcessSchema = z.object({
  tx: z.number(),
  args: z.array(z.any())
});