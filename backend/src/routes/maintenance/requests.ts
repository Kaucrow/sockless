import { z } from 'zod';

export const addUserProfileSchema = z.object({
  email: z.string(),
});

export const addMethodProfileSchema = z.object({
  subsystem: z.string(),
  class: z.string(),
  method: z.string(),
});

export const removeMethodProfileSchema = z.object({
  subsystem: z.string(),
  class: z.string(),
  method: z.string()
});

export const addMenuProfileSchema = z.object({
  subsystem: z.string(),
  menu: z.string(),
  profile: z.string()
});

export const removeMenuProfileSchema = z.object({
  subsystem: z.string(),
  menu: z.string(),
  profile: z.string()
});

export const addUserSchema = z.object({
  email: z.string(),
  passwd: z.string(),
  name: z.string(),
  surname: z.string()
});

export const getUserProfilesSchema = z.object({
  email: z.string()
});

export const removeUserProfileSchema = z.object({
  email: z.string(),
});

export const changeProfileNameSchema = z.object({
  newName: z.string()
});