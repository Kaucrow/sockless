import type { UUID } from "@/types/global.js"

export interface GetUserResponse {
  userId: UUID,
  name: string,
  surname: string,
};