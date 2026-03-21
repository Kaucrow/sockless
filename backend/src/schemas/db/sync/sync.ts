import { z } from 'zod';

export const subsystemIdSchema = z.object({
  subsystem_id: z.uuid(),
});

export const classIdSchema = z.object({
  class_id: z.uuid(),
});

export const methodIdSchema = z.object({
  method_id: z.uuid(),
});

export const menuIdSchema = z.object({
  menu_id: z.uuid(),
});

export const profileIdSchema = z.object({
  profile_id: z.uuid(),
});