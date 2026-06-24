import { Router } from 'express';

import { buildSetupInitializeResponse } from '../setup/http.js';

export const setupRouter = Router();

setupRouter.post('/initialize', async (request, response, next) => {
  try {
    const payload = await buildSetupInitializeResponse({
      cookieHeader: request.headers.cookie,
      method: request.method,
      source: process.env
    });

    response.status(payload.status).json(payload.body);
  } catch (error) {
    next(error);
  }
});
