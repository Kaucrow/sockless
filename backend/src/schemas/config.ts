import { z } from 'zod';

export const configSchema = z.object({
  server: z.object({
    port: z.number()
  }),
  frontend: z.object({
    host: z.string(),
    port: z.number()
  }),
  session: z.object({
    secret: z.string()
  }),
  database: z.object({
    host: z.string(),
    port: z.number(),
    name: z.string(),
    user: z.string(),
    password: z.string(),
  }),
  maintenance: z.object({
    adminProfile: z.string()
  })
});