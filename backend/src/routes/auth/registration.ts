import { Router } from 'express';
import { queries } from '@const/constants.js';
import { userSchema } from '@schemas/db/index.js';
import { security, db } from '@components/index.js';
import { addUserSchema, verifyEmailSchema } from './requests.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *  post:
 *    tags:
 *      - auth
 *    description: User registration endpoint. Sends a verification email to the user in order to perform its registration.
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
 */
router.post('/register', async (req, res) => {
  const { email, passwd, name, surname } = addUserSchema.parse(req.body);

  try {
    // Get user
    const user = await db.fetchOne(queries.user.getUserByEmail, userSchema, [email]);

    // If the user already exists, respond HTTP 400 Bad Request 
    if (user) {
      return res.status(400).json({ message: 'The email is already in use by an existing user.' });
    }

    await security.beginUserRegistration(email, passwd, name, surname);

    return res.status(200).send();
  } catch (err) {
    console.error(`User registration error: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /auth/register/verify-email:
 *  post:
 *    tags:
 *      - auth
 *    description: Verify a user's email to complete its registration. Adds the user to DB if the verification succeeds.
 *    requestBody:
 *      description: Email verification token.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *                description: Verification token.
 *          required:
 *            - token 
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Failed to perform the registration email verification.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Failed to perform the registration email verification.
 */
router.post('/register/verify-email', async (req, res) => {
  const { token } = verifyEmailSchema.parse(req.body);

  try {
    await security.registerUser(token);
    return res.status(200).send(); 
  } catch (err) {
    console.error(`Failed to verify registration email: ${err}`);
    return res.status(403).json({ message: 'Failed to perform the registration email verification.' });
  }
});

export default router;