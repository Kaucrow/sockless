import type { UUID } from "@/types/global.js";

export interface MethodCall {
  subsystem: string,
  class: string,
  method: string
};

export interface Profile {
  profileId: UUID,
  profileName: string 
};