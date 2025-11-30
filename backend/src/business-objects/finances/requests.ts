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

export const addPaymentMethodSchema = z.object({
  name: z.string()
    .min(1, "Payment method name is required"),
});

export const userPayForTicketSchema = z.object({
  ticketDescId: z.uuid(),

  payments: z.array(
    z.object({
      paymentMethod: z.uuid(),

      amount: z.number()
        .positive("Amount must be a positive number")
        .multipleOf(0.01)   // Max 2 decimal places
    })
  )
});

export const adminPayForTicketSchema = z.object({
  email: z.string()
    .min(1, "User email is required"),

  ticketDescId: z.uuid(),

  payments: z.array(
    z.object({
      paymentMethod: z.uuid(),

      amount: z.number()
        .positive("Amount must be a positive number")
        .multipleOf(0.01)   // Max 2 decimal places
    })
  ),
});

export const payForTicketSchema = z.object({
  ticketDescId: z.uuid(),

  payments: z.array(
    z.object({
      paymentMethod: z.uuid(),

      amount: z.number()
        .positive("Amount must be a positive number")
        .multipleOf(0.01)   // Max 2 decimal places
    })
  ),

  userId: z.uuid(),
});