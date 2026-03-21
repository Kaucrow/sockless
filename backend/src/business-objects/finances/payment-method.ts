import { validator, db } from "@components/index.js";
import { queries } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import {
  paymentMethodSchema,
} from "@schemas/db/finances/payment-method.js";
import {
  addPaymentMethodSchema,
} from "./requests.js";
import type { Request } from "express";

@register('finances')
export class PaymentMethod {
  /**
   * @swagger
   * /to-process/getPaymentMethods:
   *  post:
   *    tags:
   *      - finances
   *    summary: Get all payment methods
   *    description: Gets the data of every payment method.
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 25
   *              args:
   *                type: object
   *                description: Empty.
   *          required:
   *            - tx
   *            - args
   *    responses:
   *      200:
   *        description: Success.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                type: object
   *                properties:
   *                  paymentMethodId:
   *                    type: string
   *                    format: uuid
   *                    example: "394d007b-9e70-416d-ad26-787fc77a7904"
   *                  name:
   *                    type: string
   *                    format: uuid
   *                    example: "Credit card"
   *      400:
   *        description: Invalid args.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  example: "Property 'name': Invalid input: expected string, received undefined"
   *      403:
   *        description: User is not logged in or doesn't have permission to execute this method.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  example: "User is not allowed to perform this action."
   */
  @allow(25, 'public', ["event-admin"])
  async getPaymentMethods(req: Request, args: object) {
    const paymentMethods = await db.fetch(queries.paymentMethod.getAll, paymentMethodSchema);

    return paymentMethods;
  }

  /**
   * @swagger
   * /to-process/addPaymentMethod:
   *  post:
   *    tags:
   *      - finances 
   *    summary: Add payment method
   *    description: Adds a new payment method.
   *    requestBody:
   *      description: Payment method name.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 26
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  name:
   *                    type: string
   *                    description: Payment method name.
   *                    example: "Hugs"
   *          required:
   *            - tx
   *            - args
   *    responses:
   *      200:
   *        description: Success.
   *      400:
   *        description: Invalid args.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  example: "Property 'name': Invalid input: expected string, received undefined"
   *      403:
   *        description: User is not logged in or doesn't have permission to execute this method.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *                  example: "User is not allowed to perform this action."
   */
  @allow(26, 'public', ["event-admin"])
  async addPaymentMethod(req: Request, args: object) {
    const { name } = validator.validate(args, addPaymentMethodSchema);

    const rowsAffected = await db.execute(queries.paymentMethod.add, [name]);

    if (!rowsAffected) {
      throw new ToProcessBadReqError("Failed to add new payment method.");
    }
  }
}