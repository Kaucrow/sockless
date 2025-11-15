import { methodPermissionService } from '@services/method-permission.service.js';

export function register(subsystem: string) {
  return function ClassDecorator<C extends new (...args: any[]) => any>(
    target: C,
    context: ClassDecoratorContext,
  ) {
    const className = context.name!.toString();

    // Process metadata to register permissions
    for (const methodName in context.metadata) {
      if (Object.prototype.hasOwnProperty.call(context.metadata, methodName)) {
        const metadata = context.metadata[methodName] as { tx: number; profiles: string[] };
 
        if (metadata && metadata.tx && metadata.profiles) {
          const { tx, profiles } = metadata;

          // Check if tx already exists
          let methodInfo = methodPermissionService.registeredPermissions.get(tx);
          if (methodInfo) {
            // The decorator may be executed twice due to the class being imported statically and dynamically.
            // If the tx isn't related to the exact same method, throw an error
            if (!(
              subsystem === methodInfo.subsystem &&
              className === methodInfo.className &&
              methodName === methodInfo.methodName
            )) {
              throw new Error(`Transaction ID ${tx} is already registered. Each tx must be unique.`);
            } else {
              return;
            }
          }

          methodPermissionService.registeredPermissions.set(tx, {
            subsystem,
            className,
            methodName,
            profiles
          });
        }
      }
    }
  };
}

export function allow(tx: number, profiles: string[]) {
  return function (originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);
 
    // Store both tx and profiles in metadata
    context.metadata[methodName] = { tx, profiles };
  };
}