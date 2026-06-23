import {
  buildGoogleAuthRedirect,
  buildGoogleLogoutResponse
} from '../auth/oauth.js';
import { OAUTH_STATE_COOKIE_NAME, SESSION_COOKIE_NAME } from '../auth/session.js';

const authEnv = {
  GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:5174/auth/google/callback',
  SESSION_SECRET: 'a-session-secret-with-enough-entropy-for-tests',
  ALLOWED_GOOGLE_EMAIL: 'germanvelezh@gmail.com',
  PUBLIC_APP_URL: 'http://localhost:5173'
};

describe('Google OAuth HTTP helpers', () => {
  it('builds a Google OAuth redirect and stores a signed state cookie', () => {
    const response = buildGoogleAuthRedirect(authEnv, 'state-123');

    expect(response.status).toBe(302);
    expect(response.location).toContain('https://accounts.google.com/o/oauth2/');
    expect(response.location).toContain('client_id=client-id.apps.googleusercontent.com');
    expect(response.location).toContain('state=state-123');
    expect(response.setCookie).toContain(`${OAUTH_STATE_COOKIE_NAME}=`);
    expect(response.setCookie).toContain('HttpOnly');
  });

  it('redirects back to settings when OAuth env vars are missing', () => {
    const response = buildGoogleAuthRedirect({}, 'state-123');

    expect(response.status).toBe(302);
    expect(response.location).toBe('http://localhost:5173/settings?google=missing_config');
  });

  it('builds a logout response that clears the encrypted session cookie', () => {
    const response = buildGoogleLogoutResponse(authEnv);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(response.setCookie).toContain('Max-Age=0');
  });
});
