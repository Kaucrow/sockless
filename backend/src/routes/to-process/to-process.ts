import { Router } from 'express';
import { dispatcher, logger } from '@components/index.js';
import { ValidationError } from '@errors/validator.js';
import { ToProcessBadReqError } from '@errors/to-process.js';
import { MethodExecutionError } from '@errors/dispatcher.js';
import { toProcessSchema } from '@schemas/dispatcher.js';

const router = Router();

router.post('/to-process', async (req, res) => {
  try {
    const { tx, args } = toProcessSchema.parse(req.body);

    const result = await dispatcher.executeMethod(req, tx, args);

    return res.status(200).json(result);
  } catch(err) {
    if (err instanceof MethodExecutionError) {
      switch (err.name) {
        case 'TxNotFound': return res.status(400).json({ message: 'Invalid TX.'});
        case 'PermissionDenied': return res.status(403).json({ message: 'User is not allowed to perform this action.'});
      }
    }

    if (err instanceof ValidationError || err instanceof ToProcessBadReqError) {
      logger.debug(err.message);
      return res.status(400).json({ message: err.message });
    }

    logger.error(err as string);
    return res.status(500).json({ message: 'A server error occurred.' });
  };
});

export default router;