import { validator, db } from "@components/index.js";
import { queries } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import {
  setEventReservationSchema,
  getEventReservationSchema,
} from "./requests.js";
import {
  reservationSchema
} from "@schemas/db/events/reservation.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import { inspect } from "util";
import type { Request } from "express";

@register('events')
export class Reservation {
  /**
   * @swagger
   * /to-process/setEventReservation:
   *  post:
   *    tags:
   *      - events
   *    summary: Set a reservation
   *    description: Sets an event's reservation.
   *    requestBody:
   *      description: Reservation's data.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number 
   *                description: Transaction number.
   *                example: 7
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event's ID.
   *                    example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                  locationId:
   *                    type: string
   *                    format: uuid
   *                    description: Location's ID.
   *                    example: "571da84b-95e8-49e6-b004-7a6d80bac285"
   *                  cost:
   *                    type: number
   *                    description: Reservation cost, with max 2 decimal places.
   *                    example: 420.67
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
  @allow(7, ["finance-admin"])
  async setEventReservation(req: Request, args: object) {
    const { eventId, locationId, cost } = validator.validate(args, setEventReservationSchema);

    const rowsAffected = await db.execute(queries.reservation.create, [eventId, locationId, cost]);
 
    if (!rowsAffected) {
      throw new ToProcessBadReqError(`Reservation already exists.`);
    }
  }

  /**
   * @swagger
   * /to-process/getEventReservation:
   *  post:
   *    tags:
   *      - events
   *    summary: Get an event's reservation
   *    description: Gets the data of an event's reservation.
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
   *                example: 8
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event's ID.
   *                    example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *            required:
   *              - tx
   *              - args
   *    responses:
   *      200:
   *        description: Success.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                cost:
   *                  type: number 
   *                  example: 420.67
   *                country:
   *                  type: string
   *                  example: "Uganda"
   *                city:
   *                  type: string
   *                  example: "Kampala"
   *                locationName:
   *                  type: string
   *                  example: "Da wae"
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
  @allow(8, ["event-admin"])
  async getEventReservation(req: Request, args: object) {
    const { eventId } = validator.validate(args, getEventReservationSchema);

    const reservation = await db.fetchOne(
      queries.reservation.getByEventId,
      reservationSchema,
      [eventId]
    );

    if (!reservation) {
      throw new ToProcessBadReqError(`Failed to find reservation with event ID: ${eventId}`);
    }

    return reservation;
  }
}