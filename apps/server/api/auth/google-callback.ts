import { buildGoogleCallbackRedirect } from '../../src/auth/oauth.js';

type CallbackRequest = {
  query?: Record<string, string | string[] | undefined>;
  headers?: {
    cookie?: string;
  };
};

type RedirectResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => RedirectResponse;
  end: () => void;
};

export default async function handler(request: CallbackRequest, response: RedirectResponse) {
  const redirect = await buildGoogleCallbackRedirect(
    request.query ?? {},
    request.headers?.cookie,
    process.env
  );

  if (redirect.setCookie) {
    response.setHeader('Set-Cookie', redirect.setCookie);
  }

  response.setHeader('Location', redirect.location);
  response.status(redirect.status).end();
}
