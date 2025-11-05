import { z } from 'zod';

export const toProcessSchema = z.object({
  tx: z.number(),
  args: z.record(z.any(), z.any())
});