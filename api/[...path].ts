import {
  buildEntityCollectionResponse,
  buildEntityItemResponse
} from '../apps/server/src/entities/http';

type ApiRequest = {
  body?: unknown;
  headers?: {
    cookie?: string;
  };
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

function pathSegments(query: ApiRequest['query']) {
  const path = query?.path;

  return (Array.isArray(path) ? path : path ? [path] : [])
    .flatMap((segment) => segment.split('/'))
    .filter(Boolean);
}

export default async function handler(request: ApiRequest, response: JsonResponse) {
  const [entity, id] = pathSegments(request.query);
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
        source: process.env
      });

  response.status(payload.status).json(payload.body);
}
