import {
  buildEntityCollectionResponse,
  buildEntityItemResponse
} from '../apps/server/src/entities/http';
import { createGoogleWorkspaceAdapter } from '../apps/server/src/workspace/googleWorkspaceAdapter';

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

function pathSegments(request: ApiRequest) {
  const urlPath = request.url
    ? new URL(request.url, 'https://startup-os.local').pathname.replace(/^\/api\/?/, '')
    : '';
  const path = request.query?.path ?? urlPath;

  return (Array.isArray(path) ? path : path ? [path] : [])
    .flatMap((segment) => segment.split('/'))
    .filter(Boolean);
}

export default async function handler(request: ApiRequest, response: JsonResponse) {
  const [entity, id] = pathSegments(request);
  const payload = id
    ? await buildEntityItemResponse({
        body: request.body,
        cookieHeader: request.headers?.cookie,
        entity: entity ?? '',
        id,
        method: request.method,
        source: process.env
      })
    : await buildEntityCollectionResponse({
        body: request.body,
        cookieHeader: request.headers?.cookie,
        entity: entity ?? '',
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
