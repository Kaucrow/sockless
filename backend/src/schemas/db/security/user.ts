import { z } from 'zod';

export const userSchema = z.object({
  user_id: z.uuid(),
  email: z.string(),
  passwd: z.string(),
  name: z.string(),
  surname: z.string()
});

export const userShortSchema = z.object({
  user_id: z.uuid(),
  email: z.string(),
  name: z.string(),
  surname: z.string(),
});

export const allowedMenusSchema = z.object({
  menu_name: z.string(),
});