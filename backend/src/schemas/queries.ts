import { z } from 'zod';

export const queriesSchema = z.object({
  tx: z.object({
    getMethodCall: z.string(),
  }),
  sync: z.object({
    deleteMethodProfiles: z.string(),
    deleteMenuProfiles: z.string(),
    deleteMethods: z.string(),
    deleteMenus: z.string(),
    deleteClasses: z.string(),
    deleteSubsystems: z.string(),
    deleteTx: z.string(),
    addSubsystemReturnId: z.string(),
    addClassReturnId: z.string(),
    addMethodReturnId: z.string(),
    addMenuReturnId: z.string(),
    addTx: z.string(),
    getSubsystemId: z.string(),
    getClassId: z.string(),
    getMethodId: z.string(),
    getMenuId: z.string(),
    getProfileId: z.string(),
    linkMethodProfile: z.string(),
    linkMenuProfile: z.string(),
  }),
  user: z.object({
    getUserByEmail: z.string(),
    getManyUsersByEmail: z.string(),
    getUserById: z.string(),
    getProfilesByUserId: z.string(),
    getProfilesByEmail: z.string(),
    getAllowedMenus: z.string(),
    add: z.string(),
    changePassword: z.string(),
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
  }),
  event: z.object({
    create: z.string(),
    getAll: z.string(),
    getEventById: z.string(),
    update: z.string(),
    getAttendances: z.string(),
  }),
  location: z.object({
    create: z.string(),
    getAll: z.string(),
  }),
  reservation: z.object({
    create: z.string(),
    getByEventId: z.string(),
  }),
  flyer: z.object({
    addEventFlyer: z.string(),
    getEventFlyer: z.string(),
  }),
  attendee: z.object({
    add: z.string(),
    getAttendances: z.string(),
    checkIn: z.string(),
  }),
  staff: z.object({
    add: z.string(),
    addToEvent: z.string(),
    getAllInEvent: z.string(),
    getRoles: z.string(),
    createRole: z.string(),
  }),
});