import { Router } from 'express';
import { config } from '@const/constants.js';
import { session } from '@components/session.js';
import { security } from '@components/security.js';
import { UNIQUE_VIOLATION_CODE } from '@global/database.js';
import { addUserSchema, removeUserProfileSchema } from './requests.js';

const router = Router();

/**
 * @swagger
 * /maintenance/add-user:
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
 *                  example: The email is already in use by an existing user
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/add-user', async(req, res) => {
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
    console.error(`Error adding new user: ${err}`);

    // Email already in use
    if (err && typeof err === 'object' && 'code' in err && err.code === UNIQUE_VIOLATION_CODE) {
      return res.status(400).json({ message: 'The email is already in use by an existing user.' });
    }

    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/add-user-profile:
 *  post:
 *    tags:
 *      - maintenance
 *    description: Adds a profile to a user.
 *    requestBody:
 *      description: User email & profile to add.
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
 *              profile:
 *                type: string
 *                description: Profile name.
 *                example: admin
 *          required:
 *            - email
 *            - profile
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
 *                  example: The email is already in use by an existing user
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/add-user-profile', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    let { email, passwd, name, surname } = addUserSchema.parse(req.body);
    await security.addUser(email, passwd, name, surname);
    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding new user: ${err}`);

    // Email already in use
    if (err && typeof err === 'object' && 'code' in err && err.code === UNIQUE_VIOLATION_CODE) {
      return res.status(400).json({ message: 'The email is already in use by an existing user.' });
    }

    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /maintenance/remove-user-profile:
 *  post:
 *    tags:
 *      - maintenance
 *    description: Removes a given profile from a user.
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
 *              profile:
 *                type: string
 *                description: Profile name.
 *                example: admin
 *          required:
 *            - email
 *            - profile
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: User is not logged in.
 *      403:
 *        description: User is not a maintenance admin.
 */
router.post('/remove-user-profile', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    let { email, profile } = removeUserProfileSchema.parse(req.body);
    await security.removeUserProfile(email, profile); 
    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding new user: ${err}`);

    // Email already in use
    if (err && typeof err === 'object' && 'code' in err && err.code === UNIQUE_VIOLATION_CODE) {
      return res.status(400).json({ message: 'The email is already in use by an existing user.' });
    }

    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;