import { z } from 'zod';

export const registerAttendeeSchema = z.object({
  email: z.string(),
  eventId: z.uuid(), 
});