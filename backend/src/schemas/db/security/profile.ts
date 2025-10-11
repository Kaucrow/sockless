import { z } from 'zod';

export const profileSchema = z.object({
  profile_id: z.string(),
  profile_name: z.string(),
});

export const allowedProfileSchema = z.object({
  profile_id: z.uuid(),
  profile_name: z.string()
});

export const profileDataSchema = z.object({
  subsystem_name: z.string(),
  class_name: z.string(),
  method_name: z.string(),
  profile_name: z.string()
});