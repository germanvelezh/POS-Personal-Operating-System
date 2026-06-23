import { buildGoogleLogoutResponse } from '../../apps/server/src/auth/oauth';

type LogoutRequest = {
  method?: string;
};

type JsonResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(request: LogoutRequest, response: JsonResponse) {
  if (request.method && request.method !== 'POST') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const payload = buildGoogleLogoutResponse(process.env);

  if (payload.setCookie) {
    response.setHeader('Set-Cookie', payload.setCookie);
  }

  response.status(payload.status).json(payload.body);
}
