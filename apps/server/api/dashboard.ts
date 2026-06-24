import { buildDashboardResponse } from '../src/dashboard/http.js';

type ApiRequest = {
  headers?: {
    cookie?: string;
  };
};

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default async function handler(request: ApiRequest, response: JsonResponse) {
  const payload = await buildDashboardResponse({
    cookieHeader: request.headers?.cookie,
    source: process.env
  });

  response.status(payload.status).json(payload.body);
}
