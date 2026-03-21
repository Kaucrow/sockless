import { z } from 'zod';

export const ticketDescSchema = z.object({
  ticket_desc_id: z.uuid(),
  event_id: z.uuid(),
  name: z.string(),
  description: z.string(),
  cost: z.coerce.number(),
  available: z.coerce.number(),
});

export const ticketSchema = z.object({
  ticket_id: z.uuid(),
});

export const ticketPaidVerificationSchema = z.object({
  paid: z.coerce.boolean(),
  difference: z.coerce.number(),
});

export const ticketDescCreatedSchema = z.object({
  ticket_desc_id: z.uuid(),
});