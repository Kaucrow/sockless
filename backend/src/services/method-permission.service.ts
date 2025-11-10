import { db } from '@components/index.js';
import { queries } from '@const/constants.js';
import {
  subsystemIdSchema,
  classIdSchema,
  methodIdSchema,
  profileIdSchema
} from '@schemas/db/sync/sync.js';

class MethodPermissionService {
  static #instance: MethodPermissionService;

  public registeredPermissions = new Map<number, {
    subsystem: string;
    className: string;
    methodName: string;
    profiles: string[];
  }>();

  private constructor() {}

  public static get instance(): MethodPermissionService {
    if (!MethodPermissionService.#instance) {
      MethodPermissionService.#instance = new MethodPermissionService();
    }
    return MethodPermissionService.#instance;
  }

  public async registerAllMethods() {
    try {
      // Start transaction
      db.withTransaction(async (txClient) => {
        // Clear all existing method-profile relationships and related data
        await this.clearAllPermissions(txClient);

        // Group permissions by subsystem and class to minimize DB operations
        const subsystemMap = new Map<string, Set<string>>(); // subsystem -> classes
        const classMap = new Map<string, Set<string>>(); // subsystem.class -> methods
        const txMap = new Map<number, { subsystem: string; className: string; methodName: string }>(); // tx -> method info
 
        // Process the Map structure
        for (const [tx, methodInfo] of this.registeredPermissions) {
          const classKey = `${methodInfo.subsystem}.${methodInfo.className}`;

          // Track subsystems
          if (!subsystemMap.has(methodInfo.subsystem)) {
            subsystemMap.set(methodInfo.subsystem, new Set());
          }
          subsystemMap.get(methodInfo.subsystem)!.add(methodInfo.className);

          // Track classes and methods
          if (!classMap.has(classKey)) {
            classMap.set(classKey, new Set());
          }
          classMap.get(classKey)!.add(methodInfo.methodName);

          // Track tx mappings
          if (txMap.has(tx)) {
            throw new Error(`Duplicate transaction ID found: ${tx}. Each tx must be unique.`);
          }
          txMap.set(tx, {
            subsystem: methodInfo.subsystem,
            className: methodInfo.className,
            methodName: methodInfo.methodName
          });
        }

        // Insert subsystems
        for (const [subsystemName] of subsystemMap) {
          await db.execute(queries.sync.addSubsystem, [subsystemName], txClient);
        }

        // Insert classes
        for (const [classKey, methods] of classMap) {
          const [subsystemName, className] = classKey.split('.');
          const { subsystemId } = (await db.fetchOne(queries.sync.getSubsystemId, subsystemIdSchema, [subsystemName], txClient))!;
 
          await db.execute(queries.sync.addClass, [subsystemId, className], txClient);
        }

        // Insert methods and their profile relationships
        for (const [tx, methodInfo] of this.registeredPermissions) {
          // Get class ID
          const { classId } = (await db.fetchOne(queries.sync.getClassId, classIdSchema, [
            methodInfo.subsystem,
            methodInfo.className
          ], txClient))!;

          // Insert method
          await db.execute(queries.sync.addMethod, [classId, methodInfo.methodName], txClient);

          // Get method ID
          const { methodId } = (await db.fetchOne(queries.sync.getMethodId, methodIdSchema, [
            classId, 
            methodInfo.methodName
          ], txClient))!;

          // Insert profile relationships for this method
          for (const profileName of methodInfo.profiles) {
            // Get profile ID
            const profileResult = await db.fetchOne(queries.sync.getProfileId, profileIdSchema, [profileName], txClient);

            if (!profileResult) throw new Error(`Profile not found in database: ${profileName}`);

            const { profileId } = profileResult;

            // Link method to profile
            await db.execute(queries.sync.linkMethodProfile, [methodId, profileId], txClient);
          }
        }

        // Update the security.tx table with transaction IDs
        for (const [tx, methodInfo] of txMap) {
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

  private async clearAllPermissions(txClient: any): Promise<void> {
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