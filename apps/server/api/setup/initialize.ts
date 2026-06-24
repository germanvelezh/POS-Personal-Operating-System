import { buildSetupInitializeResponse } from '../../src/setup/http.js';

type SetupRequest = {
  headers?: {
    cookie?: string;
  };
  method?: string;
};

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default async function handler(request: SetupRequest, response: JsonResponse) {
  const payload = await buildSetupInitializeResponse({
    cookieHeader: request.headers?.cookie,
    method: request.method,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
}
