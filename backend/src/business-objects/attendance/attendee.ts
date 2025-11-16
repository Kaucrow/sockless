import { dispatcher, validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import type { GetUserResponse } from "@bo/users/responses.js";
import {
  registerAttendeeSchema,
} from "./requests.js";
import type { Request } from "express";

@register('attendance')
export class Attendee {
  /**
   * @swagger
   * /to-process/registerAttendee:
   *  post:
   *    tags:
   *      - attendance
   *    summary: Register an event's attendee
   *    description: Registers a user as an event's attendee.
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
   *                example: 12
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
  @allow(12, ["event-admin"])
  private async registerAttendee(req: Request, args: object) {
    const { email, eventId } = validator.validate(args, registerAttendeeSchema);

    const { userId } = await dispatcher.executeMethod<GetUserResponse>(req, 11, { email });

    await db.execute(queries.attendee.add, [userId, eventId]);
  }
}