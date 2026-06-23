import {
  createClearSessionCookie,
  createOAuthStateCookie,
  createSessionCookie,
  getSessionFromCookieHeader,
  sealSession,
  unsealSession,
  verifyOAuthState
} from '../auth/session.js';
import { getGoogleAuthConfig } from '../auth/config.js';

const baseEnv = {
  GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'https://pos-personal-operating-system-serve.vercel.app/auth/google/callback',
  SESSION_SECRET: 'a-session-secret-with-enough-entropy-for-tests',
  ALLOWED_GOOGLE_EMAIL: 'GermanVelezh@Gmail.com',
  PUBLIC_APP_URL: 'https://pos-personal-operating-system-serve.vercel.app'
};

const session = {
  email: 'germanvelezh@gmail.com',
  name: 'German Velez',
  picture: 'https://example.com/avatar.png',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiryDate: 1_800_000_000_000,
  connectedAt: '2026-06-23T12:00:00.000Z'
};

describe('Google auth configuration', () => {
  it('normalizes the authorized email and marks HTTPS deployments as secure', () => {
    const config = getGoogleAuthConfig(baseEnv);

    expect(config.allowedGoogleEmail).toBe('germanvelezh@gmail.com');
    expect(config.publicAppUrl).toBe('https://pos-personal-operating-system-serve.vercel.app');
    expect(config.cookies.secure).toBe(true);
    expect(config.scopes).toEqual([
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents'
    ]);
  });

  it('keeps localhost cookies non-secure for local development', () => {
    const config = getGoogleAuthConfig({
      ...baseEnv,
      GOOGLE_REDIRECT_URI: 'http://localhost:5174/auth/google/callback',
      PUBLIC_APP_URL: 'http://localhost:5173'
    });

    expect(config.cookies.secure).toBe(false);
  });
});

describe('encrypted auth session cookies', () => {
  it('round trips a session without exposing the token payload as plaintext', () => {
    const sealed = sealSession(session, baseEnv.SESSION_SECRET);

    expect(sealed).not.toContain(session.email);
    expect(sealed).not.toContain(session.accessToken);
    expect(unsealSession(sealed, baseEnv.SESSION_SECRET)).toEqual(session);
  });

  it('rejects tampered sealed sessions', () => {
    const sealed = sealSession(session, baseEnv.SESSION_SECRET);
    const tampered = `${sealed.slice(0, -2)}aa`;

    expect(unsealSession(tampered, baseEnv.SESSION_SECRET)).toBeNull();
  });

  it('creates secure HttpOnly cookies and reads the session back from a Cookie header', () => {
    const config = getGoogleAuthConfig(baseEnv);
    const cookie = createSessionCookie(session, config);
    const cookieHeader = cookie.split(';')[0];

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).not.toContain(session.accessToken);
    expect(getSessionFromCookieHeader(cookieHeader, config)).toEqual(session);
  });

  it('clears the session cookie with an expired Set-Cookie value', () => {
    const config = getGoogleAuthConfig(baseEnv);

    expect(createClearSessionCookie(config)).toContain('Max-Age=0');
  });
});

describe('OAuth state cookies', () => {
  it('verifies a matching signed state and rejects mismatches', () => {
    const config = getGoogleAuthConfig(baseEnv);
    const cookie = createOAuthStateCookie('state-123', config);
    const cookieHeader = cookie.split(';')[0];

    expect(verifyOAuthState('state-123', cookieHeader, config)).toBe(true);
    expect(verifyOAuthState('other-state', cookieHeader, config)).toBe(false);
  });
});
