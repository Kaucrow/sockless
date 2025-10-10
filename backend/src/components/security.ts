import { objectToCamel } from 'ts-case-convert';
import argon2 from 'argon2';
import type { Request } from 'express';
import { session } from '@components/session.js';
import { dbPool } from '@global/database.js';
import { queries } from '@const/constants.js';
import type { MethodData } from '@/types/security.js';
import type { UUID } from '@/types/global.js';
import {
  methodAllowedProfileSchema,
  profileDataSchema,
  profileSchema
} from '@schemas/db/security.js';

type MethodProfileData = { [subsystem: string]: { [className: string]: { [methodName: string]: string[] } } };

class SecurityComponent {
  static #instance: SecurityComponent;

  private constructor() {}

  public static get instance(): SecurityComponent {
    if (!SecurityComponent.#instance) {
      SecurityComponent.#instance = new SecurityComponent();
    }
    return SecurityComponent.#instance;
  }

  public async hasMethodPermission(req: Request, methodCall: MethodData): Promise<boolean> {
    const userData = await session.get(req);

    if (!userData) return false;

    const allowedProfiles = await this.getMethodAllowedProfiles(methodCall);

    for (const profile of userData.profiles) {
      if (allowedProfiles.has(profile)) {
        return true;  // Found a matching profile, permission granted
      }
    }

    return false;
  }

  public async getMethodAllowedProfiles(methodCall: MethodData): Promise<Set<UUID>> {
    let profiles: Set<UUID> = new Set();

    const { subsystem, class: className, method } = methodCall;

    try {
      const profilesResult = await dbPool.query(
        queries.method.getAllowedProfiles,
        [subsystem, className, method]
      );

      if (profilesResult.rowCount) {
        profilesResult.rows.forEach(row => {
          const dbProfile = objectToCamel(methodAllowedProfileSchema.parse(row));
          profiles.add(dbProfile.profileId);
        });
      }
    } catch (err) {
      console.error(`Error getting allowed user profiles: ${err}`);
    }

    return profiles;
  }

  public async getProfiles(): Promise<string[]> {
    let profiles: string[] = [];

    try {
      const profilesResult = await dbPool.query(queries.profile.getAll);

      if (profilesResult.rowCount) {
        profilesResult.rows.forEach(row => {
          const profile = objectToCamel(profileSchema.parse(row));
          profiles.push(profile.profileName);
        });
      }
    } catch (err) {
      console.error(`Error getting profiles: ${err}`);
    }
      
    return profiles;
  }

  public async changeProfileName(profile: string, newName: string) {
    await dbPool.query(queries.profile.changeName, [profile, newName]); 
  }

  public async getMethodProfileData(): Promise<MethodProfileData> {
    // Stores subsystems, classes, methods, and the methods' allowed profiles
    let profileData: MethodProfileData = {};

    try {
      const profileDataResult = await dbPool.query(queries.method.getProfileData);

      if (profileDataResult.rowCount) {
        profileDataResult.rows.forEach(row => {
          const {
            subsystemName: subsystem,
            className,
            methodName: method,
            profileName: profile
          } = objectToCamel(profileDataSchema.parse(row));

          // Ensure the subsystem object exists, or create it
          if (!profileData[subsystem]) {
            profileData[subsystem] = {};
          }
          
          // Ensure the class object exists, or create it
          if (!profileData[subsystem][className]) {
            profileData[subsystem][className] = {};
          }
          
          // Ensure the method's Array exists, or create it
          if (!profileData[subsystem][className][method]) {
            profileData[subsystem][className][method] = [];
          }

          // Add the profile to the Set
          profileData[subsystem][className][method].push(profile);
        });
      }
    } catch (err) {
      console.error(`Error getting methods' allowed profiles: ${err}`);
    }

    return profileData;
  }

  public async addMethodProfile(subsystem: string, className: string, method: string, profile: string) {
    await dbPool.query(queries.method.addProfile, [subsystem, className, method, profile]);
  }

  public async removeMethodProfile(subsystem: string, className: string, method: string, profile: string) {
    await dbPool.query(queries.method.removeProfile, [subsystem, className, method, profile]);
  }

  public async addMenuProfile(subsystem: string, menu: string, profile: string) {
    await dbPool.query(queries.menu.addProfile, [subsystem, menu, profile]);
  }

  public async removeMenuProfile(subsystem: string, menu: string, profile: string) {
    await dbPool.query(queries.menu.removeProfile, [subsystem, menu, profile]);
  }

  public async addUser(email: string, passwd: string, name: string, surname: string) {
    const hashed_passwd = await argon2.hash(passwd);
    await dbPool.query(queries.user.add, [email, hashed_passwd, name, surname]);
  }

  public async getUserProfiles(email: string): Promise<Set<string>> {
    let profiles: Set<string> = new Set();

    let profilesResult = await dbPool.query(queries.user.getProfilesByEmail, [email]);

    if (profilesResult.rowCount) {
      profilesResult.rows.forEach(row => {
        profiles.add(objectToCamel(profileSchema.parse(row)).profileName);
      })
    }

    return profiles;
  }

  public async addUserProfile(email: string, profile: string) {
    await dbPool.query(queries.user.addProfile, [email, profile]);
  }

  public async removeUserProfile(email: string, profile: string) {
    await dbPool.query(queries.user.removeProfile, [email, profile]);
  }

  public async deleteProfile(profile: string) {
    try {
      await dbPool.query('BEGIN');

      await dbPool.query(queries.profile.removeFromAllUsers, [profile]);
      await dbPool.query(queries.profile.removeFromAllMethods, [profile]);
      await dbPool.query(queries.profile.removeFromAllMenus, [profile]);
      await dbPool.query(queries.profile.delete, [profile]);

      await dbPool.query('COMMIT');
    } catch (err) {
      await dbPool.query('ROLLBACK');
      throw err;
    } finally {
      dbPool.release();
    }
  }
}

export const security = SecurityComponent.instance;