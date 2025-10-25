import { z } from 'zod';

export const profileSchema = z.object({
  profile_id: z.string(),
  profile_name: z.string(),
});

export const allowedProfileSchema = z.object({
  profile_id: z.uuid(),
  profile_name: z.string()
});

export const methodProfileDataSchema = z.object({
  subsystem_name: z.string(),
  class_name: z.string(),
  method_name: z.string(),
  profile_name: z.string().nullable()
});

export const menuProfileDataSchema = z.object({
  subsystem_name: z.string(),
  menu_name: z.string(),
  profile_name: z.string().nullable()
});