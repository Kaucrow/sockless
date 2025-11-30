import { validator, db, logger } from "@components/index.js";
import { queries, UPLOAD_DIR } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { flyerSchema } from "@schemas/db/events/flyer.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import {
  addEventFlyerSchema,
  getEventFlyerSchema,
} from "./requests.js";
import path from "path";
import fs from 'fs';
import crypto from 'crypto';
import type { Request } from "express";

@register('events')
export class Flyer {
  /**
   * @swagger
   * /to-process-img/setEventFlyer:
   *  post:
   *    tags:
   *      - events
   *    summary: Add or update event flyer
   *    description: >
   *      Uploads a flyer image for a specific event.
   *      If a flyer already exists for the event it will be overwritten.
   *    requestBody:
   *      description: Event ID and image file.
   *      required: true
   *      content:
   *        multipart/form-data:
   *          schema:
   *            type: object
   *            properties:
   *              imageFile:
   *                type: string
   *                format: binary
   *                description: The flyer image file to upload. 
   *              tx:
   *                type: string
   *                description: Transaction number.
   *                example: 9
   *              args:
   *                type: string
   *                description: >
   *                  Method's arguments, as a stringified JSON.
   *                  Must include the 'eventId'.
   *          required:
   *            - imageFile
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
  @allow(9, 'public', ["event-admin"])
  async setEventFlyer(req: Request, args: object) {
    const { imageFile, eventId } = validator.validate(args, addEventFlyerSchema);

    const ext = path.extname(imageFile.originalname);

    const newFilename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const savePath = path.join(UPLOAD_DIR, newFilename);

    await db.execute(queries.flyer.addEventFlyer, [eventId, newFilename]);

    fs.writeFile(savePath, imageFile.buffer, () => {});

    logger.debug(`File '${newFilename} saved to '${UPLOAD_DIR}'.`);
  }

  /**
   * @swagger
   * /to-process/getEventFlyer:
   *  post:
   *    tags:
   *      - events
   *    summary: Get an event's flyer
   *    description: Gets one event's flyer.
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
   *                example: 10
   *              args:
   *                type: object
   *                description: Event ID.
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
   *        description: Success.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *               url:
   *                 type: string
   *                 example: "ed1db90c93f4c0fa8e1afb84cb037eb9.png"
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
  @allow(10, 'public', ["event-admin"])
  async getEventFlyer(req: Request, args: object) {
    const { eventId } = validator.validate(args, getEventFlyerSchema);

    const flyer = await db.fetchOne(queries.flyer.getEventFlyer, flyerSchema, [eventId]);

    if (!flyer) {
      throw new ToProcessBadReqError(`Event with ID '${eventId}' doesn't exist or has no flyer.`);
    }

    return flyer;
  }
}