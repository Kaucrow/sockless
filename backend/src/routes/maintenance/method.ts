import { Router } from 'express';
import { config } from '@const/constants.js';
import { session } from '@components/session.js';
import { security } from '@components/security.js';
import { addMethodProfileSchema, removeMethodProfileSchema } from './requests.js';

const router = Router();

/**
 * @swagger
 * /maintenance/method/profiles/{profileName}:
 *  post:
 *    tags:
 *      - maintenance
 *    description: Allows a profile to execute a given method.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to add execution permission to.
 *          example: admin
 *    requestBody:
 *      description: Method data.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              subsystem:
 *                type: string
 *                description: Subsystem name.
 *                example: users 
 *              class:
 *                type: string
 *                description: Class name.
 *                example: permissions
 *              method:
 *                type: string
 *                description: Method name.
 *                example: assign
 *          required:
 *            - subsystem
 *            - class
 *            - method
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/method/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profile = req.params.profileName;

    if (!profile) return res.status(400).json({ message: 'Missing profile name in URL.' });

    const { subsystem, class: className, method } = addMethodProfileSchema.parse(req.body);
    await security.addMethodProfile(subsystem, className, method, profile);
    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/method/profiles/{profileName}:
 *  delete:
 *    tags:
 *      - maintenance
 *    description: Revokes permission to execute a given method from a profile.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to revoke permission from.
 *          example: admin
 *    requestBody:
 *      description: Method data.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              subsystem:
 *                type: string
 *                description: Subsystem name.
 *                example: users 
 *              class:
 *                type: string
 *                description: Class name.
 *                example: permissions
 *              method:
 *                type: string
 *                description: Method name.
 *                example: assign
 *          required:
 *            - subsystem
 *            - class
 *            - method
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.delete('/method/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profile = req.params.profileName;

    if (!profile) return res.status(400).json({ message: 'Missing profile name in URL.' });

    const { subsystem, class: className, method } = removeMethodProfileSchema.parse(req.body);
    const removed = await security.removeMethodProfile(subsystem, className, method, profile);

    if (!removed) {
      return res.status(400).json({ message: 'No record was found with this data.' });
    }

    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;