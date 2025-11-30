import { z } from 'zod';

export const attendanceSchema = z.object({
  event_id: z.uuid(),
  user_id: z.uuid(),
  ticket_id: z.uuid(),
  ticket_name: z.string(),
  ticket_cost: z.coerce.number(),
  attended: z.boolean(),
});