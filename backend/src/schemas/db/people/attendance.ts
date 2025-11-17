import { z } from 'zod';

export const userAttendanceSchema = z.object({
  event_id: z.uuid(),
  attended: z.boolean(),
});

export const eventAttendanceSchema = z.object({
  user_id: z.uuid(),
  attended: z.boolean(),
});