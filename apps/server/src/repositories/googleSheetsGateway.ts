import { getSheetDefinition } from '../setup/sheetDefinitions.js';
import type { SheetsTableGateway } from './sheetsRepository.js';

type GoogleSheetsValuesApi = {
  append: (params: {
    insertDataOption: 'INSERT_ROWS';
    range: string;
    requestBody: { values: string[][] };
    spreadsheetId: string;
    valueInputOption: 'USER_ENTERED';
  }) => Promise<unknown>;
  get: (params: {
    range: string;
    spreadsheetId: string;
  }) => Promise<{ data: { values?: string[][] | null } }>;
  update: (params: {
    range: string;
    requestBody: { values: string[][] };
    spreadsheetId: string;
    valueInputOption: 'USER_ENTERED';
  }) => Promise<unknown>;
};

export type GoogleSheetsApi = {
  spreadsheets: {
    values: GoogleSheetsValuesApi;
  };
};

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

function getColumnCount(sheetName: string) {
  const definition = getSheetDefinition(sheetName);

  if (!definition) {
    throw new Error(`Missing sheet definition for ${sheetName}.`);
  }

  return definition.headers.length;
}

export function createGoogleSheetsGateway(
  sheets: GoogleSheetsApi,
  spreadsheetId: string
): SheetsTableGateway {
  return {
    async appendRow(sheetName, values) {
      await sheets.spreadsheets.values.append({
        insertDataOption: 'INSERT_ROWS',
        range: quoteSheetName(sheetName),
        requestBody: {
          values: [values]
        },
        spreadsheetId,
        valueInputOption: 'USER_ENTERED'
      });
    },

    async listRows(sheetName) {
      const { data } = await sheets.spreadsheets.values.get({
        range: `${quoteSheetName(sheetName)}!A2:ZZ`,
        spreadsheetId
      });

      return (data.values ?? []).map((values, index) => ({
        rowNumber: index + 2,
        values
      }));
    },

    async updateRow(sheetName, rowNumber, values) {
      const lastColumn = columnLetter(getColumnCount(sheetName));

      await sheets.spreadsheets.values.update({
        range: `${quoteSheetName(sheetName)}!A${rowNumber}:${lastColumn}${rowNumber}`,
        requestBody: {
          values: [values]
        },
        spreadsheetId,
        valueInputOption: 'USER_ENTERED'
      });
    }
  };
}
