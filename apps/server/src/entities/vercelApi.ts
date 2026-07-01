import {
  buildEntityCollectionResponse,
  buildEntityItemResponse
} from './http.js';
import type { EntityRouteKey } from './config.js';
import { createGoogleWorkspaceAdapter } from '../workspace/googleWorkspaceAdapter.js';

type ApiRequest = {
  body?: unknown;
  headers?: {
    cookie?: string;
  };
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

function singleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pathSegments(request: ApiRequest) {
  const urlPath = request.url
    ? new URL(request.url, 'https://startup-os.local').pathname.replace(/^\/api\/?/, '')
    : '';

  return urlPath.split('/').filter(Boolean);
}

export async function handleEntityCollectionApiRequest(
  entity: EntityRouteKey,
  request: ApiRequest,
  response: JsonResponse
) {
  const payload = await buildEntityCollectionResponse({
    body: request.body,
    cookieHeader: request.headers?.cookie,
    entity,
    method: request.method,
    query: request.query,
    source: process.env,
    workspaceAdapterFactory:
      request.method === 'POST'
        ? async (session, config) => createGoogleWorkspaceAdapter(session, config)
        : undefined
  });

  response.status(payload.status).json(payload.body);
}

export async function handleEntityItemApiRequest(
  entity: EntityRouteKey,
  request: ApiRequest,
  response: JsonResponse
) {
  const [, idFromPath] = pathSegments(request);
  const id = singleQueryValue(request.query?.id) ?? idFromPath;
  const shouldAttachWorkspaceAdapter = request.method === 'PUT' || request.method === 'PATCH';
  const payload = await buildEntityItemResponse({
    body: request.body,
    cookieHeader: request.headers?.cookie,
    entity,
    id,
    method: request.method,
    source: process.env,
    workspaceAdapterFactory: shouldAttachWorkspaceAdapter
      ? async (session, config) => createGoogleWorkspaceAdapter(session, config)
      : undefined
  });

  response.status(payload.status).json(payload.body);
}
