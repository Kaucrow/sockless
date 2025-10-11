import { Router } from 'express';
import argon2 from 'argon2';
import { queries } from '@const/constants.js';
import { userSchema } from '@schemas/db/index.js';
import { objectToCamel } from 'ts-case-convert';
import { session, security, db } from '@components/index.js';

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
    // Get user
    const userResult = await db.fetchOne(queries.user.getUserByEmail, userSchema, [email]);

    // If user doesn't exist, respond HTTP 401 Forbidden
    if (!userResult) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = objectToCamel(userResult);

    // Validate password
    const match = await argon2.verify(user.passwd, password);

    // If password is invalid, respond HTTP 401 Forbidden
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Get profiles
    const profiles = await security.getUserProfiles(user.email);

    // Create session
    let token = await session.create(req, res, user.userId, profiles);

    if (token) {
      return res.status(200).json({ token: token });
    } else {
      return res.status(200).json({ message: 'Logged in successfully.'});
    }
  } catch (err) {
    console.error(`Login error: ${err}`);
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