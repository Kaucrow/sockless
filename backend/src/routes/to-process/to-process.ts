import { Router } from 'express';
import { dispatcher, logger } from '@components/index.js';
import { ValidationError } from '@errors/validator.js';
import { ToProcessBadReqError } from '@errors/to-process.js';
import { MethodExecutionError } from '@errors/dispatcher.js';
import { toProcessSchema } from '@schemas/dispatcher.js';
import { inspect } from 'util';

const router = Router();

router.post('/to-process', async (req, res) => {
  try {
    const { tx, args } = toProcessSchema.parse(req.body);

    try {
      const result = await dispatcher.executeMethod(req, tx, args, true);

      return res.status(200).json(result);
    } catch(err) {
      if (err instanceof MethodExecutionError) {
        logger.debug(`Error: '${err.name}' with args: '${inspect(args)}'`);
        switch (err.name) {
          case 'TxNotFound': return res.status(400).json({ message: 'Invalid TX.'});
          case 'PermissionDenied': return res.status(403).json({ message: 'User is not allowed to perform this action.'});
          case 'PrivateOnly': return res.status(403).json({ message: 'The TX requested is for internal use only.'});
        }
      }

      if (err instanceof ValidationError || err instanceof ToProcessBadReqError) {
        logger.debug(`Error: '${err.message}' with args: '${inspect(args)}'`);
        return res.status(400).json({ message: err.message });
      }

      logger.error(`Error: '${err as string}' with args: '${inspect(args)}'`);
      return res.status(500).json({ message: 'A server error occurred.' });
    };
  } catch(err) {
    return res.status(400).json({ message: 'Invalid request body.' });
  }
});

export default router;