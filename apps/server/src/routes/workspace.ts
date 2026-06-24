import { Router } from 'express';

import { buildWorkspaceResponse } from '../workspace/http.js';

export const workspaceRouter = Router();

workspaceRouter.get('/', async (request, response) => {
  const payload = await buildWorkspaceResponse({
    cookieHeader: request.headers.cookie,
    method: request.method,
    query: request.query as Record<string, string | string[] | undefined>,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});

workspaceRouter.post('/', async (request, response) => {
  const payload = await buildWorkspaceResponse({
    body: request.body,
    cookieHeader: request.headers.cookie,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});
