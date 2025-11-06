import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { CreateEventSchema } from "./schemas.js";
import { register, allow } from "@decorators/allow-method.decorator.js";

@register('events')
export class Event {
  /**
   * @swagger
   * /to-process:
   *  post:
   *    tags:
   *      - events
   *    summary: Create event
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
  @allow(["event-admin"])
  private async createEvent(args: object) {
    const { name, startDt, endDt, description } = validator.validate(args, CreateEventSchema);

    await db.execute(queries.event.create, [name, startDt, endDt, description]);
  }
}