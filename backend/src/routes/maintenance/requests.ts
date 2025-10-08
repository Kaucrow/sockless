import { z } from 'zod';

export const addMethodProfileSchema = z.object({
  subsystem: z.string(),
  class : z.string(),
  method: z.string(),
  profile: z.string()
});

export const addUserSchema = z.object({
  email: z.string(),
  passwd: z.string(),
  name: z.string(),
  surname: z.string()
});