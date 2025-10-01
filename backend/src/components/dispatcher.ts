import { dbPool } from "@global/database.js";
import { queries } from "@const/constants.js";
import { methodCallSchema } from "@schemas/db/security.js";
import { toProcessSchema } from "@schemas/dispatcher.js";
import type { Request } from "express";
import type { MethodCall } from "@/types/security.js";
import { security } from "@components/security.js";

type ExecutionResult = 'Executed' | 'MethodNotFound' | 'PermissionDenied';

class DispatcherComponent {
  static #instance: DispatcherComponent;

  private constructor() {}

  public static get instance(): DispatcherComponent {
    if (!DispatcherComponent.#instance) {
      DispatcherComponent.#instance = new DispatcherComponent();
    }
    return DispatcherComponent.#instance;
  }

  public async executeMethod(req: Request): Promise<ExecutionResult> {
    const { tx } = toProcessSchema.parse(req.body);

    let methodCall: MethodCall | null = null;

    // Get the method call object from the TX number
    const methodCallResult = await dbPool.query(queries.tx.getMethodCall, [tx]);

    // If there's no matching TX number in DB, throw an error
    if (!methodCallResult.rowCount) return 'MethodNotFound';

    methodCall = methodCallSchema.parse(methodCallResult.rows[0]);

    // Check if the user has permission to execute the method
    const hasMethodPermission = await security.hasMethodPermission(req, methodCall!);

    // If they don't, throw an error
    if (!hasMethodPermission) return 'PermissionDenied';

    console.log(`TODO: Execute ${methodCall.subsystem} ${methodCall.class} ${methodCall.method}`);

    return 'Executed';
  }
}

export const dispatcher = DispatcherComponent.instance;