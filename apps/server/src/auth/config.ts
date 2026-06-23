import { z } from 'zod';

export const GOOGLE_AUTH_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents'
] as const;

const authEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
  GOOGLE_REDIRECT_URI: z.string().trim().url(),
  SESSION_SECRET: z.string().min(32),
  ALLOWED_GOOGLE_EMAIL: z.string().trim().email(),
  PUBLIC_APP_URL: z.string().trim().url().optional(),
  APP_BASE_URL: z.string().trim().url().optional()
});

export type GoogleAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionSecret: string;
  allowedGoogleEmail: string;
  publicAppUrl: string;
  scopes: string[];
  cookies: {
    secure: boolean;
    sameSite: 'Lax';
  };
};

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getGoogleAuthConfig(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): GoogleAuthConfig {
  const parsed = authEnvSchema.parse(source);
  const publicAppUrl = stripTrailingSlash(
    parsed.PUBLIC_APP_URL ?? parsed.APP_BASE_URL ?? parsed.GOOGLE_REDIRECT_URI
  );
  const isHttps =
    publicAppUrl.startsWith('https://') || parsed.GOOGLE_REDIRECT_URI.startsWith('https://');

  return {
    clientId: parsed.GOOGLE_CLIENT_ID,
    clientSecret: parsed.GOOGLE_CLIENT_SECRET,
    redirectUri: parsed.GOOGLE_REDIRECT_URI,
    sessionSecret: parsed.SESSION_SECRET,
    allowedGoogleEmail: parsed.ALLOWED_GOOGLE_EMAIL.toLowerCase(),
    publicAppUrl,
    scopes: [...GOOGLE_AUTH_SCOPES],
    cookies: {
      secure: isHttps,
      sameSite: 'Lax'
    }
  };
}
