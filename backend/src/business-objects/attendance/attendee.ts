import { dispatcher, validator, db } from "@components/index.js";
import { queries } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import type { GetUserResponse } from "@bo/users/responses.js";
import {
  userAttendanceSchema
} from "@schemas/db/people/attendance.js";
import {
  registerAttendeeSchema,
  getUserAttendancesSchema,
  checkInAttendeeSchema,
} from "./requests.js";
import type { Request } from "express";

@register('attendance')
export class Attendee {
  /**
   * @swagger
   * /to-process/getUserAttendances:
   *  post:
   *    tags:
   *      - attendance
   *    summary: Get a user's attendances 
   *    description: Gets the data of every event attendance for a user.
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
   *                example: 13
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  email:
   *                    type: string
   *                    description: User's email.
   *                    example: "user1@example.com"
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
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                  attended:
   *                    type: boolean
   *                    example: false
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
  @allow(13, ["event-admin"])
  private async getUserAttendances(req: Request, args: object) {
    const { email } = validator.validate(args, getUserAttendancesSchema);

    const { userId } = await dispatcher.executeMethod<GetUserResponse>(req, 11, { email });

    const attendances = await db.fetch(
      queries.attendee.getAttendances,
      userAttendanceSchema,
      [userId]
    );

    return attendances;
  }

  /**
   * @swagger
   * /to-process/checkInAttendee:
   *  post:
   *    tags:
   *      - attendance
   *    summary: Check in an attendee
   *    description: Marks an attendee as "attended" for a given event.
   *    requestBody:
   *      description: User's email & event ID.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 14
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
  @allow(14, ["event-admin"])
  private async checkInAttendee(req: Request, args: object) {
    const { email, eventId } = validator.validate(args, checkInAttendeeSchema);

    const { userId } = await dispatcher.executeMethod<GetUserResponse>(req, 11, { email });

    const rowsAffected = await db.execute(queries.attendee.checkIn, [userId, eventId]);

    if (!rowsAffected) {
      throw new ToProcessBadReqError("Failed to check in attendee.");
    }
  }
}