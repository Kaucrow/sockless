import { queries } from "@global/constants.js";
import { methodDataSchema } from "@schemas/db/index.js";
import { MethodExecutionError } from "@errors/dispatcher.js";
import type { Request } from "express";
import { security, db, logger } from "@components/index.js";
import { pascalToKebab } from "@global/utils.js";
import { toPascal } from "ts-case-convert";

type BusinessObjectInstance = any;

class DispatcherComponent {
  static #instance: DispatcherComponent;
  private readonly classRegistry: Map<string, BusinessObjectInstance> = new Map();

  private constructor() {}

  public static get instance(): DispatcherComponent {
    if (!DispatcherComponent.#instance) {
      DispatcherComponent.#instance = new DispatcherComponent();
    }
    return DispatcherComponent.#instance;
  }

  public async executeMethod<T>(
    req: Request,
    tx: number,
    args: object
  ): Promise<T> {
    // Get the method call object from the TX number
    const methodCall = await db.fetchOne(
      queries.tx.getMethodCall,
      methodDataSchema,
      [tx]
    );

    // If there's no matching TX number in DB, throw an error
    if (!methodCall) throw new MethodExecutionError('TxNotFound');

    // Check if the user has permission to execute the method
    const hasMethodPermission = await security.hasMethodPermission(req, methodCall!);

    // If they don't, throw an error
    if (!hasMethodPermission) throw new MethodExecutionError('PermissionDenied');

    const { subsystem, class: className, method } = methodCall;

    // Get the class instance
    let instance = await this.getOrCreateInstance(subsystem, className);

    const methodRef = instance[`${method}`];

    // If the method ref is of type function, execute it.
    // Otherwise, throw an error
    if (typeof methodRef === 'function') {
      const result = await methodRef.call(instance, req, args);
      return result;
    } else {
      const targetClassName = toPascal(className);
      throw new Error(`Method ${method} not found on class ${targetClassName}`);
    }
  }

  private async getOrCreateInstance(subsystem: string, className: string): Promise<BusinessObjectInstance> {
    const key = `${subsystem}_${className}`;

    // If the class registry already has the required instance, return it
    if (this.classRegistry.has(key)) {
      return this.classRegistry.get(key);
    }

    try {
      // Get the module.
      // The module should have the same name as the target class, except the
      // module should be written in snake case and the target class should
      // be written in pascal case
      const modulePath = `@/business-objects/${subsystem}/${pascalToKebab(className)}.js`;
      const module = await import(modulePath);

      // Get the class
      const targetClassName = toPascal(className);
      const TargetClass: BusinessObjectInstance = module[targetClassName as keyof typeof module];

      // Class not found in module
      if (!TargetClass) {
        throw new Error(`Class ${targetClassName} not found in module ${className}`);
      };

      // Instantiate the class
      const instance = new TargetClass();

      // Add the instance to the class registry and return it
      this.classRegistry.set(key, instance);

      return instance;
    } catch (err) {
      // Catch dynamic import errors
      if (err instanceof Error && (err as any).code === 'MODULE_NOT_FOUND') {
        logger.error(`Module not found at ${subsystem}/${className}. Returning null.`);
        return null
      }

      // Re-throw any other unexpected errors
      throw err;
    }
  }
}

export const dispatcher = DispatcherComponent.instance;