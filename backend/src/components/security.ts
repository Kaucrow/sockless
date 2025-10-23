import { objectToCamel } from 'ts-case-convert';
import argon2 from 'argon2';
import type { Request } from 'express';
import { session, db } from '@components/index.js';
import { queries } from '@const/constants.js';
import type { MethodData } from '@/types/security.js';
import {
  profileDataSchema,
  profileSchema
} from '@schemas/db/index.js';
import { allowedProfileSchema } from '@schemas/db/index.js';

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

  public async getMethodAllowedProfiles(methodCall: MethodData): Promise<Set<string>> {
    const { subsystem, class: className, method } = methodCall;

    try {
      const profiles = await db.fetch(
        queries.method.getAllowedProfiles,
        allowedProfileSchema,
        [subsystem, className, method]
      );

      return new Set(profiles.map(p => p.profileName));
    } catch (err) {
      console.error(`Error getting allowed user profiles: ${err}`);
      throw err;
    }
  }

  public async getProfiles(): Promise<Set<string>> {
    try {
      const profiles = await db.fetch(
        queries.profile.getAll,
        profileSchema
      );

      return new Set(profiles.map(p => p.profileName));
    } catch (err) {
      console.error(`Error getting profiles: ${err}`);
      throw err;
    }
  }

  public async changeProfileName(profile: string, newName: string) {
    await db.execute(
      queries.profile.changeName, [profile, newName]
    ); 
  }

  public async getMethodProfileData(): Promise<MethodProfileData> {
    // Stores subsystems, classes, methods, and the methods' allowed profiles
    let profileData: MethodProfileData = {};

    try {
      const dbProfileData = await db.fetch(
        queries.method.getProfileData,
        profileDataSchema
      );

      dbProfileData.forEach(methodProfile => {
        const {
          subsystemName: subsystem,
          className,
          methodName: method,
          profileName: profile
        } = methodProfile;

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
    } catch (err) {
      console.error(`Error getting methods' allowed profiles: ${err}`);
      throw err;
    }

    return profileData;
  }

  public async addMethodProfile(subsystem: string, className: string, method: string, profile: string) {
    await db.execute(queries.method.addProfile, [subsystem, className, method, profile]);
  }

  public async removeMethodProfile(subsystem: string, className: string, method: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.method.removeProfile, [subsystem, className, method, profile]));
  }

  public async addMenuProfile(subsystem: string, menu: string, profile: string) {
    await db.execute(queries.menu.addProfile, [subsystem, menu, profile]);
  }

  public async removeMenuProfile(subsystem: string, menu: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.menu.removeProfile, [subsystem, menu, profile]));
  }

  public async addUser(email: string, passwd: string, name: string, surname: string) {
    const hashed_passwd = await argon2.hash(passwd);
    await db.execute(queries.user.add, [email, hashed_passwd, name, surname]);
  }

  public async getUserProfiles(email: string): Promise<Set<string>> {
    let profiles = await db.fetch(
      queries.user.getProfilesByEmail,
      profileSchema,
      [email]
    );

    return new Set(profiles.map(p => p.profileName));
  }

  public async addUserProfile(email: string, profile: string) {
    await db.execute(queries.user.addProfile, [email, profile]);
  }

  public async removeUserProfile(email: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.user.removeProfile, [email, profile]));
  }

  public async deleteProfile(profile: string): Promise<boolean> {
    try {
      let result: boolean;

      await db.beginTransaction();

      await db.execute(queries.profile.removeFromAllUsers, [profile]);
      await db.execute(queries.profile.removeFromAllMethods, [profile]);
      await db.execute(queries.profile.removeFromAllMenus, [profile]);
      result = !!(await db.execute(queries.profile.delete, [profile]));

      await db.commit();

      return result;
    } catch (err) {
      await db.rollback();
      throw err;
    }
  }
}

export const security = SecurityComponent.instance;