import { validator, db } from "@components/index.js";
import { queries } from "@const/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import {
  createLocationSchema,
} from "./schemas.js";
import {
  locationSchema,
} from "@schemas/db/events/index.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import { inspect } from "util";

@register('events')
export class Location {
  /**
   * @swagger
   * /to-process/createLocation:
   *   post:
   *     tags:
   *       - events
   *     summary: Create location
   *     description: Creates a new location.
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
   *                 example: 5
   *               args:
   *                 type: object
   *                 description: Event data.
   *                 properties:
   *                  country:
   *                    type: string
   *                    description: Country name.
   *                    example: "Uganda"
   *                  city:
   *                    type: string
   *                    description: City name.
   *                    example: "Kampala"
   *                  name:
   *                    type: string
   *                    description: Location name.
   *                    example: "Da wae"
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
  @allow(5, ["finance-admin"])
  private async createLocation(args: object) {
    const { country, city, name } = validator.validate(
      args, createLocationSchema
    );

    const rowsAffected = await db.execute(
      queries.location.create,
      [country, city, name]
    );

    if (!rowsAffected) {
      throw new ToProcessBadReqError(`Location with: ${inspect(args)} already exists`);
    }
  }

  /**
   * @swagger
   * /to-process/getAllLocations:
   *   post:
   *     tags:
   *       - events
   *     summary: Get all locations 
   *     description: Gets all locations' data.
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
   *                 example: 6
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
   *                   locationId:
   *                     type: string
   *                     format: uuid
   *                     example: "4de5dca6-fca4-45fa-9539-cfe652c40a0a"
   *                   country:
   *                     type: string
   *                     example: "Uganda"
   *                   city:
   *                     type: string
   *                     example: "Kampala"
   *                   name:
   *                     type: string
   *                     example: "Da wae"
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
  @allow(6, ["finance-admin"])
  private async getAllLocations(args: object) {
    const locations = await db.fetch(queries.location.getAll, locationSchema);

    return locations;
  }
}