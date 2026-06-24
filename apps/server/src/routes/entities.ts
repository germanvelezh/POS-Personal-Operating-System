import { Router } from 'express';

import {
  buildEntityCollectionResponse,
  buildEntityItemResponse
} from '../entities/http.js';

export const entitiesRouter = Router();

entitiesRouter.get('/:entity', async (request, response) => {
  const payload = await buildEntityCollectionResponse({
    cookieHeader: request.headers.cookie,
    entity: request.params.entity,
    method: request.method,
    query: request.query as Record<string, string | string[] | undefined>,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});

entitiesRouter.post('/:entity', async (request, response) => {
  const payload = await buildEntityCollectionResponse({
    body: request.body,
    cookieHeader: request.headers.cookie,
    entity: request.params.entity,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});

entitiesRouter.get('/:entity/:id', async (request, response) => {
  const payload = await buildEntityItemResponse({
    cookieHeader: request.headers.cookie,
    entity: request.params.entity,
    id: request.params.id,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});

entitiesRouter.put('/:entity/:id', async (request, response) => {
  const payload = await buildEntityItemResponse({
    body: request.body,
    cookieHeader: request.headers.cookie,
    entity: request.params.entity,
    id: request.params.id,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});

entitiesRouter.patch('/:entity/:id', async (request, response) => {
  const payload = await buildEntityItemResponse({
    body: request.body,
    cookieHeader: request.headers.cookie,
    entity: request.params.entity,
    id: request.params.id,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});

entitiesRouter.delete('/:entity/:id', async (request, response) => {
  const payload = await buildEntityItemResponse({
    cookieHeader: request.headers.cookie,
    entity: request.params.entity,
    id: request.params.id,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
});
