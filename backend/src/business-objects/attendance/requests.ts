import { z } from 'zod';

export const adminGetUserAttendancesSchema = z.object({
  email: z.string(),
});

export const getUserAttendancesSchema = z.object({
  userId: z.uuid(),
});

export const checkInAttendeeSchema = z.object({
  email: z.string(),
  eventId: z.uuid(),
});