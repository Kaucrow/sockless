import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import {
  eventAttendanceSchema
} from "@schemas/db/people/attendance.js";
import {
  getEventAttendancesSchema
} from "./requests.js";
import type { Request } from "express";

@register('reports')
export class Attendance {
  /**
   * @swagger
   * /to-process/getEventAttendances:
   *  post:
   *    tags:
   *      - reports
   *    summary: Get event's attendances
   *    description: Gets the attendance data for an event.
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
   *                example: 15
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event's ID.
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
   *                  userId:
   *                    type: string
   *                    format: uuid
   *                    example: 
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
  @allow(15, ["event-admin"])
  private async getEventAttendances(req: Request, args: object) {
    const { eventId } = validator.validate(args, getEventAttendancesSchema);

    const attendances = await db.fetch(
      queries.attendee.getAttendances,
      eventAttendanceSchema,
      [eventId]
    );

    return attendances;
  }
}