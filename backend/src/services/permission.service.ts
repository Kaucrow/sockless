import { db } from '@components/index.js';
import { queries } from '@const/constants.js';
import {
  subsystemIdSchema,
  classIdSchema,
  methodIdSchema,
  profileIdSchema
} from '@schemas/db/sync/sync.js';

export class PermissionService {
  async registerAllPermissions(
    permissions: Array<{
      subsystem: string;
      className: string;
      methodName: string;
      profiles: string[];
    }>
  ): Promise<void> {
    try {
      // Start transaction
      db.withTransaction(async (txClient) => {
        // Clear all existing method-profile relationships and related data
        await this.clearAllPermissions(txClient);

        // Group permissions by subsystem and class to minimize DB operations
        const subsystemMap = new Map<string, Set<string>>(); // subsystem -> classes
        const classMap = new Map<string, Set<string>>(); // subsystem.class -> methods
        
        for (const permission of permissions) {
          const classKey = `${permission.subsystem}.${permission.className}`;
          
          // Track subsystems
          if (!subsystemMap.has(permission.subsystem)) {
            subsystemMap.set(permission.subsystem, new Set());
          }
          subsystemMap.get(permission.subsystem)!.add(permission.className);
 
          // Track classes and methods
          if (!classMap.has(classKey)) {
            classMap.set(classKey, new Set());
          }
          classMap.get(classKey)!.add(permission.methodName);
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
        for (const permission of permissions) {
          // Get class ID
          const { classId } = (await db.fetchOne(queries.sync.getClassId, classIdSchema, [
            permission.subsystem, 
            permission.className
          ], txClient))!;
  
          // Insert method
          await db.execute(queries.sync.addMethod, [classId, permission.methodName], txClient);

          // Get method ID
          const { methodId } = (await db.fetchOne(queries.sync.getMethodId, methodIdSchema, [
            classId, 
            permission.methodName
          ], txClient))!;

          // Insert profile relationships for this method
          for (const profileName of permission.profiles) {
            // Get profile ID
            const profileResult = await db.fetchOne(queries.sync.getProfileId, profileIdSchema, [profileName], txClient);
  
            if (!profileResult) throw new Error(`Profile not found in database: ${profileName}`);

            const { profileId } = profileResult;

            // Link method to profile
            await db.execute(queries.sync.linkMethodProfile, [methodId, profileId], txClient);
          }
        }

        // Also update the security.tx table
        for (const permission of permissions) {
          await db.execute(queries.sync.addTx, [
            permission.subsystem,
            permission.className, 
            permission.methodName
          ], txClient);
        }

        console.log(`Successfully registered ${permissions.length} permissions across ${subsystemMap.size} subsystems`);
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