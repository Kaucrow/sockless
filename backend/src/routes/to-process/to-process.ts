import { Router } from 'express';
import { dispatcher } from '@components/dispatcher.js';

const router = Router();

router.post('/to-process', async (req, res) => {
  try {
    const result = await dispatcher.executeMethod(req);

    switch(result) {
      case 'TxNotFound': return res.status(400).json({ message: 'Invalid TX.'});
      case 'PermissionDenied': return res.status(403).json({ message: 'User is not allowed to perform this action.'});
      default: return res.status(200).json(result);
    }
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'A server error occurred.' });
  };
});

export default router;