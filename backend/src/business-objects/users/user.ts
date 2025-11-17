import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import { getUserSchema } from "./requests.js";
import { userSchema } from "@schemas/db/index.js";
import type { Request } from "express";

@register('users')
export class User {
  /**
   * @swagger
   * /to-process/getUser:
   *  post:
   *    tags:
   *      - users
   *    summary: Get a user's data
   *    description: Gets a user's data.
   *    requestBody:
   *      description: User's email.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number 
   *                description: Transaction number.
   *                example: 11
   *              args:
   *                type: object
   *                description: User's email.
   *                properties:
   *                  email:
   *                    type: string
   *                    description: User's email.
   *                    example: "user1@example.com"
   *          required:
   *            - tx
   *            - args
   *    responses:
   *      200:
   *        description: Success.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                userId:
   *                  type: string
   *                  format: uuid
   *                  example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                name:
   *                  type: string
   *                  example: "Maya"
   *                surname:
   *                  type: string
   *                  example: "Fey"
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
  @allow(11, ["event-admin"])
  private async getUser(req: Request, args: object) {
    const { email } = validator.validate(args, getUserSchema);

    const user = await db.fetchOne(queries.user.getUserByEmail, userSchema, [email]);

    if (!user) {
      throw new ToProcessBadReqError(`Failed to find a user with email '${email}'`);
    }

    return {
      userId: user.userId,
      name: user.name,
      surname: user.surname,
    }
  }
}