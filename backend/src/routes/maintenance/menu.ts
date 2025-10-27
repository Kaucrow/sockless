import { Router } from 'express';
import { config } from '@const/constants.js';
import { session } from '@components/session.js';
import { security } from '@components/security.js';
import { addMenuProfileSchema, removeMenuProfileSchema } from './requests.js';

const router = Router();

/**
 * @swagger
 * /maintenance/menu/profiles/{profileName}:
 *  post:
 *    tags:
 *      - maintenance
 *    description: Allows a profile to access a given menu.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to add menu permission to.
 *          example: admin
 *    requestBody:
 *      description: Menu data.
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
 *              menu:
 *                type: string
 *                description: Menu name.
 *                example: User Management
 *          required:
 *            - subsystem
 *            - menu
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: Failed to find a menu and/or profile with this data.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/menu/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profile = req.params.profileName;

    if (!profile) return res.status(400).json({ message: 'Missing profile name in URL.' });

    const { subsystem, menu } = addMenuProfileSchema.parse(req.body);

    const added = await security.addMenuProfile(subsystem, menu, profile);

    if (!added) {
      return res.status(400).json({ message: 'Failed to find a menu and/or profile with this data.' })
    }

    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/menu/profiles/{profileName}:
 *  delete:
 *    tags:
 *      - maintenance
 *    description: Revokes access to a given menu from a profile.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to revoke the menu access from.
 *          example: admin
 *    requestBody:
 *      description: Menu data.
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
 *              menu:
 *                type: string
 *                description: Menu name.
 *                example: User Management
 *          required:
 *            - subsystem
 *            - menu
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: The menu-profile relation was not found.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.delete('/menu/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profile = req.params.profileName;

    if (!profile) return res.status(400).json({ message: 'Missing profile name in URL.' });

    const { subsystem, menu } = addMenuProfileSchema.parse(req.body);
    const removed = await security.removeMenuProfile(subsystem, menu, profile);

    if (!removed) {
      return res.status(400).json({ message: 'No menu-profile relation was found with this data.' });
    }

    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;