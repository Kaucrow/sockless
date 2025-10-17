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
    type: z.enum(["express", "paseto"]),
    secret: z.string().optional()
  }),
  database: z.object({
    type: z.enum(["postgresql", "mysql"]),
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