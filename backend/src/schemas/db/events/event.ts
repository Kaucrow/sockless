import { z } from 'zod';

export const eventSchema = z.object({
  event_id: z.uuid(),
  name: z.string(),
  desc_txt: z.string(),
  start_dt: z.date(),
  end_dt: z.date()
});