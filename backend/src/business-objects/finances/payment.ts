import { dispatcher, session, validator, db, logger } from "@components/index.js";
import { queries } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import {
  ticketSchema,
  ticketPaidVerificationSchema,
} from "@schemas/db/events/ticket.js";
import {
  userPayForTicketSchema,
} from "./requests.js";
import type { Request } from "express";

@register('finances')
export class Payment {
  /**
   * @swagger
   * /to-process/userPayForTicket:
   *  post:
   *    tags:
   *      - finances
   *    summary: Pay for a ticket (user)
   *    description: Allows the user to pay for a ticket.
   *    requestBody:
   *      description: Payment amount.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 27
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  ticketDescId:
   *                    type: string
   *                    format: uuid
   *                    description: Ticket description ID.
   *                  payments:
   *                    type: array 
   *                    description: Payments.
   *                    items:
   *                      type: object
   *                      properties:
   *                        paymentMethod:
   *                          type: string
   *                          format: uuid
   *                          description: Payment method ID.
   *                        amount:
   *                          type: number
   *                          description: Payment amount.
   *                          example: 420.67
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
  @allow(27, ["event-admin"])
  private async userPayForTicket(req: Request, args: object) {
    const { ticketDescId, payments } = validator.validate(args, userPayForTicketSchema);

    const { userId } = (await session.get(req))!;

    let difference: number | null = null;

    await db.withTransaction(async (txClient) => {
      const availableTicket = await db.fetchOne(
        queries.ticket.claimAvailable,
        ticketSchema,
        [userId, ticketDescId],
        txClient
      );

      if (!availableTicket) {
        throw new ToProcessBadReqError("No available tickets.");
      }

      const { ticketId } = availableTicket;

      for (const payment of payments) {
        await db.execute(
          queries.payment.add,
          [userId, ticketId, payment.paymentMethod, payment.amount],
          txClient
        );
      }

      const paidVerification = await db.fetchOne(
        queries.ticket.verifyPaid,
        ticketPaidVerificationSchema,
        [ticketId],
        txClient
      );

      if (!paidVerification) {
        throw new Error("Failed to get ticket paid verification.");
      }

      if (!paidVerification.paid) {
        throw new ToProcessBadReqError(
          `Payments' total amount do not cover the ticket price. Remaining: ${paidVerification.difference}`
        );
      }

      difference = paidVerification.difference;
    });

    if (difference === null) {
      throw new Error("Payment succedeed but difference is null");
    }

    return {
      difference: difference
    };
  }
}