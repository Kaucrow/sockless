import { z } from 'zod';

export const getOneUserSchema = z.object({
  email: z.string(),
});

export const getManyUsersSchema = z.object({
  emails: z.array(z.string()),
});