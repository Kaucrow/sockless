import { Router } from 'express';
import { dbPool } from '@global/database.js';
import { queries } from '@const/constants.js';
import { userSchema, profileSchema } from '@schemas/db/security.js';
import { objectToCamel } from 'ts-case-convert';
import { session } from '@components/session.js';
import type { UUID } from '@/types/global.js';

const router = Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user
    const userResult = await dbPool.query(queries.user.getUserByEmail, [email]);

    // If user doesn't exist, respond HTTP 401 Forbidden
    if (!userResult.rowCount) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = objectToCamel(userSchema.parse(userResult.rows[0]));

    // Validate password
    const match = (user.passwd === password);   // TODO: Replace with hashing

    // If password is invalid, respond HTTP 401 Forbidden
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Get profiles
    const profilesResult = await dbPool.query(queries.user.getProfiles, [user.userId]);

    let profiles: UUID[] = [];
    profilesResult.rows.forEach(row => {
      profiles.push(objectToCamel(profileSchema.parse(row)).profileId);
    });

    // Create session and respond HTTP 200 OK
    session.create(req, res, user.userId, profiles);

    return res.status(200).json({ message: 'Login successful.' });
  } catch (err) {
    console.error(`Login error: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

// Logout endpoint
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