import { validator, db } from "@components/index.js";
import { queries } from "@global/constants.js";
import { register, allow } from "@decorators/allow-method.decorator.js";
import { ToProcessBadReqError } from "@errors/to-process.js";
import {
  costCategorySchema
} from "@schemas/db/finances/cost-category.js";
import {
  addCostCategorySchema,
  updateCostCategorySchema,
} from "./requests.js";
import type { Request } from "express";

@register('finances')
export class CostCategory {
  /**
   * @swagger
   * /to-process/getCostCategories:
   *  post:
   *    tags:
   *      - finances 
   *    summary: Get all cost categories
   *    description: Gets the data of every cost category.
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
   *                example: 22
   *              args:
   *                type: object
   *                description: Empty.
   *          required:
   *            - tx
   *            - args
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
   *                  costCategoryId:
   *                    type: string
   *                    format: uuid
   *                    example: "394d007b-9e70-416d-ad26-787fc77a7904"
   *                  name:
   *                    type: string
   *                    format: uuid
   *                    example: "Lights"
   *                  description:
   *                    type: string
   *                    format: uuid
   *                    example: "Stage lighting equipment"
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
  @allow(22, 'public', ["event-admin"])
  async getCostCategories(req: Request, args: object) {
    const costCategories = await db.fetch(queries.costCategory.getAll, costCategorySchema);

    return costCategories;
  }

  /**
   * @swagger
   * /to-process/addCostCategory:
   *  post:
   *    tags:
   *      - finances 
   *    summary: Add cost category
   *    description: Adds a new cost category.
   *    requestBody:
   *      description: Cost category name & description.
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              tx:
   *                type: number
   *                description: Transaction number.
   *                example: 23
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  name:
   *                    type: string
   *                    description: Cost category name.
   *                    example: "user1@example.com"
   *                  description:
   *                    type: string
   *                    description: Cost category description (optional).
   *                  address:
   *                    type: string
   *                    description: User's address.
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
  @allow(23, 'public', ["event-admin"])
  async addCostCategory(req: Request, args: object) {
    const { name, description } = validator.validate(args, addCostCategorySchema);

    await db.execute(queries.costCategory.add, [name, description]);
  }

  /**
   * @swagger
   * /to-process/updateCostCategory:
   *  post:
   *    tags:
   *      - finances
   *    summary: Update a cost category
   *    description: Updates the data of a cost category record.
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
   *                example: 24
   *              args:
   *                type: object
   *                description: Method's arguments.
   *                properties:
   *                  costCategoryId:
   *                    type: string
   *                    format: uuid
   *                    description: Cost category ID.
   *                  name:
   *                    type: string
   *                    description: Cost category name.
   *                  description:
   *                    type: string
   *                    description: Cost category description (optional).
   *            required:
   *              - tx
   *              - args
   *    responses:
   *      200:
   *        description: Success.
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
  @allow(24, 'public', ["event-admin"])
  async updateCostCategory(req: Request, args: object) {
    const { costCategoryId, name, description } = validator.validate(args, updateCostCategorySchema);

    const rowsAffected = await db.execute(
      queries.costCategory.update,
      [costCategoryId, name, description]
    );

    if (!rowsAffected) {
      throw new ToProcessBadReqError("Failed to find cost category.");
    }
  }
}