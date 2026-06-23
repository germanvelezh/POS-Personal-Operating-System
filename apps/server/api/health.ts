import { createHealthPayload } from '../src/utils/health';

type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(_request: unknown, response: JsonResponse) {
  response.status(200).json(createHealthPayload('vercel-function'));
}
