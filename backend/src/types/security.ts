import type { UUID } from "@/types/global.js";

export type MethodProfileData = { [subsystem: string]: { [className: string]: { [method: string]: string[] } } };

export type MenuProfileData = { [subsystem: string]: { [menu: string]: string[] } };

export type ActiveRegistrations = Map<UUID, {
  email: string,
  passwd: string,
  name: string,
  surname: string
}>;

export type ActivePasswordRecoveries = Map<UUID, string>;

export interface MethodData {
  subsystem: string,
  class: string,
  method: string
};

export interface Profile {
  profileId: UUID,
  profileName: string 
};

export interface EmailVerificationTokenPayload {
  id: UUID
};

export interface MethodPermissionInput {
  tx: number;
  subsystem: string;
  className: string;
  methodName: string;
  profiles: string[];
};