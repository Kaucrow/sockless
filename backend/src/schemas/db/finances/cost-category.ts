import { z } from 'zod';

export const costCategorySchema = z.object({
  cost_category_id: z.uuid(),
  name: z.string(),
  description: z.string(),
});