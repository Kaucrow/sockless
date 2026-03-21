import { z } from 'zod';

export const paymentMethodSchema = z.object({
  payment_method_id: z.uuid(),
  name: z.string(),
});