import { Router } from 'express';
import type { MethodProfileData, Profiles } from './responses.js';
import { config } from '@const/constants.js';
import { session } from '@components/session.js';
import { security } from '@components/security.js';
import { addMethodProfileSchema } from './requests.js';

const router = Router();

/**
 * @swagger
 * /maintenance/profiles/method-data:
 *  get:
 *    tags:
 *      - maintenance
 *    description: Returns the allowed profiles for every method.
 *    responses:
 *      200:
 *        description: Method profile data object. Contains the profiles that have permission to execute each method from each class from each subsystem.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example:
 *                users:
 *                  permissions:
 *                    assign:
 *                      - admin
 *                  management:
 *                    delete:
 *                      - admin
 *                    update:
 *                      - admin
 *                      - moderator
 *                reports:
 *                  general:
 *                    generate:
 *                      - user
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.get('profiles/method-data', async (req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    // If the user is a maintenance admin, return the method profile data
    const profileData: MethodProfileData = await security.getMethodProfileData();
    return res.status(200).json(profileData);
  } catch (err) {
    console.error(`Error getting profile data: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/profiles:
 *  get:
 *    tags:
 *      - maintenance
 *    description: Returns the available profiles.
 *    responses:
 *      200:
 *        description: Available profiles.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example:
 *                - admin
 *                - moderator
 *                - user
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.get('/profiles', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profiles: Profiles = await security.getProfiles();
    return res.status(200).json(profiles);
  } catch(err) {
    console.error(`Error getting profiles: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/profiles/{profileName}:
 *  put:
 *    tags:
 *      - maintenance
 *    description: Changes a given profile's name.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The current name of the profile to be changed.
 *          example: admin
 *    requestBody:
 *      description: New profile name.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newName:
 *                type: string
 *                description: New profile name.
 *                example: manager 
 *          required:
 *            - newName
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.put('/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profileName = req.params.profileName;
    const profiles: Profiles = await security.getProfiles();
    return res.status(200).json(profiles);
  } catch(err) {
    console.error(`Error getting profiles: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

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

    let profile = req.params.profileName;

    if (!profile) return res.status(400).json({ message: 'Missing profile name in URL.' });

    let { subsystem, class: className, method } = addMethodProfileSchema.parse(req.body);
    await security.addMethodProfile(subsystem, className, method, profile);
    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/profiles/{profileName}:
 *  delete:
 *    tags:
 *      - maintenance
 *    description: Deletes a given profile.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to delete.
 *          example: admin
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.delete('/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    let profile = req.params.profileName;
    await security.deleteProfile(profile);
    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;