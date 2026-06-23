import { buildGoogleAuthRedirect } from '../../src/auth/oauth';

type RedirectResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => RedirectResponse;
  end: () => void;
};

export default function handler(_request: unknown, response: RedirectResponse) {
  const redirect = buildGoogleAuthRedirect(process.env);

  if (redirect.setCookie) {
    response.setHeader('Set-Cookie', redirect.setCookie);
  }

  response.setHeader('Location', redirect.location);
  response.status(redirect.status).end();
}
