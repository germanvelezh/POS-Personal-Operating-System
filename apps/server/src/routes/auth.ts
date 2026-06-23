import { Router, type Response } from 'express';

import {
  buildGoogleAuthRedirect,
  buildGoogleCallbackRedirect,
  buildGoogleLogoutResponse,
  type JsonResponse,
  type OAuthRedirectResponse
} from '../auth/oauth.js';
import { getGoogleConnectionStatus } from '../auth/status.js';

export const authRouter = Router();
export const authApiRouter = Router();

function applySetCookie(response: Response, setCookie: string | string[] | undefined) {
  if (setCookie) {
    response.setHeader('Set-Cookie', setCookie);
  }
}

function sendRedirect(response: Response, redirect: OAuthRedirectResponse) {
  applySetCookie(response, redirect.setCookie);
  response.redirect(redirect.status, redirect.location);
}

function sendJson(response: Response, payload: JsonResponse) {
  applySetCookie(response, payload.setCookie);
  response.status(payload.status).json(payload.body);
}

authRouter.get('/google', (_request, response) => {
  sendRedirect(response, buildGoogleAuthRedirect(process.env));
});

authRouter.get('/google/callback', async (request, response, next) => {
  try {
    const redirect = await buildGoogleCallbackRedirect(
      request.query as Record<string, string | string[] | undefined>,
      request.headers.cookie,
      process.env
    );

    sendRedirect(response, redirect);
  } catch (error) {
    next(error);
  }
});

authApiRouter.get('/status', (request, response) => {
  response.status(200).json(getGoogleConnectionStatus(request.headers.cookie, process.env));
});

authApiRouter.post('/logout', (_request, response) => {
  sendJson(response, buildGoogleLogoutResponse(process.env));
});
