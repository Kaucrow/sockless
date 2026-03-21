import { z } from 'zod';

export const getEventAttendancesSchema = z.object({
  eventId: z.uuid(), 
});