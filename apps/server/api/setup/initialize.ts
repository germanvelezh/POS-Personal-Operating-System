import { buildSetupInitializeResponse } from '../../src/setup/http.js';

type SetupRequest = {
  headers?: {
    cookie?: string;
  };
  method?: string;
};

type JsonResponse = {
  setHeader?: (name: string, value: string | string[]) => void;
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default async function handler(request: SetupRequest, response: JsonResponse) {
  const payload = await buildSetupInitializeResponse({
    cookieHeader: request.headers?.cookie,
    method: request.method,
    source: process.env
  });

  if (payload.setCookie) {
    response.setHeader?.('Set-Cookie', payload.setCookie);
  }

  response.status(payload.status).json(payload.body);
}
