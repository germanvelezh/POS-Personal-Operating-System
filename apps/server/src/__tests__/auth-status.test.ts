import { getGoogleAuthConfig } from '../auth/config.js';
import { createSessionCookie } from '../auth/session.js';
import { getGoogleConnectionStatus } from '../auth/status.js';

const env = {
  GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'https://pos-personal-operating-system-serve.vercel.app/auth/google/callback',
  SESSION_SECRET: 'a-session-secret-with-enough-entropy-for-tests',
  ALLOWED_GOOGLE_EMAIL: 'germanvelezh@gmail.com',
  PUBLIC_APP_URL: 'https://pos-personal-operating-system-serve.vercel.app'
};

describe('Google connection status', () => {
  it('reports missing OAuth configuration without throwing', () => {
    expect(getGoogleConnectionStatus(undefined, {})).toEqual({
      configured: false,
      connected: false,
      email: null,
      name: null,
      picture: null,
      allowedGoogleEmail: null
    });
  });

  it('reports configured but disconnected when no valid session cookie exists', () => {
    expect(getGoogleConnectionStatus(undefined, env)).toMatchObject({
      configured: true,
      connected: false,
      email: null,
      allowedGoogleEmail: 'germanvelezh@gmail.com'
    });
  });

  it('reports the connected Google account from a valid encrypted cookie', () => {
    const config = getGoogleAuthConfig(env);
    const cookie = createSessionCookie(
      {
        email: 'germanvelezh@gmail.com',
        name: 'German Velez',
        picture: 'https://example.com/avatar.png',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiryDate: 1_800_000_000_000,
        connectedAt: '2026-06-23T12:00:00.000Z'
      },
      config
    );

    expect(getGoogleConnectionStatus(cookie.split(';')[0], env)).toEqual({
      configured: true,
      connected: true,
      email: 'germanvelezh@gmail.com',
      name: 'German Velez',
      picture: 'https://example.com/avatar.png',
      allowedGoogleEmail: 'germanvelezh@gmail.com'
    });
  });
});
