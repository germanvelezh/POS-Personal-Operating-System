import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

import type { GoogleAuthConfig } from './config.js';

export const SESSION_COOKIE_NAME = 'pos_session';
export const OAUTH_STATE_COOKIE_NAME = 'pos_oauth_state';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

const authSessionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiryDate: z.number().int().positive().optional(),
  connectedAt: z.string().datetime()
});

export type AuthSession = z.infer<typeof authSessionSchema>;

type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Lax';
  maxAge?: number;
  expires?: Date;
};

function encryptionKey(secret: string) {
  return createHash('sha256').update(secret).digest();
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function serializeCookie(name: string, value: string, options: CookieOptions) {
  const attributes = [`${name}=${value}`, 'Path=/'];

  if (options.maxAge !== undefined) {
    attributes.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    attributes.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.httpOnly) {
    attributes.push('HttpOnly');
  }

  if (options.secure) {
    attributes.push('Secure');
  }

  if (options.sameSite) {
    attributes.push(`SameSite=${options.sameSite}`);
  }

  return attributes.join('; ');
}

export function parseCookieHeader(cookieHeader: string | undefined) {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');

    if (!rawName || rawValue.length === 0) {
      continue;
    }

    cookies.set(rawName, rawValue.join('='));
  }

  return cookies;
}

export function sealSession(session: AuthSession, secret: string) {
  const parsedSession = authSessionSchema.parse(session);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(parsedSession), 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url')
  ].join('.');
}

export function unsealSession(sealed: string | undefined, secret: string): AuthSession | null {
  if (!sealed) {
    return null;
  }

  const [version, encodedIv, encodedTag, encodedEncrypted] = sealed.split('.');

  if (version !== 'v1' || !encodedIv || !encodedTag || !encodedEncrypted) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      encryptionKey(secret),
      Buffer.from(encodedIv, 'base64url')
    );

    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encodedEncrypted, 'base64url')),
      decipher.final()
    ]).toString('utf8');

    return authSessionSchema.parse(JSON.parse(decrypted));
  } catch {
    return null;
  }
}

export function createSessionCookie(session: AuthSession, config: GoogleAuthConfig) {
  return serializeCookie(SESSION_COOKIE_NAME, sealSession(session, config.sessionSecret), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure
  });
}

export function createClearSessionCookie(config: GoogleAuthConfig) {
  return serializeCookie(SESSION_COOKIE_NAME, '', {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure
  });
}

export function getSessionFromCookieHeader(
  cookieHeader: string | undefined,
  config: GoogleAuthConfig
) {
  const sealed = parseCookieHeader(cookieHeader).get(SESSION_COOKIE_NAME);

  return unsealSession(sealed, config.sessionSecret);
}

export function createOAuthStateCookie(state: string, config: GoogleAuthConfig) {
  const value = `${state}.${sign(state, config.sessionSecret)}`;

  return serializeCookie(OAUTH_STATE_COOKIE_NAME, value, {
    httpOnly: true,
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure
  });
}

export function createClearOAuthStateCookie(config: GoogleAuthConfig) {
  return serializeCookie(OAUTH_STATE_COOKIE_NAME, '', {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure
  });
}

export function verifyOAuthState(
  state: string | undefined,
  cookieHeader: string | undefined,
  config: GoogleAuthConfig
) {
  if (!state) {
    return false;
  }

  const cookieValue = parseCookieHeader(cookieHeader).get(OAUTH_STATE_COOKIE_NAME);

  if (!cookieValue) {
    return false;
  }

  const [storedState, storedSignature] = cookieValue.split('.');

  if (!storedState || !storedSignature || storedState !== state) {
    return false;
  }

  return safeEquals(storedSignature, sign(storedState, config.sessionSecret));
}
