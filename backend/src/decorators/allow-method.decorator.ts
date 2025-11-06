// decorators/allow.decorator.ts
import { PermissionService } from '@services/permission.service.js';
import path from 'path';

const registeredPermissions: Array<{
  subsystem: string;
  className: string;
  methodName: string;
  profiles: string[];
}> = [];

export function register(subsystem: string) {
  return (constructor: Function) => {
    for (const propertyKey of Object.getOwnPropertyNames(constructor.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        propertyKey
      );

      if (
        descriptor &&
        typeof descriptor.value === 'function' &&
        propertyKey !== 'constructor'
      ) {
        console.log(`Registering class with method ${propertyKey}`);
      }
    }
  }
}

export function allow(profiles: string[]) {
  return function (target: any, context: ClassMethodDecoratorContext) {
    const className = context.name as string;
    const subsystem = getSubsystemFromModule(target);
    const methodName = context.name as string;

    registeredPermissions.push({
      subsystem,
      className,
      methodName,
      profiles
    });

    return function (this: any, ...args: any[]) {
      return target.call(this, ...args);
    };
  };
}

function getSubsystemFromModule(target: any): string {
  try {
    const modulePath = getModulePath(target);
 
    if (modulePath) {
      const normalizedPath = path.normalize(modulePath);
      const pathParts = normalizedPath.split(path.sep);
 
      // For structure: subsystem/file.ts
      // The subsystem is the immediate parent folder of the file
      const fileNameIndex = pathParts.findIndex(part => 
        part.endsWith('.ts') || part.endsWith('.js')
      );
 
      if (fileNameIndex > 0) {
        // The subsystem is the folder containing the file
        const subsystem = pathParts[fileNameIndex - 1];
        if (subsystem) {
          return subsystem;
        }
      }
    }
  } catch (error) {
    console.warn('Could not determine subsystem from module path:', error);
  }
  
  return 'default';
}

// Helper to get module path
function getModulePath(target: any): string | null {
  try {
    if (require && require.cache) {
      // Find the module that exports this class
      for (const [moduleId, module] of Object.entries(require.cache)) {
        if (!module || !module.exports) continue;
 
        // Check if this module exports the target class
        if (module.exports === target.constructor || 
            module.exports?.default === target.constructor) {
          return moduleId;
        }
 
        // Check named exports
        if (typeof module.exports === 'object') {
          for (const exportName in module.exports) {
            if (module.exports[exportName] === target.constructor) {
              return moduleId;
            }
          }
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function registerAllPermissions(): Promise<void> {
  const permissionService = new PermissionService();
 
  await permissionService.registerAllPermissions(registeredPermissions);
 
  console.log(`Registered ${registeredPermissions.length} permissions`);
}