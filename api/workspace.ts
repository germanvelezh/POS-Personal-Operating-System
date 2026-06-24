import { buildWorkspaceResponse } from '../apps/server/src/workspace/http';

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

export default async function handler(request: ApiRequest, response: JsonResponse) {
  const payload = await buildWorkspaceResponse({
    body: request.body,
    cookieHeader: request.headers?.cookie,
    method: request.method,
    query: request.query,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
}
