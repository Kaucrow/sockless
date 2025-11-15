import { db } from '@components/index.js';
import { queries } from '@const/constants.js';
import {
  subsystemIdSchema,
  classIdSchema,
  methodIdSchema,
  profileIdSchema
} from '@schemas/db/sync/sync.js';

type DbClient = any; 

class MethodPermissionService {
  static #instance: MethodPermissionService;

  public registeredPermissions = new Map<number, {
    subsystem: string;
    className: string;
    methodName: string;
    profiles: string[];
  }>();

  private constructor() { }

  public static get instance(): MethodPermissionService {
    if (!MethodPermissionService.#instance) {
      MethodPermissionService.#instance = new MethodPermissionService();
    }
    return MethodPermissionService.#instance;
  }

  public async registerAllMethods() {
    try {
      await db.withTransaction(async (txClient) => {
        // Clear all existing method-profile relationships and related data
        await this.clearAllPermissions(txClient);

        const subsystemMap = new Map<string, Set<string>>(); // subsystem -> classes

        // Fill the subsystem map
        for (const [tx, methodInfo] of this.registeredPermissions) {
          // Track subsystems and classes
          if (!subsystemMap.has(methodInfo.subsystem)) {
            subsystemMap.set(methodInfo.subsystem, new Set());
          }
          subsystemMap.get(methodInfo.subsystem)!.add(methodInfo.className);
        }

        const subsystemIdMap = new Map<string, string>(); // subsystemName -> subsystemId
        const classIdMap = new Map<string, string>(); // classKey ('subsystem.class') -> classId

        // Create subsystems and classes, storing their IDs
        for (const [subsystemName, classNames] of subsystemMap) {
          // Add subsystem, get ID, and store it
          const subsystemIdResult = await db.fetchOne(
            queries.sync.addSubsystemReturnId, 
            subsystemIdSchema,
            [subsystemName],
            txClient
          );
          if (!subsystemIdResult) {
            throw new Error(`Failed to insert subsystem: ${subsystemName}`);
          }
          const { subsystemId } = subsystemIdResult;
          subsystemIdMap.set(subsystemName, subsystemId);

          // For each class in the subsystem
          for (const className of classNames) {
            // Add class, get ID, and store it
            const classIdResult = await db.fetchOne(
              queries.sync.addClassReturnId, 
              classIdSchema,
              [subsystemId, className],
              txClient
            );
            if (!classIdResult) {
              throw new Error(`Failed to insert class: ${className}`);
            }
            const { classId } = classIdResult;
 
            // Store by a unique key
            const classKey = `${subsystemName}.${className}`;
            classIdMap.set(classKey, classId);
          }
        }

        // Process methods, profile links, and TXs
        for (const [tx, methodInfo] of this.registeredPermissions) {
          // Get classId from the classId map
          const classKey = `${methodInfo.subsystem}.${methodInfo.className}`;
          const classId = classIdMap.get(classKey);

          if (!classId) {
            throw new Error(`Failed to find classId in map for key: ${classKey}`);
          }
   
          const methodIdResult = await db.fetchOne(
            queries.sync.addMethodReturnId,
            methodIdSchema,
            [classId, methodInfo.methodName],
            txClient
          );
    
          if (!methodIdResult) {
            throw new Error(`Failed to find or create method: ${methodInfo.methodName}`);
          }
          const { methodId } = methodIdResult;

          // Add profile relationships for this method
          for (const profileName of methodInfo.profiles) {
            const profileResult = await db.fetchOne(queries.sync.getProfileId, profileIdSchema, [profileName], txClient);
            if (!profileResult) {
              throw new Error(`Profile not found in database: ${profileName}`);
            }
            const { profileId } = profileResult;

            // Link method to profile
            await db.execute(queries.sync.linkMethodProfile, [methodId, profileId], txClient);
          }
          
          // Add the method TX
          await db.execute(queries.sync.addTx, [
            tx,
            methodInfo.subsystem,
            methodInfo.className,
            methodInfo.methodName
          ], txClient);
        }
      });
    } catch (error) {
      console.error('Failed to register permissions:', error);
      throw error;
    }
  }

  private async clearAllPermissions(txClient: DbClient) {
    // Clear all relationships and base data (in correct order due to foreign keys)
    await db.execute(queries.sync.deleteMethodProfiles, [], txClient);
    await db.execute(queries.sync.deleteMenuProfiles, [], txClient);
    await db.execute(queries.sync.deleteMethods, [], txClient);
    await db.execute(queries.sync.deleteMenus, [], txClient);
    await db.execute(queries.sync.deleteClasses, [], txClient);
    await db.execute(queries.sync.deleteSubsystems, [], txClient);
    await db.execute(queries.sync.deleteTx, [], txClient);
  }
}

export const methodPermissionService = MethodPermissionService.instance;