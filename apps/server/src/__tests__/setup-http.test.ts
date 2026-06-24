import { getGoogleAuthConfig } from '../auth/config.js';
import { createSessionCookie } from '../auth/session.js';
import { buildSetupInitializeResponse } from '../setup/http.js';
import type { StartupOsSetupAdapter } from '../setup/initialize.js';

const env = {
  GOOGLE_CLIENT_ID: 'client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'https://pos-personal-operating-system-serve.vercel.app/auth/google/callback',
  SESSION_SECRET: 'a-session-secret-with-enough-entropy-for-tests',
  ALLOWED_GOOGLE_EMAIL: 'germanvelezh@gmail.com',
  PUBLIC_APP_URL: 'https://pos-personal-operating-system-serve.vercel.app'
};

function createConnectedCookie() {
  const config = getGoogleAuthConfig(env);

  return createSessionCookie(
    {
      email: 'germanvelezh@gmail.com',
      name: 'German Velez',
      picture: undefined,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiryDate: 1_800_000_000_000,
      connectedAt: '2026-06-23T12:00:00.000Z'
    },
    config
  ).split(';')[0];
}

function createAdapter(): StartupOsSetupAdapter {
  return {
    findDriveFolderByName: vi.fn(async () => null),
    createDriveFolder: vi.fn(async () => ({
      id: 'folder-1',
      name: 'Startup OS',
      url: 'https://drive.google.com/drive/folders/folder-1'
    })),
    findSpreadsheetByName: vi.fn(async () => null),
    createSpreadsheet: vi.fn(async () => ({
      id: 'sheet-1',
      name: 'Startup OS Personal - Base Maestra',
      url: 'https://docs.google.com/spreadsheets/d/sheet-1/edit'
    })),
    ensureSheetStructure: vi.fn(async () => ({
      createdSheets: ['Clientes'],
      headersWritten: ['Clientes'],
      renamedDefaultSheet: true
    })),
    listRecords: vi.fn(async () => []),
    appendRecord: vi.fn(async () => undefined),
    upsertConfiguration: vi.fn(async () => undefined)
  };
}

describe('setup initialize HTTP response', () => {
  it('rejects initialize requests without a connected Google session', async () => {
    const response = await buildSetupInitializeResponse({
      cookieHeader: undefined,
      method: 'POST',
      source: env
    });

    expect(response).toEqual({
      status: 401,
      body: {
        error: 'google_not_connected',
        message: 'Conecta Google antes de inicializar el sistema.'
      }
    });
  });

  it('runs initialization with the connected Google session', async () => {
    const adapter = createAdapter();
    const adapterFactory = vi.fn(() => adapter);

    const response = await buildSetupInitializeResponse({
      adapterFactory,
      cookieHeader: createConnectedCookie(),
      method: 'POST',
      source: env
    });

    expect(adapterFactory).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'germanvelezh@gmail.com', accessToken: 'access-token' }),
      expect.objectContaining({ allowedGoogleEmail: 'germanvelezh@gmail.com' })
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      initialized: true,
      rootFolderId: 'folder-1',
      masterSheetId: 'sheet-1',
      internalClientId: expect.stringMatching(/^CLI-/)
    });
  });
});
