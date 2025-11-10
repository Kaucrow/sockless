import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string()
    .min(1, "Event name is required")
    .max(200, "Event name must be 200 characters or less")
    .trim(),
 
  startDt: z.iso.datetime("Start date must be a valid ISO 8601 date string")
    .refine((date) => new Date(date) > new Date(), {
      message: "Start date must be in the future"
    }),
 
  endDt: z.iso.datetime("End date must be a valid ISO 8601 date string"),
 
  description: z.string()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or less")
    .trim()
}).refine((data) => new Date(data.endDt) > new Date(data.startDt), {
  message: "End date must be after start date",
  path: ["endDt"]
});

export const getEventSchema = z.object({
  eventId: z.uuid()
});