import { Router } from 'express';
import { dispatcher } from '@components/dispatcher.js';

const router = Router();

router.post('/to-process', async (req, res) => {
  try {
    const result = await dispatcher.executeMethod(req);

    switch(result) {
      case 'Executed': return res.status(200).send();
      case 'MethodNotFound': return res.status(400).json({ message: 'Method not found.'});
      case 'PermissionDenied': return res.status(403).json({ message: 'User is not allowed to perform this action.'});
    }
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'A server error occurred.' });
  };
});

export default router;