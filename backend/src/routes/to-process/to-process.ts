import { Router } from 'express';
import { dispatcher } from '@components/dispatcher.js';

const router = Router();

router.post('/to-process', async (req, res) => {
  try {
    dispatcher.executeMethod(req);
    return res.status(200);
  } catch(err) {
    console.error(err);
    return res.status(403).json({ message: "User is not allowed to perform this action." });
  };
});

export default router;