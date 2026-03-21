import { z } from 'zod';

export const methodDataSchema = z.object({
  subsystem: z.string(),
  class: z.string(),
  method: z.string(),
  private: z.boolean(),
});