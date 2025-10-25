import { z } from 'zod';

export const queriesSchema = z.object({
  tx: z.object({
    getMethodCall: z.string(),
  }),
  user: z.object({
    getUserByEmail: z.string(),
    getUserById: z.string(),
    getProfilesByUserId: z.string(),
    getProfilesByEmail: z.string(),
    add: z.string(),
    addProfile: z.string(),
    removeProfile: z.string(),
  }),
  method: z.object({
    getAllowedProfiles: z.string(),
    getProfileData: z.string(),
    addProfile: z.string(),
    removeProfile: z.string()
  }),
  menu: z.object({
    getProfileData: z.string(),
    addProfile: z.string(),
    removeProfile: z.string()
  }),
  profile: z.object({
    getAll: z.string(),
    changeName: z.string(),
    removeFromAllUsers: z.string(),
    removeFromAllMethods: z.string(),
    removeFromAllMenus: z.string(),
    delete: z.string()
  })
});