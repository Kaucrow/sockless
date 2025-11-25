import { validator, db } from "@components/index.js";
import { queries } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import { createRoleSchema } from "./requests.js";
import { staffRoleSchema } from "@schemas/db/people/staff.js";
import type { Request } from "express";

@register('staff')
export class Roles {
  /**
   * @swagger
   * /to-process/getRoles:
   *  post:
   *    tags:
   *      - staff
   *    summary: Get available staff roles
   *    description: Gets all available staff roles.
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
   *                example: 18
   *              args:
   *                type: object
   *                description: Empty.
   *            required:
   *              - tx
   *              - args
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
   *                  staffRoleId:
   *                    type: string
   *                    format: uuid
   *                    example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                  name:
   *                    type: string 
   *                    example: "PA technician"
   *                  desc_txt:
   *                    type: string
   *                    example: "Staff responsible for setting up, operating, and troubleshooting sound equipment for live events."
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
  @allow(18, ["event-admin"])
  private async getRoles(req: Request, args: object) {
    const roles = await db.fetch(
      queries.staff.getRoles,
      staffRoleSchema,
    );

    return roles;
  }

  /**
   * @swagger
   * /to-process/createRole:
   *  post:
   *    tags:
   *      - staff 
   *    summary: Create a staff role 
   *    description: Creates a new staff role.
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
   *                example: 19
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  name:
   *                    type: string
   *                    description: Role name.
   *                    example: "PA technician"
   *                  description:
   *                    type: string
   *                    description: Role description.
   *                    example: "Staff responsible for setting up, operating, and troubleshooting sound equipment for live events."
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
  @allow(19, ["event-admin"])
  private async createRole(req: Request, args: object) {
    const { name, description } = validator.validate(args, createRoleSchema);

    const rowsAffected = await db.execute(queries.staff.createRole, [name, description]);

    if (!rowsAffected) {
      throw new ToProcessBadReqError("A staff role with this name already exists.");
    }
  }
}