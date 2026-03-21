import { z } from 'zod';

export const userAttendanceSchema = z.object({
  event_id: z.uuid(),
  user_id: z.uuid(),
  ticket_id: z.uuid(),
  ticket_name: z.string(),
  ticket_cost: z.coerce.number(),
  attended: z.boolean(),
});

export const eventAttendanceSchema = z.object({
  event_id: z.uuid(),
  user_id: z.uuid(),
  ticket_id: z.uuid(),
  ticket_name: z.string(),
  ticket_cost: z.coerce.number(),
  attended: z.boolean(),
  user_name: z.string(),
  user_surname: z.string(),
  user_email: z.string(),
});