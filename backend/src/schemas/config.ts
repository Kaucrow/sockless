import { z } from 'zod';

export const configSchema = z.object({
  server: z.object({
    host: z.string(),
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
    pass: z.string()
  }),
  mailer: z.object({
    service: z.string().optional(),
    host: z.string().optional(),
    port: z.number().optional(),
    secure: z.boolean().optional(),
    user: z.string(),
    pass: z.string()
  }),
  maintenance: z.object({
    adminProfile: z.string()
  })
});