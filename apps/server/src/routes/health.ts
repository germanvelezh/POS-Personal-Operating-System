import { Router } from 'express';

import { createHealthPayload } from '../utils/health.js';

export { createHealthPayload } from '../utils/health.js';

export const healthRouter = Router();

healthRouter.get('/', (_request, response) => {
  response.status(200).json(createHealthPayload('local-express'));
});
