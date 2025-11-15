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

export const updateEventSchema = z.object({
  eventId: z.uuid(),

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
    .min(1, "Event description is required")
    .max(1000, "Event description must be 1000 characters or less")
    .trim()
}).refine((data) => new Date(data.endDt) > new Date(data.startDt), {
  message: "End date must be after start date",
  path: ["endDt"]
});

export const createLocationSchema = z.object({
  country: z.string()
    .min(1, "Country name is required")
    .max(100, "Country name must be 100 characters or less"),
  
  city: z.string()
    .min(1, "City name is required")
    .max(100, "City name must be 100 characters or less"),

  name: z.string()
    .min(1, "Location name is required")
    .max(200, "Location name must be 200 characters or less"),
});

export const setEventReservationSchema = z.object({
  eventId: z.uuid(),

  locationId: z.uuid(),

  cost: z.number()
    .positive("Cost must be a positive number")
    .multipleOf(0.01)   // Max 2 decimal places
});

export const getEventReservationSchema = z.object({
  eventId: z.uuid(),
});

export const addEventFlyerSchema = z.object({
  imageFile: z.custom<Express.Multer.File>(
    (val) => val instanceof Object && 'fieldname' in val && 'originalname' in val
  ),

  eventId: z.uuid(),
});

export const getEventFlyerSchema = z.object({
  eventId: z.uuid(),
});