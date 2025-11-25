import { z } from 'zod';

export const staffSchema = z.object({
  user_id: z.uuid(),
  phone: z.string(),
  address: z.string(),
});

export const staffRoleSchema = z.object({
  staff_role_id: z.uuid(),
  name: z.string(),
  desc_txt: z.string(),
});

export const staffInEventSchema = z.object({
  staff_id: z.uuid(),
  event_id: z.uuid(),
  cost: z.coerce.number(),
  staff_role_id: z.uuid(),
  role_name: z.string(),
  role_description: z.string()   
});