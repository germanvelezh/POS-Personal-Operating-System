import { randomBytes } from 'node:crypto';

import { ZodError } from 'zod';
import { google } from 'googleapis';

import { getGoogleAuthConfig, type GoogleAuthConfig } from './config.js';
import {
  createClearOAuthStateCookie,
  createClearSessionCookie,
  createOAuthStateCookie,
  createSessionCookie,
  verifyOAuthState,
  type AuthSession
} from './session.js';

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

export type OAuthRedirectResponse = {
  status: 302;
  location: string;
  setCookie?: string | string[];
};

export type JsonResponse = {
  status: number;
  body: unknown;
  setCookie?: string | string[];
};

type GoogleProfile = {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

export class GoogleAuthError extends Error {
  constructor(
    message: string,
    public readonly reason: string
  ) {
    super(message);
  }
}

function publicAppUrlFromSource(source: EnvSource) {
  return (source.PUBLIC_APP_URL ?? source.APP_BASE_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
}

function settingsRedirect(source: EnvSource, reason: string) {
  const url = new URL('/settings', publicAppUrlFromSource(source));
  url.searchParams.set('google', reason);

  return url.toString();
}

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function createOAuthClient(config: GoogleAuthConfig) {
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
}

export function buildGoogleAuthRedirect(
  source: EnvSource = process.env,
  state = randomBytes(24).toString('base64url')
): OAuthRedirectResponse {
  try {
    const config = getGoogleAuthConfig(source);
    const authUrl = createOAuthClient(config).generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      prompt: 'consent',
      scope: config.scopes,
      state
    });

    return {
      status: 302,
      location: authUrl,
      setCookie: createOAuthStateCookie(state, config)
    };
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    return {
      status: 302,
      location: settingsRedirect(source, 'missing_config')
    };
  }
}

export function buildGoogleLogoutResponse(source: EnvSource = process.env): JsonResponse {
  const config = getGoogleAuthConfig(source);

  return {
    status: 200,
    body: { ok: true },
    setCookie: createClearSessionCookie(config)
  };
}

export async function exchangeGoogleCodeForSession(
  code: string,
  config: GoogleAuthConfig
): Promise<AuthSession> {
  const oauthClient = createOAuthClient(config);
  const { tokens } = await oauthClient.getToken(code);

  oauthClient.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauthClient,
    version: 'v2'
  });
  const { data } = await oauth2.userinfo.get();
  const profile = data as GoogleProfile;
  const email = profile.email?.toLowerCase();

  if (!email) {
    throw new GoogleAuthError('Google did not return an email address.', 'missing_email');
  }

  if (email !== config.allowedGoogleEmail) {
    throw new GoogleAuthError('This Google account is not authorized.', 'unauthorized_email');
  }

  if (!tokens.access_token) {
    throw new GoogleAuthError('Google did not return an access token.', 'missing_access_token');
  }

  return {
    email,
    name: profile.name ?? undefined,
    picture: profile.picture ?? undefined,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined,
    connectedAt: new Date().toISOString()
  };
}

export async function buildGoogleCallbackRedirect(
  query: Record<string, string | string[] | undefined>,
  cookieHeader: string | undefined,
  source: EnvSource = process.env
): Promise<OAuthRedirectResponse> {
  let config: GoogleAuthConfig;

  try {
    config = getGoogleAuthConfig(source);
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    return {
      status: 302,
      location: settingsRedirect(source, 'missing_config')
    };
  }

  const googleError = queryValue(query.error);

  if (googleError) {
    return {
      status: 302,
      location: settingsRedirect(source, `error_${googleError}`),
      setCookie: createClearOAuthStateCookie(config)
    };
  }

  const code = queryValue(query.code);
  const state = queryValue(query.state);

  if (!code || !verifyOAuthState(state, cookieHeader, config)) {
    return {
      status: 302,
      location: settingsRedirect(source, 'invalid_state'),
      setCookie: createClearOAuthStateCookie(config)
    };
  }

  try {
    const session = await exchangeGoogleCodeForSession(code, config);

    return {
      status: 302,
      location: settingsRedirect(source, 'connected'),
      setCookie: [createSessionCookie(session, config), createClearOAuthStateCookie(config)]
    };
  } catch (error) {
    const reason = error instanceof GoogleAuthError ? error.reason : 'callback_failed';

    return {
      status: 302,
      location: settingsRedirect(source, reason),
      setCookie: createClearOAuthStateCookie(config)
    };
  }
}
