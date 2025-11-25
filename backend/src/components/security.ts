import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import {
  generateKeys as generatePasetoKeys,
  sign as pasetoSign,
  verify as pasetoVerify,
} from 'paseto-ts/v4';
import {
  session,
  db,
  mailer,
  logger
} from '@components/index.js';
import { queries } from '@global/constants.js';
import type {
  MethodProfileData,
  MenuProfileData,
  ActiveRegistrations,
  ActivePasswordRecoveries,
  MethodData,
  EmailVerificationTokenPayload,
} from '@/types/security.js';
import {
  methodProfileDataSchema,
  menuProfileDataSchema,
  profileSchema,
  userSchema,
} from '@schemas/db/index.js';
import { allowedProfileSchema } from '@schemas/db/index.js';
import { UserNotFoundError } from '@errors/generic.js';

class SecurityComponent {
  static #instance: SecurityComponent;

  private activeRegistrations: ActiveRegistrations = new Map();

  private activePasswordRecoveries: ActivePasswordRecoveries = new Map();

  private pasetoKeys: {
    secret: string,
    public: string
  };

  private constructor() {
    const { secretKey, publicKey } = generatePasetoKeys('public');
    this.pasetoKeys = {
      secret: secretKey,
      public: publicKey
    };
  }

  public static get instance(): SecurityComponent {
    if (!SecurityComponent.#instance) {
      SecurityComponent.#instance = new SecurityComponent();
    }
    return SecurityComponent.#instance;
  }

  /* --- Method execution --- */

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
      logger.error(`Error getting allowed user profiles: ${err}`);
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
      logger.error(`Error getting profiles: ${err}`);
      throw err;
    }
  }

  /* --- Maintenance --- */

  public async changeProfileName(profile: string, newName: string): Promise<boolean> {
    return !!(await db.execute(queries.profile.changeName, [profile, newName])); 
  }

  public async getMethodProfileData(): Promise<MethodProfileData> {
    // Stores subsystems, classes, methods, and the methods' allowed profiles
    let profileData: MethodProfileData = {};

    try {
      const dbProfileData = await db.fetch(
        queries.method.getProfileData,
        methodProfileDataSchema
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
        
        // Ensure the method's array exists, or create it
        if (!profileData[subsystem][className][method]) {
          profileData[subsystem][className][method] = [];
        }

        // If the profile is not null, add it to the Set
        if (profile) profileData[subsystem][className][method].push(profile);
      });
    } catch (err) {
      logger.error(`Error getting methods' allowed profiles: ${err}`);
      throw err;
    }

    return profileData;
  }

  public async addMethodProfile(subsystem: string, className: string, method: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.method.addProfile, [subsystem, className, method, profile]));
  }

  public async removeMethodProfile(subsystem: string, className: string, method: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.method.removeProfile, [subsystem, className, method, profile]));
  }

  public async getMenuProfileData(): Promise<MenuProfileData> {
    // Stores subsystems, menus, and the menus' allowed profiles
    let profileData: MenuProfileData = {};

    try {
      const dbProfileData = await db.fetch(
        queries.menu.getProfileData,
        menuProfileDataSchema
      );

      dbProfileData.forEach(methodProfile => {
        const {
          subsystemName: subsystem,
          menuName: menu,
          profileName: profile
        } = methodProfile;

        // Ensure the subsystem object exists, or create it
        if (!profileData[subsystem]) {
          profileData[subsystem] = {};
        }

        // Ensure the menu's array exists, or create it
        if (!profileData[subsystem][menu]) {
          profileData[subsystem][menu] = [];
        }

        // If the profile is not null, add it to the Set
        if (profile) profileData[subsystem][menu].push(profile);
      });
    } catch (err) {
      logger.error(`Error getting menus' allowed profiles: ${err}`);
      throw err;
    }

    return profileData;
  }

  public async addMenuProfile(subsystem: string, menu: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.menu.addProfile, [subsystem, menu, profile]));
  }

  public async removeMenuProfile(subsystem: string, menu: string, profile: string): Promise<boolean> {
    return !!(await db.execute(queries.menu.removeProfile, [subsystem, menu, profile]));
  }

  public async addUser(email: string, passwd: string, name: string, surname: string) {
    try {
      const hashedPasswd = await argon2.hash(passwd);
      await db.withTransaction(async (txClient) => {
        await db.execute(queries.user.add, [email, hashedPasswd, name, surname], txClient);
        await db.execute(queries.user.addProfile, [email, "user"], txClient);
      });
    } catch (err) {
      throw err;
    }
  }

  public async getUserProfiles(email: string): Promise<Set<string>> {
    // Verify the user existence
    let user = await db.fetchOne(
      queries.user.getUserByEmail,
      userSchema,
      [email]
    );

    // If no user is found with the submitted email, throw an error
    if (!user) throw new UserNotFoundError();

    // If the user exists, get its profiles
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
      const result = await db.withTransaction(async (txClient) => {
        await db.execute(queries.profile.removeFromAllUsers, [profile], txClient);
        await db.execute(queries.profile.removeFromAllMethods, [profile], txClient);
        await db.execute(queries.profile.removeFromAllMenus, [profile], txClient);
        return !!(await db.execute(queries.profile.delete, [profile]), txClient);
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  /* --- User auth --- */

  public async beginUserRegistration(email: string, passwd: string, name: string, surname: string) {
    // Generate a random UUID for the registration ID
    const id = randomUUID();

    // Add the registration to the active registrations map
    this.activeRegistrations.set(id, { email, passwd, name, surname });

    const payload: EmailVerificationTokenPayload = { id };

    try {
      // Generate the token containing the registration ID
      // and send the verification email
      const verificationToken = pasetoSign(this.pasetoKeys.secret, payload);
      await mailer.sendRegistrationVerificationEmail(email, verificationToken);
    } catch (err) {
      throw err;
    }
  }

  public async registerUser(verificationToken: string) {
    try {
      const { payload: { id }}: { payload: EmailVerificationTokenPayload } = pasetoVerify(
        this.pasetoKeys.public, verificationToken
      );

      const user = this.activeRegistrations.get(id);

      if (!user) {
        throw new Error('User active registration could not be found.');
      }

      const { email, passwd, name, surname } = user;

      await this.addUser(email, passwd, name,surname);

      this.activeRegistrations.delete(id);
    } catch (err) {
      throw err;
    }
  }

  public async beginUserPasswordRecovery(email: string) {
    // Generate a random UUID for the password recovery ID
    const id = randomUUID();

    // Add the password recovery to the active password recoveries map
    this.activePasswordRecoveries.set(id, email);

    const payload: EmailVerificationTokenPayload = { id };

    try {
      // Generate the token containing the password recovery ID
      // and send the verification email
      const verificationToken = pasetoSign(this.pasetoKeys.secret, payload);
      await mailer.sendForgotPasswordVerificationEmail(email, verificationToken);
    } catch (err) {
      throw err;
    }
  }

  public async resetUserPassword(verificationToken: string, passwd: string) {
    try {
      const { payload: { id }}: { payload: EmailVerificationTokenPayload } = pasetoVerify(
        this.pasetoKeys.public, verificationToken
      );

      const email = this.activePasswordRecoveries.get(id);

      if (!email) {
        throw new Error('User active password recovery could not be found.');
      }

      const hashedPasswd = await argon2.hash(passwd);
      await db.execute(queries.user.changePassword, [email, hashedPasswd]);

      this.activePasswordRecoveries.delete(id);
    } catch (err) {
      throw err;
    }
  }
}

export const security = SecurityComponent.instance;