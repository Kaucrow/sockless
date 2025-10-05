import { Router } from 'express';
import type { MethodProfileData, Profiles } from './responses.js';
import { config } from '@const/constants.js';
import { session } from '@components/session.js';
import { security } from '@components/security.js';

const router = Router();

// Get method profile data endpoint
router.get('/get-method-profile-data', async (req, res) => {
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

// Get profiles endpoint
router.get('/get-profiles', async(req, res) => {
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

router.post('/add-method-profile', async(req, res) => {
  try {
    const hasPerms = await session.hasProfile(config.maintenance.adminProfile, req);

    // Return HTTP 401 Unauthorized if the user isn't logged in
    if (hasPerms === null) return res.status(401).json({ message: 'User is not logged in.' });

    // Return HTTP 403 Forbidden if the user is not a maintenance admin
    if (!hasPerms)
      return res.status(403).json({ message: 'User is not allowed to perform this action.' });

    await security.addMethodProfile(req);
    return res.status(200).send();
  } catch (err) {
    console.error(`Error adding profile to method: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;