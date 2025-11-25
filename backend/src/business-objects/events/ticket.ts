import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import {
  ticketDescSchema,
  ticketDescCreatedSchema,
} from "@schemas/db/events/ticket.js";
import {
  getEventTicketsSchema,
  createEventTicketsSchema,
} from "./requests.js";
import type { Request } from "express";

@register('finances')
export class Payment {
  /**
   * @swagger
   * /to-process/createEventTickets:
   *  post:
   *    tags:
   *      - events
   *    summary: Create event tickets
   *    description: Creates tickets for an event.
   *    requestBody:
   *      description: Event and ticket data.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 28
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.
   *                  name:
   *                    type: string
   *                    description: Ticket name.
   *                    example: "VIP"
   *                  description:
   *                    type: string
   *                    description: Ticket description (optional).
   *                    example: "Elatla class."
   *                  cost:
   *                    type: number
   *                    description: Ticket cost.
   *                    example: 420.67,
   *                  number:
   *                    type: number
   *                    description: Number of tickets to create.
   *                    example: 10
   *          required:
   *            - tx
   *            - args
   *    responses:
   *      200:
   *        description: Payment difference (ticket price - total paid).
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                difference:
   *                  type: number
   *                  description: Payment difference (ticket price - total paid).
   *                  example: 0.67 
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
  @allow(28, ["event-admin"])
  private async createEventTickets(req: Request, args: object) {
    const { eventId, name, description, cost, number } = validator.validate(
      args, createEventTicketsSchema
    );

    await db.withTransaction(async (txClient) => {
      const ticketDescCreated = await db.fetchOne(
        queries.ticketDesc.add,
        ticketDescCreatedSchema,
        [eventId, name, description, cost],
        txClient
      );

      if (!ticketDescCreated) {
        throw new Error("Failed to create ticket description.");
      }

      const { ticketDescId } = ticketDescCreated;

      const ticketsCreated = await db.execute(
        queries.ticket.addMany,
        [ticketDescId, number]
      );

      if (!ticketsCreated) {
        throw new Error("Failed to create tickets.");
      }
    });
  }

  /**
   * @swagger
   * /to-process/getEventTickets:
   *  post:
   *    tags:
   *      - events
   *    summary: Get event ticket categories
   *    description: Gets the event ticket categories for an event.
   *    requestBody:
   *      description: Event ID.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 28
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.
   *          required:
   *            - tx
   *            - args
   *    responses:
   *      200:
   *        description: Payment difference (ticket price - total paid).
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                type: object
   *                properties:
   *                  ticketDescId:
   *                    type: string
   *                    format: uuid
   *                    description: Ticket ID.
   *                  eventId:
   *                    type: string
   *                    format: uuid
   *                    description: Event ID.
   *                  name:
   *                    type: string
   *                    description: Ticket name.
   *                    example: "VIP"
   *                  description:
   *                    type: string
   *                    description: Ticket description.
   *                    example: "Elatla class."
   *                  cost:
   *                    type: number
   *                    description: Ticket cost.
   *                    example: 420.67
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
  @allow(29, ["event-admin"])
  private async getEventTickets(req: Request, args: object) {
    const { eventId } = validator.validate(args, getEventTicketsSchema);

    const tickets = db.fetch(
      queries.ticketDesc.getByEventId,
      ticketDescSchema,
      [eventId]
    );

    return tickets;
  }
}