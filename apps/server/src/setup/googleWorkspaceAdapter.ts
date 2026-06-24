import { google } from 'googleapis';

import type { GoogleAuthConfig } from '../auth/config.js';
import { createOAuthClient } from '../auth/oauth.js';
import type { AuthSession } from '../auth/session.js';
import type { SheetDefinition } from './sheetDefinitions.js';
import { getSheetDefinition } from './sheetDefinitions.js';
import type {
  DriveResource,
  SheetStructureResult,
  StartupOsSetupAdapter
} from './initialize.js';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const SPREADSHEET_MIME_TYPE = 'application/vnd.google-apps.spreadsheet';

function driveUrl(id: string) {
  return `https://drive.google.com/drive/folders/${id}`;
}

function spreadsheetUrl(id: string) {
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function quoteSheetName(sheetName: string) {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function columnLetter(columnNumber: number) {
  let value = columnNumber;
  let letters = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }

  return letters;
}

function normalizeRows(values: unknown[][] | null | undefined) {
  return (values ?? []).map((row) => row.map((cell) => String(cell ?? '')));
}

function recordsFromRows(rows: string[][]) {
  const [headers, ...dataRows] = rows;

  if (!headers) {
    return [];
  }

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']))
    );
}

function getRecordValues(sheetName: string, record: Record<string, string>) {
  const definition = getSheetDefinition(sheetName);

  if (!definition) {
    throw new Error(`Unknown sheet definition: ${sheetName}`);
  }

  return definition.headers.map((header) => record[header] ?? '');
}

export function createGoogleWorkspaceSetupAdapter(
  session: AuthSession,
  config: GoogleAuthConfig
): StartupOsSetupAdapter {
  const auth = createOAuthClient(config);
  auth.setCredentials({
    access_token: session.accessToken,
    expiry_date: session.expiryDate,
    refresh_token: session.refreshToken
  });

  const drive = google.drive({ auth, version: 'v3' });
  const sheets = google.sheets({ auth, version: 'v4' });

  async function writeSheetHeaders(spreadsheetId: string, definition: SheetDefinition) {
    await sheets.spreadsheets.values.update({
      range: `${quoteSheetName(definition.name)}!A1:${columnLetter(definition.headers.length)}1`,
      requestBody: {
        values: [definition.headers]
      },
      spreadsheetId,
      valueInputOption: 'RAW'
    });
  }

  async function findDriveFileByName(name: string, mimeType: string): Promise<DriveResource | null> {
    const { data } = await drive.files.list({
      fields: 'files(id,name,webViewLink)',
      pageSize: 1,
      q: `name = '${escapeDriveQueryValue(name)}' and mimeType = '${mimeType}' and trashed = false`
    });
    const file = data.files?.[0];

    if (!file?.id || !file.name) {
      return null;
    }

    return {
      id: file.id,
      name: file.name,
      url: file.webViewLink ?? (mimeType === FOLDER_MIME_TYPE ? driveUrl(file.id) : spreadsheetUrl(file.id))
    };
  }

  return {
    findDriveFolderByName(name) {
      return findDriveFileByName(name, FOLDER_MIME_TYPE);
    },

    async createDriveFolder(name) {
      const { data } = await drive.files.create({
        fields: 'id,name,webViewLink',
        requestBody: {
          mimeType: FOLDER_MIME_TYPE,
          name
        }
      });

      if (!data.id || !data.name) {
        throw new Error('Google Drive did not return the created folder.');
      }

      return {
        id: data.id,
        name: data.name,
        url: data.webViewLink ?? driveUrl(data.id)
      };
    },

    findSpreadsheetByName(name) {
      return findDriveFileByName(name, SPREADSHEET_MIME_TYPE);
    },

    async createSpreadsheet(name, parentFolderId) {
      const { data } = await drive.files.create({
        fields: 'id,name,webViewLink',
        requestBody: {
          mimeType: SPREADSHEET_MIME_TYPE,
          name,
          parents: [parentFolderId]
        }
      });

      if (!data.id || !data.name) {
        throw new Error('Google Drive did not return the created spreadsheet.');
      }

      return {
        id: data.id,
        name: data.name,
        url: data.webViewLink ?? spreadsheetUrl(data.id)
      };
    },

    async ensureSheetStructure(spreadsheetId, definitions): Promise<SheetStructureResult> {
      const { data } = await sheets.spreadsheets.get({
        fields: 'sheets.properties(sheetId,title)',
        spreadsheetId
      });
      const sheetInfos =
        data.sheets?.flatMap((sheet) => {
          const sheetId = sheet.properties?.sheetId;
          const title = sheet.properties?.title;

          return sheetId === undefined || !title ? [] : [{ sheetId, title }];
        }) ?? [];
      const existingTitles = new Set(sheetInfos.map((sheet) => sheet.title));
      const createdSheets: string[] = [];
      let renamedDefaultSheet = false;
      const requests = [];
      const firstDefinition = definitions[0];
      const defaultSheet = sheetInfos.find((sheet) => sheet.title === 'Sheet1');

      if (firstDefinition && defaultSheet && !existingTitles.has(firstDefinition.name)) {
        requests.push({
          updateSheetProperties: {
            fields: 'title',
            properties: {
              sheetId: defaultSheet.sheetId,
              title: firstDefinition.name
            }
          }
        });
        existingTitles.delete('Sheet1');
        existingTitles.add(firstDefinition.name);
        renamedDefaultSheet = true;
      }

      for (const definition of definitions) {
        if (!existingTitles.has(definition.name)) {
          requests.push({
            addSheet: {
              properties: {
                title: definition.name
              }
            }
          });
          existingTitles.add(definition.name);
          createdSheets.push(definition.name);
        }
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          requestBody: { requests },
          spreadsheetId
        });
      }

      for (const definition of definitions) {
        await writeSheetHeaders(spreadsheetId, definition);
      }

      return {
        createdSheets,
        headersWritten: definitions.map((definition) => definition.name),
        renamedDefaultSheet
      };
    },

    async listRecords(spreadsheetId, sheetName) {
      const { data } = await sheets.spreadsheets.values.get({
        range: `${quoteSheetName(sheetName)}!A:ZZ`,
        spreadsheetId
      });

      return recordsFromRows(normalizeRows(data.values));
    },

    async appendRecord(spreadsheetId, sheetName, record) {
      await sheets.spreadsheets.values.append({
        insertDataOption: 'INSERT_ROWS',
        range: quoteSheetName(sheetName),
        requestBody: {
          values: [getRecordValues(sheetName, record)]
        },
        spreadsheetId,
        valueInputOption: 'USER_ENTERED'
      });
    },

    async upsertConfiguration(spreadsheetId, records) {
      const definition = getSheetDefinition('Configuracion');

      if (!definition) {
        throw new Error('Missing Configuracion sheet definition.');
      }

      const { data } = await sheets.spreadsheets.values.get({
        range: `${quoteSheetName('Configuracion')}!A:ZZ`,
        spreadsheetId
      });
      const rows = normalizeRows(data.values);
      const headers = rows[0] ?? definition.headers;
      const keyIndex = headers.indexOf('clave');
      const existingByKey = new Map<string, number>();

      rows.slice(1).forEach((row, index) => {
        const key = row[keyIndex];

        if (key) {
          existingByKey.set(key, index + 2);
        }
      });

      for (const record of records) {
        const recordKey = record.clave;

        if (!recordKey) {
          continue;
        }

        const values = definition.headers.map((header) => record[header] ?? '');
        const rowNumber = existingByKey.get(recordKey);

        if (rowNumber) {
          await sheets.spreadsheets.values.update({
            range: `${quoteSheetName('Configuracion')}!A${rowNumber}:${columnLetter(definition.headers.length)}${rowNumber}`,
            requestBody: { values: [values] },
            spreadsheetId,
            valueInputOption: 'USER_ENTERED'
          });
        } else {
          await sheets.spreadsheets.values.append({
            insertDataOption: 'INSERT_ROWS',
            range: quoteSheetName('Configuracion'),
            requestBody: { values: [values] },
            spreadsheetId,
            valueInputOption: 'USER_ENTERED'
          });
        }
      }
    }
  } satisfies StartupOsSetupAdapter;
}
