import { Router } from 'express';

import { buildDashboardResponse } from '../dashboard/http.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (request, response) => {
  const payload = await buildDashboardResponse({
    cookieHeader: request.headers.cookie,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});
