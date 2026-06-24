import { google } from 'googleapis';

import type { GoogleAuthConfig } from '../auth/config.js';
import { createOAuthClient } from '../auth/oauth.js';
import type { AuthSession } from '../auth/session.js';
import { createEntityRepositories } from '../repositories/entityRepositories.js';
import { createGoogleSheetsGateway } from '../repositories/googleSheetsGateway.js';
import { MASTER_SPREADSHEET_NAME } from '../setup/sheetDefinitions.js';

const SPREADSHEET_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function resolveMasterSpreadsheetId(
  session: AuthSession,
  config: GoogleAuthConfig,
  source: EnvSource
) {
  const explicitId = source.GOOGLE_MASTER_SHEET_ID?.trim();

  if (explicitId) {
    return explicitId;
  }

  const auth = createOAuthClient(config);
  auth.setCredentials({
    access_token: session.accessToken,
    expiry_date: session.expiryDate,
    refresh_token: session.refreshToken
  });

  const drive = google.drive({ auth, version: 'v3' });
  const { data } = await drive.files.list({
    fields: 'files(id,name)',
    pageSize: 1,
    q: `name = '${escapeDriveQueryValue(MASTER_SPREADSHEET_NAME)}' and mimeType = '${SPREADSHEET_MIME_TYPE}' and trashed = false`
  });
  const spreadsheetId = data.files?.[0]?.id;

  if (!spreadsheetId) {
    throw new Error('No se encontró el Google Sheet maestro. Ejecuta Inicializar sistema.');
  }

  return spreadsheetId;
}

export async function createGoogleEntityRepositories(
  session: AuthSession,
  config: GoogleAuthConfig,
  source: EnvSource = process.env
) {
  const spreadsheetId = await resolveMasterSpreadsheetId(session, config, source);
  const auth = createOAuthClient(config);
  auth.setCredentials({
    access_token: session.accessToken,
    expiry_date: session.expiryDate,
    refresh_token: session.refreshToken
  });

  const sheets = google.sheets({ auth, version: 'v4' });

  return createEntityRepositories(createGoogleSheetsGateway(sheets, spreadsheetId));
}
