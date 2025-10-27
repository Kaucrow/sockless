import { Router } from 'express';
import { queries } from '@const/constants.js';
import { userSchema } from '@schemas/db/index.js';
import { security, db } from '@components/index.js';
import { addUserSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from './requests.js';

const router = Router();

/**
 * @swagger
 * /auth/forgot-password:
 *  post:
 *    tags:
 *      - auth
 *    description: Password recovery endpoint. Sends a verification email to the user in order to perform the password recovery.
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
 *                example: user2@example.com 
 *          required:
 *            - email
 *    responses:
 *      200:
 *        description: Success.
 *      401:
 *        description: No user was found with this email.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: No user was found with this email.
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  try {
    // Get user
    const user = await db.fetchOne(queries.user.getUserByEmail, userSchema, [email]);

    // If the user doesn't exist, respond HTTP 403 Forbidden
    if (!user) {
      return res.status(403).json({ message: 'No user was found with this email.' });
    }

    await security.beginUserPasswordRecovery(email);

    return res.status(200).send();
  } catch (err) {
    console.error(`User password recovery error: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

/**
 * @swagger
 * /auth/forgot-password/reset:
 *  put:
 *    tags:
 *      - auth
 *    description: Resets a user's password using the token from /auth/forgot-password.
 *    requestBody:
 *      description: Email verification token and new password.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *                description: Verification token.
 *              passwd:
 *                type: string
 *                description: New password.
 *          required:
 *            - token
 *            - passwd
 *    responses:
 *      200:
 *        description: Success.
 *      403:
 *        description: Failed to perform the password reset.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Failed to perform the password reset.
 */
router.put('/forgot-password/reset', async (req, res) => {
  const { token, passwd } = resetPasswordSchema.parse(req.body);

  try {
    await security.resetUserPassword(token, passwd);
    return res.status(200).send(); 
  } catch (err) {
    console.error(`Failed to perform the password reset: ${err}`);
    return res.status(403).json({ message: 'Failed to perform the password reset.' });
  }
});

export default router;