import { session } from '@components/session.js';
import { dbPool } from '@global/database.js';
import { queries } from '@const/constants.js';
import type { MethodCall } from '@/types/security.js';
import type { UUID } from '@/types/global.js';
import { allowedProfileSchema } from '@schemas/db/security.js';
import { objectToCamel } from 'ts-case-convert';
import type { Request } from 'express';

class SecurityComponent {
  static #instance: SecurityComponent;

  private constructor() {}

  public static get instance(): SecurityComponent {
    if (!SecurityComponent.#instance) {
      SecurityComponent.#instance = new SecurityComponent();
    }
    return SecurityComponent.#instance;
  }

  public async hasMethodPermission(req: Request, methodCall: MethodCall): Promise<boolean> {
    const userData = await session.get(req);

    if (!userData) return false;

    const allowedProfiles = await this.getMethodAllowedProfiles(methodCall);

    const hasPermission = userData.profiles.some(profile =>
      allowedProfiles.has(profile)
    );

    return hasPermission;
  }

  public async getMethodAllowedProfiles(methodCall: MethodCall): Promise<Set<UUID>> {
    let profiles: Set<UUID> = new Set();

    const { subsystem, class: className, method } = methodCall;

    try {
      const profilesResult = await dbPool.query(
        queries.method.getAllowedProfiles,
        [subsystem, className, method]
      );

      if (profilesResult.rowCount) {
        profilesResult.rows.forEach(row => {
          const dbProfile = objectToCamel(allowedProfileSchema.parse(row));
          profiles.add(dbProfile.profileId);
        });
      }
    } catch (err) {
      console.error(`Error getting allowed user profiles: ${err}`);
    }

    return profiles;
  }
}

export const security = SecurityComponent.instance;