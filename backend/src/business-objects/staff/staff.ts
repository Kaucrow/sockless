import { dispatcher, validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import type { GetUserResponse } from "@bo/users/responses.js";
import {
  staffInEventSchema
} from "@schemas/db/people/staff.js";
import {
  addStaffSchema,
  addStaffToEventSchema,
  getAllStaffInEventSchema,
} from "./requests.js";
import type { Request } from "express";

@register('staff')
export class Staff {
  /**
   * @swagger
   * /to-process/addStaff:
   *  post:
   *    tags:
   *      - staff 
   *    summary: Add a staff user
   *    description: Registers a new staff user.
   *    requestBody:
   *      description: User's email, phone number, and address.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 17
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  email:
   *                    type: string
   *                    description: User's email.
   *                    example: "user1@example.com"
   *                  phoneNumber:
   *                    type: string
   *                    description: User's phone number.
   *                  address:
   *                    type: string
   *                    description: User's address.
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
  @allow(17, ["event-admin"])
  private async addStaff(req: Request, args: object) {
    const { email, phoneNumber, address } = validator.validate(args, addStaffSchema);

    const { userId } = await dispatcher.executeMethod<GetUserResponse>(req, 11, { email });

    await db.execute(queries.staff.add, [userId, phoneNumber, address]);
  }

  /**
   * @swagger
   * /to-process/addStaffToEvent:
   *  post:
   *    tags:
   *      - staff 
   *    summary: Add a staff user to an event
   *    description: Registers a new staff user.
   *    requestBody:
   *      description: User's email, phone number, and address.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 20
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  email:
   *                    type: string
   *                    description: User's email.
   *                    example: "user1@example.com"
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.
   *                  staffRoleId:
   *                    type: string
   *                    format: uuid
   *                    description: Staff role ID.
   *                  cost:
   *                    type: number
   *                    description: Staff cost amount.
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
  @allow(20, ["event-admin"])
  private async addStaffToEvent(req: Request, args: object) {
    const { email, eventId, staffRoleId, cost} = validator.validate(args, addStaffToEventSchema);

    const { userId } = await dispatcher.executeMethod<GetUserResponse>(req, 11, { email });

    const rowsAffected = await db.execute(queries.staff.addToEvent, [userId, eventId, staffRoleId, cost]);

    if (!rowsAffected) {
      throw new ToProcessBadReqError("The staff user with the selected role already exists in this event.");
    }
  }

  /**
   * @swagger
   * /to-process/getAllStaffInEvent:
   *  post:
   *    tags:
   *      - staff
   *    summary: Get all staff in an event
   *    description: Gets the data of every staff member in an event.
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
   *                example: 21
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.
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
   *                  staffId:
   *                    type: string
   *                    format: uuid
   *                    example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    example: "394d007b-9e70-416d-ad26-787fc77a7904"
   *                  cost:
   *                    type: number
   *                    example: 420.67
   *                  roleId:
   *                    type: string
   *                    format: uuid
   *                    example: "ae4c13b9-52a5-47ec-a9c8-80167f78f420"
   *                  roleName:
   *                    type: string
   *                    example: "PA technician"
   *                  roleDescription:
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
  @allow(21, ["event-admin"])
  private async getAllStaffInEvent(req: Request, args: object) {
    const { eventId } = validator.validate(args, getAllStaffInEventSchema);

    const staff = await db.fetch(
      queries.staff.getAllInEvent,
      staffInEventSchema,
      [eventId]
    );

    return staff;
  }
}