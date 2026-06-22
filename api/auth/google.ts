type JsonResponse = {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
};

export default function handler(_request: unknown, response: JsonResponse) {
  response.status(501).json({
    status: 'not_implemented',
    message: 'Google OAuth starts in Phase 1. Configure Vercel env vars first.'
  });
}
