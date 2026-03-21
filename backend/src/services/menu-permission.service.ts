import { db } from '@components/index.js';
import { queries } from '@global/constants.js';
import { menus } from '@global/constants.js';

import {
  subsystemIdSchema,
  menuIdSchema,
  profileIdSchema
} from '@schemas/db/sync/sync.js';

class MenuPermissionService {
  static #instance: MenuPermissionService;

  private constructor() {}

  public static get instance(): MenuPermissionService {
    if (!MenuPermissionService.#instance) {
      MenuPermissionService.#instance = new MenuPermissionService();
    }
    return MenuPermissionService.#instance;
  }

  public async registerAllMenus() {
    try {
      await db.withTransaction(async (txClient) => {
        // The menu object's keys are the subsystem names
        for (const subsystem of Object.keys(menus)) {
          // Get the subsystem's ID or throw an error if it doesn't exist
          const subsystemResult = await db.fetchOne(queries.sync.getSubsystemId, subsystemIdSchema, [subsystem], txClient);
          if (!subsystemResult) {
            throw new Error(`Failed to find subsystem: ${subsystem}`);
          }
          const { subsystemId } = subsystemResult;

          // Process all menus for this subsystem
          const menuItems = menus[subsystem]!;
          for (const menu of menuItems) {
            const menuName = menu.name;

            // Add the menu and get its ID
            const menuIdResult = await db.fetchOne(
              queries.sync.addMenuReturnId,
              menuIdSchema,
              [subsystemId, menuName],
              txClient
            );
            if (!menuIdResult) {
              throw new Error(`Failed to insert menu: ${menuName} in subsystem: ${subsystem}`);
            }
            const { menuId } = menuIdResult;

            // Link all required profiles to this menu
            for (const profileName of menu.profiles) {
              // Get profile ID
              const profileRow = await db.fetchOne(queries.sync.getProfileId, profileIdSchema, [profileName], txClient);
              if (!profileRow) {
                throw new Error(`Profile not found in database: ${profileName}`);
              }
              const { profileId } = profileRow;

              // Link menu to profile
              await db.execute(queries.sync.linkMenuProfile, [menuId, profileId], txClient);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to register menus:', error);
      throw error;
    }
  }
}

export const menuPermissionService = MenuPermissionService.instance;