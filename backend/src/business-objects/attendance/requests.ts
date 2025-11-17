import { z } from 'zod';

export const registerAttendeeSchema = z.object({
  email: z.string(),
  eventId: z.uuid(), 
});

export const getUserAttendancesSchema = z.object({
  email: z.string(),
});

export const checkInAttendeeSchema = z.object({
  email: z.string(),
  eventId: z.uuid(),
});