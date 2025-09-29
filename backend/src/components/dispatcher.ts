import { dbPool } from "@global/database.js";
import { queries } from "@const/constants.js";
import { methodCallSchema } from "@schemas/db/security.js";
import { toProcessSchema } from "@schemas/dispatcher.js";
import type { Request } from "express";
import type { MethodCall } from "@/types/security.js";
import { security } from "@components/security.js";

class DispatcherComponent {
  static #instance: DispatcherComponent;

  private constructor() {}

  public static get instance(): DispatcherComponent {
    if (!DispatcherComponent.#instance) {
      DispatcherComponent.#instance = new DispatcherComponent();
    }
    return DispatcherComponent.#instance;
  }

  public async executeMethod(req: Request) {
    const { tx } = toProcessSchema.parse(req.body);

    let methodCall: MethodCall | null = null;

    dbPool.query(queries.tx.getMethodCall, [tx], (err, results) => {
      if (err) throw err;

      if (!results.rowCount) throw new Error(`Method with tx '${tx}' not found in DB`);

      methodCall = methodCallSchema.parse(results.rows[0]);
    });

    const hasMethodPermission = await security.hasMethodPermission(req, methodCall!);

    if (!hasMethodPermission) throw new Error(`User is not allowed to execute method ${methodCall}`);

    console.log(`TODO: Execute ${methodCall}`);
  }
}

export const dispatcher = DispatcherComponent.instance;