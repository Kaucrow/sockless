import { z } from 'zod';

export const queriesSchema = z.object({
  tx: z.object({
    getMethodCall: z.string(),
  }),
  user: z.object({
    getUserByEmail: z.string(),
    getUserById: z.string(),
    getProfiles: z.string(),
    add: z.string()
  }),
  method: z.object({
    getAllowedProfiles: z.string(),
    getProfileData: z.string(),
    addProfile: z.string()
  }),
  profile: z.object({
    getAll: z.string()
  })
});