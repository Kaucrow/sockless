import { Router } from 'express';
import type { MethodProfileData } from './responses.js';
import { config } from '@const/constants.js';
import { session } from '@components/session.js';
import { security } from '@components/security.js';

const router = Router();

// Get method profile data endpoint
router.get('/get-method-profile-data', async (req, res) => {
  try {
    const sessionData = await session.get(req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (!sessionData) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!sessionData.profiles.includes(config.maintenance.adminProfile))
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    // If the user is a maintenance admin, return the method profile data
    const profileData: MethodProfileData = await security.getMethodProfileData();
    return res.status(200).json(profileData);
  } catch (err) {
    console.error(`Error getting profile data: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;