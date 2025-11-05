import { Router } from 'express';
import argon2 from 'argon2';
import { queries } from '@const/constants.js';
import { userSchema } from '@schemas/db/index.js';
import { session, security, db, logger } from '@components/index.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *  post:
 *    tags:
 *      - auth
 *    description: Login endpoint. Creates a user session on success.
 *    requestBody:
 *      description: User's login data.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: The user's email.
 *                example: user1@example.com
 *              password:
 *                type: string
 *                description: The user's password.
 *                example: hashed_password_1
 *          required:
 *            - email
 *            - password 
 *    responses:
 *      200:
 *        description: Success.
 *        headers:
 *          Set-Cookie:
 *            description: The PASETO session token.
 *            schema:
 *              type: string
 *              example: v4.public.eyJkYXRhIjogInRoaXMgaXMgYSBzaWduZWQg...
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  example: v4.public.eyJkYXRhIjogInRoaXMgaXMgYSBzaWduZWQg...
 *      401:
 *        description: Invalid username and/or password.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get the user
    const user = await db.fetchOne(queries.user.getUserByEmail, userSchema, [email]);

    // If the user doesn't exist, respond HTTP 401 Forbidden
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const match = await argon2.verify(user.passwd, password);

    // If the password is invalid, respond HTTP 401 Forbidden
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Get the profiles
    const profiles = await security.getUserProfiles(user.email);

    // Create the session
    let token = await session.create(req, res, user.userId, profiles);

    if (token) {
      return res.status(200).json({ token: token });
    } else {
      return res.status(200).json({ message: 'Logged in successfully.'});
    }
  } catch (err) {
    logger.error(`Login error: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *  post:
 *    tags:
 *      - auth
 *    description: Logout endpoint. Destroys the user session if it exists.
 *    responses:
 *      200:
 *        description: Success.
 *      500:
 *        description: Server error or session doesn't exist.
 */
router.post('/logout', async (req, res) => {
  try {
    await session.destroy(req, res);
    // Logout succeeded
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    // Logout failed
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;