import { ZodError } from 'zod';

import { getGoogleAuthConfig } from './config.js';
import { getSessionFromCookieHeader } from './session.js';

export type GoogleConnectionStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
  name: string | null;
  picture: string | null;
  allowedGoogleEmail: string | null;
};

export function getGoogleConnectionStatus(
  cookieHeader: string | undefined,
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): GoogleConnectionStatus {
  try {
    const config = getGoogleAuthConfig(source);
    const session = getSessionFromCookieHeader(cookieHeader, config);
    const isAllowedSession =
      session?.email.toLowerCase() === config.allowedGoogleEmail.toLowerCase();

    if (!session || !isAllowedSession) {
      return {
        configured: true,
        connected: false,
        email: null,
        name: null,
        picture: null,
        allowedGoogleEmail: config.allowedGoogleEmail
      };
    }

    return {
      configured: true,
      connected: true,
      email: session.email,
      name: session.name ?? null,
      picture: session.picture ?? null,
      allowedGoogleEmail: config.allowedGoogleEmail
    };
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    return {
      configured: false,
      connected: false,
      email: null,
      name: null,
      picture: null,
      allowedGoogleEmail: null
    };
  }
}
