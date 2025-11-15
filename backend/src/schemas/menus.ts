import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string(),
  profiles: z.array(z.string())
});

export const menuConfigSchema = z.record(
  z.string(),
  z.array(menuItemSchema)
);