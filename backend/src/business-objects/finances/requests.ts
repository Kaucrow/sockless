import { z } from 'zod';

export const addCostCategorySchema = z.object({
  name: z.string()
    .min(1, "Cost category name is required"),

  description: z.string().optional(),
});

export const updateCostCategorySchema = z.object({
  costCategoryId: z.uuid(),

  name: z.string()
    .min(1, "Cost category name is required"),

  description: z.string().optional(),
});