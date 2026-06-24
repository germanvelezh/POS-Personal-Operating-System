export type GoogleAuthStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
  name: string | null;
  picture: string | null;
  allowedGoogleEmail: string | null;
};

export type SetupInitializeResult = {
  initialized: boolean;
  rootFolderId: string;
  rootFolderUrl: string;
  masterSheetId: string;
  masterSheetUrl: string;
  internalClientId: string;
  created: {
    rootFolder: boolean;
    masterSheet: boolean;
    internalClient: boolean;
  };
  sheets: {
    createdSheets: string[];
    headersWritten: string[];
    renamedDefaultSheet: boolean;
  };
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

export async function initializeGoogleWorkspace(): Promise<SetupInitializeResult> {
  const response = await fetch('/api/setup/initialize', {
    credentials: 'include',
    method: 'POST'
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : 'No se pudo inicializar Google Workspace.';

    throw new Error(message);
  }

  return payload as SetupInitializeResult;
}
