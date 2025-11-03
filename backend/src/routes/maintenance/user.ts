import { Router } from 'express';
import { config } from '@const/constants.js';
import { session, security } from '@components/index.js';
import { DbConflictError, DbNotNullViolationError } from '@errors/index.js';
import {
  addUserProfileSchema,
  addUserSchema,
  getUserProfilesSchema,
  removeUserProfileSchema
} from './requests.js';
import { UserNotFoundError } from '@errors/generic.js';

const router = Router();

/**
 * @swagger
 * /maintenance/user:
 *  post:
 *    tags:
 *      - maintenance
 *    description: Adds a new user to the database.
 *    requestBody:
 *      description: New user's data.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: User email.
 *                example: user2@example.com 
 *              passwd:
 *                type: string
 *                description: User password.
 *                example: 321terces
 *              name:
 *                type: string
 *                description: User name.
 *                example: John
 *              surname:
 *                type: string
 *                description: User surname.
 *                example: Doe 
 *          required:
 *            - email
 *            - passwd
 *            - name
 *            - surname
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: The email is already in use by an existing user.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: The email is already in use by an existing user.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/user', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const { email, passwd, name, surname } = addUserSchema.parse(req.body);

    await security.addUser(email, passwd, name, surname);

    return res.status(200).send();
  } catch (err) {
    logger.error(`Error adding new user: ${err}`);

    // Email already in use
    if (err instanceof DbConflictError) {
      return res.status(400).json({ message: 'The email is already in use by an existing user.' });
    }

    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/user/profiles:
 *  get:
 *    tags:
 *      - maintenance
 *    description: Gets a given user's profiles.
 *    parameters:
 *      - in: query
 *        name: email
 *        required: true
 *        schema:
 *          type: string
 *          example: user1@example.com
 *    responses:
 *      200:
 *        description: Success.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              example:
 *                - admin
 *                - moderator
 *      400:
 *        description: No user was found with this email.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.get('/user/profiles', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const { email } = getUserProfilesSchema.parse(req.query);

    const profiles = await security.getUserProfiles(email);

    return res.status(200).json([...profiles]);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return res.status(400).json({ message: 'No user was found with this email.' });
    }

    logger.error(`Error getting user profiles: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/user/profiles/{profileName}:
 *  post:
 *    tags:
 *      - maintenance
 *    description: Adds a profile to a user.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to add.
 *          example: admin
 *    requestBody:
 *      description: User email.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: User email.
 *                example: user1@example.com 
 *          required:
 *            - email
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: No user and/or profile was found with this data.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/user/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profile = req.params.profileName;
    const { email } = addUserProfileSchema.parse(req.body);

    await security.addUserProfile(email, profile);
    
    return res.status(200).send();
  } catch (err) {
    logger.error(`Error adding profile to user: ${err}`);

    if (err instanceof DbNotNullViolationError) {
      return res.status(400).json({ message: 'No user and/or profile was found with this data.' });
    }

    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/user/profiles/{profileName}:
 *  delete:
 *    tags:
 *      - maintenance
 *    description: Removes a given profile from a user.
 *    parameters:
 *      - in: path
 *        name: profileName
 *        schema:
 *          type: string
 *          required: true
 *          description: The name of the profile to add.
 *          example: admin
 *    requestBody:
 *      description: User email & profile to remove.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: User email.
 *                example: user1@example.com 
 *          required:
 *            - email
 *    responses:
 *      200:
 *        description: Success.
 *      400:
 *        description: No user-profile relation was found with this data.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.delete('/user/profiles/:profileName', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    const profile = req.params.profileName;
    const { email } = removeUserProfileSchema.parse(req.body);

    const removed = await security.removeUserProfile(email, profile);

    if (!removed) {
      return res.status(400).json({ message: 'No user-profile relation was found with this data.' });
    }

    return res.status(200).send();
  } catch (err) {
    logger.error(`Error removing profile from user: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;