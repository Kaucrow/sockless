import { z } from 'zod';

export const ticketSchema = z.object({
  ticket_id: z.uuid(),
});

export const ticketPaidVerificationSchema = z.object({
  paid: z.boolean(),
  difference: z.number(),
});