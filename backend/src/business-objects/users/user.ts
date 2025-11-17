import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import {
  userSchema,
  userShortSchema,
} from "@schemas/db/index.js";
import {
  getOneUserSchema,
  getManyUsersSchema,
} from "./requests.js";
import type { Request } from "express";

@register('users')
export class User {
  /**
   * @swagger
   * /to-process/getOneUser:
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
   *                description: Method's arguments.
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
  private async getOneUser(req: Request, args: object) {
    const { email } = validator.validate(args, getOneUserSchema);

    const user = await db.fetchOne(queries.user.getUserByEmail, userSchema, [email]);

    if (!user) {
      throw new ToProcessBadReqError('Failed to find user.');
    }

    return {
      userId: user.userId,
      name: user.name,
      surname: user.surname,
    }
  }

  /**
   * @swagger
   * /to-process/getManyUsers:
   *  post:
   *    tags:
   *      - users
   *    summary: Gets multiple users' data
   *    description: Gets multiple users' data.
   *    requestBody:
   *      description: Users' email.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number 
   *                description: Transaction number.
   *                example: 16
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  emails:
   *                    type: array
   *                    items:
   *                      type: string 
   *                      description: User's email.
   *                      example: "user1@example.com"
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
  @allow(16, ["event-admin"])
  private async getManyUsers(req: Request, args: object) {
    const { emails } = validator.validate(args, getManyUsersSchema);

    const users = await db.fetch(queries.user.getManyUsersByEmail, userShortSchema, [emails]);

    if (users.length !== emails.length) {
      throw new ToProcessBadReqError('Failed to find all users.');
    }

    return users;
  }
}