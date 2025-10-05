import { z } from 'zod';

export const userSchema = z.object({
  user_id: z.uuid(),
  email: z.string(),
  passwd: z.string(),
  name: z.string(),
  surname: z.string()
});

export const methodDataSchema = z.object({
  subsystem: z.string(),
  class: z.string(),
  method: z.string()
});

export const profileSchema = z.object({
  profile_name: z.string(),
});

export const methodAllowedProfileSchema = z.object({
  profile_id: z.uuid(),
  profile_name: z.string()
});

export const profileDataSchema = z.object({
  subsystem_name: z.string(),
  class_name: z.string(),
  method_name: z.string(),
  profile_name: z.string()
});