import { getGoogleConnectionStatus } from '../../src/auth/status.js';

type StatusRequest = {
  headers?: {
    cookie?: string;
  };
};

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(request: StatusRequest, response: JsonResponse) {
  response.status(200).json(getGoogleConnectionStatus(request.headers?.cookie, process.env));
}
