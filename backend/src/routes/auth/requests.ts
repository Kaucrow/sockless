import { z } from 'zod';

export const addUserSchema = z.object({
  email: z.string(),
  passwd: z.string(),
  name: z.string(),
  surname: z.string()
});

export const verifyEmailSchema = z.object({
  token: z.string()
});

export const forgotPasswordSchema = z.object({
  email: z.string()
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  passwd: z.string() 
});