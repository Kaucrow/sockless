import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import {
  createEventSchema,
  getEventSchema,
  updateEventSchema,
} from "./requests.js";
import {
  eventSchema,
} from "@schemas/db/events/index.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import type { Request } from "express";

@register('events')
export class Event {
  /**
   * @swagger
   * /to-process/createEvent:
   *  post:
   *    tags:
   *      - events
   *    summary: Create an event
   *    description: Creates a new event.
   *    requestBody:
   *      description: New event's data.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number 
   *                description: Transaction number.
   *                example: 1
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  name:
   *                    type: string
   *                    description: Event name.
   *                    example: "Neovim Conference"
   *                  startDt:
   *                    type: string
   *                    description: Event start datetime.
   *                    example: "2077-12-15T09:00:00Z"
   *                  endDt:
   *                    type: string
   *                    description: Event end datetime.
   *                    example: "2077-12-18T09:00:00Z"
   *                  description:
   *                    type: string
   *                    description: Event description.
   *                    example: "A free community conference on all things neovim."
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
  @allow(1, ["event-admin"])
  private async createEvent(req: Request, args: object) {
    const { name, startDt, endDt, description } = validator.validate(args, createEventSchema);

    await db.execute(queries.event.create, [name, startDt, endDt, description]);
  }

  /**
   * @swagger
   * /to-process/getAllEvents:
   *   post:
   *     tags:
   *       - events
   *     summary: Get all events
   *     description: Gets all events' data.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tx:
   *                 type: number 
   *                 description: Transaction number.
   *                 example: 2
   *               args:
   *                 type: object
   *                 description: Empty.
   *             required:
   *               - tx
   *               - args
   *     responses:
   *       200:
   *         description: Success.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   eventId:
   *                     type: string
   *                     format: uuid
   *                     example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                   name:
   *                     type: string
   *                     example: "Neovim Conference"
   *                   descTxt:
   *                     type: string
   *                     example: "A free community conference on all things neovim."
   *                   startDt:
   *                     type: string
   *                     format: date-time
   *                     example: "2077-12-15T09:00:00.000Z"
   *                   endDt:
   *                     type: string
   *                     format: date-time
   *                     example: "2077-12-18T09:00:00.000Z"
   *       403:
   *         description: User is not logged in or doesn't have permission to execute this method.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User is not allowed to perform this action."
   */
  @allow(2, ["event-admin"])
  private async getAllEvents(req: Request, args: object) {
    const events = await db.fetch(queries.event.getAll, eventSchema);

    return events;
  }

  /**
   * @swagger
   * /to-process/getEvent:
   *   post:
   *     tags:
   *       - events
   *     summary: Get an event's data
   *     description: Gets one event's data.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tx:
   *                 type: number 
   *                 description: Transaction number.
   *                 example: 3
   *               args:
   *                 type: object
   *                 description: Event ID.
   *                 properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.  
   *             required:
   *               - tx
   *               - args
   *     responses:
   *       200:
   *         description: Success.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                eventId:
   *                  type: string
   *                  format: uuid 
   *                  example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                name:
   *                  type: string
   *                  example: "Neovim Conference"
   *                descTxt:
   *                  type: string
   *                  example: "A free community conference on all things neovim."
   *                startDt:
   *                  type: string
   *                  format: date-time
   *                  example: "2077-12-15T09:00:00.000Z"
   *                endDt:
   *                  type: string
   *                  format: date-time
   *                  example: "2077-12-18T09:00:00.000Z"
   *       403:
   *         description: User is not logged in or doesn't have permission to execute this method.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User is not allowed to perform this action."
   */
  @allow(3, ["event-admin"])
  private async getEvent(req: Request, args: object) {
    const { eventId } = validator.validate(args, getEventSchema);

    const event = await db.fetchOne(queries.event.getEventById, eventSchema, [eventId]);

    return event;
  }

  /**
   * @swagger
   * /to-process/updateEvent:
   *   post:
   *     tags:
   *       - events
   *     summary: Update an event
   *     description: Updates an event's data.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tx:
   *                 type: number 
   *                 description: Transaction number.
   *                 example: 4
   *               args:
   *                 type: object
   *                 description: Event data.
   *                 properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.
   *                  name:
   *                    type: string
   *                    description: Event name.
   *                  description:
   *                    type: string
   *                    description: Event description.
   *                  startDt:
   *                    type: string
   *                    description: Event start date object.
   *                  endDt:
   *                    type: string
   *                    description: Event end date object.
   *             required:
   *               - tx
   *               - args
   *     responses:
   *       200:
   *         description: Success.
   *       403:
   *         description: User is not logged in or doesn't have permission to execute this method.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "User is not allowed to perform this action."
   */
  @allow(4, ["event-admin"])
  private async updateEvent(req: Request, args: object) {
    const { eventId, name, description, startDt, endDt } = validator.validate(
      args, updateEventSchema
    );

    const rowsAffected = await db.execute(
      queries.event.update,
      [eventId, name, description, startDt, endDt]
    );

    if (!rowsAffected) {
      throw new ToProcessBadReqError(`Failed to find an event with ID: '${eventId}'`);
    }
  }
}