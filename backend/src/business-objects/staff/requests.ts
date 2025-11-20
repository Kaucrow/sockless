import { z } from 'zod';

export const addStaffSchema = z.object({
  email: z.string()
    .min(1, "Email is required"),

  phoneNumber: z.string()
    .max(20, "Phone number cannot exceed 20 characters"),

  address: z.string()
    .min(1, "Address is required"),
});

export const addStaffToEventSchema = z.object({
  email: z.string()
    .min(1, "Email is required"),

  eventId: z.uuid(),

  staffRoleId: z.uuid(),

  cost: z.number()
    .positive("Cost must be a positive number")
    .multipleOf(0.01)   // Max 2 decimal places
});

export const getAllStaffInEventSchema = z.object({
  eventId: z.uuid(),
});

export const createRoleSchema = z.object({
  name: z.string()
    .max(100, "Role name cannot exceed 100 characters"),

  description: z.string()
});