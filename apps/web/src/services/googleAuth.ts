export type GoogleAuthStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
  name: string | null;
  picture: string | null;
  allowedGoogleEmail: string | null;
};

export const defaultGoogleAuthStatus: GoogleAuthStatus = {
  configured: false,
  connected: false,
  email: null,
  name: null,
  picture: null,
  allowedGoogleEmail: null
};

export async function fetchGoogleAuthStatus(): Promise<GoogleAuthStatus> {
  const response = await fetch('/api/auth/status', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Unable to read Google auth status.');
  }

  return (await response.json()) as GoogleAuthStatus;
}

export async function logoutGoogleAuth() {
  const response = await fetch('/api/auth/logout', {
    credentials: 'include',
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Unable to disconnect Google.');
  }
}
