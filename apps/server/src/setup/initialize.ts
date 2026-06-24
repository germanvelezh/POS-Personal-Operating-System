import {
  INTERNAL_CLIENT_NAME,
  MASTER_SPREADSHEET_NAME,
  ROOT_FOLDER_NAME,
  SHEET_DEFINITIONS,
  type SheetDefinition
} from './sheetDefinitions.js';

export type DriveResource = {
  id: string;
  name: string;
  url: string;
};

export type SheetStructureResult = {
  createdSheets: string[];
  headersWritten: string[];
  renamedDefaultSheet: boolean;
};

export type StartupOsSetupAdapter = {
  findDriveFolderByName: (name: string) => Promise<DriveResource | null>;
  createDriveFolder: (name: string) => Promise<DriveResource>;
  findSpreadsheetByName: (name: string) => Promise<DriveResource | null>;
  createSpreadsheet: (name: string, parentFolderId: string) => Promise<DriveResource>;
  ensureSheetStructure: (
    spreadsheetId: string,
    definitions: SheetDefinition[]
  ) => Promise<SheetStructureResult>;
  listRecords: (spreadsheetId: string, sheetName: string) => Promise<Record<string, string>[]>;
  appendRecord: (
    spreadsheetId: string,
    sheetName: string,
    record: Record<string, string>
  ) => Promise<void>;
  upsertConfiguration: (
    spreadsheetId: string,
    records: Record<string, string>[]
  ) => Promise<void>;
};

export type InitializeStartupOsOptions = {
  now?: () => Date;
  randomSuffix?: () => string;
};

export type StartupOsSetupResult = {
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
  sheets: SheetStructureResult;
};

function formatDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '');
}

function formatIso(date: Date) {
  return date.toISOString();
}

function createDefaultSuffix() {
  return Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
}

function createEntityId(prefix: string, date: Date, randomSuffix: () => string) {
  return `${prefix}-${formatDateStamp(date)}-${randomSuffix().toUpperCase()}`;
}

function createConfigRecord(clave: string, valor: string, descripcion: string, timestamp: string) {
  return {
    clave,
    valor,
    descripcion,
    fecha_actualizacion: timestamp
  };
}

function createTemplateConfigRecords(timestamp: string) {
  return [
    createConfigRecord('TEMPLATE_IDEA_BRIEF_ID', '', 'ID plantilla Google Docs para briefs de idea.', timestamp),
    createConfigRecord('TEMPLATE_RESEARCH_ID', '', 'ID plantilla Google Docs para investigaciones.', timestamp),
    createConfigRecord('TEMPLATE_PROJECT_BRIEF_ID', '', 'ID plantilla Google Docs para briefs de proyecto.', timestamp),
    createConfigRecord('TEMPLATE_INVOICE_ID', '', 'ID plantilla Google Docs para facturas.', timestamp),
    createConfigRecord('TEMPLATE_WEEKLY_REPORT_ID', '', 'ID plantilla Google Docs para reportes semanales.', timestamp)
  ];
}

function findInternalClient(records: Record<string, string>[]) {
  return records.find(
    (record) =>
      record.tipo_cliente === 'interno' &&
      (record.nombre ?? '').trim().toLowerCase() === INTERNAL_CLIENT_NAME.toLowerCase()
  );
}

export async function initializeStartupOs(
  adapter: StartupOsSetupAdapter,
  options: InitializeStartupOsOptions = {}
): Promise<StartupOsSetupResult> {
  const now = options.now?.() ?? new Date();
  const timestamp = formatIso(now);
  const randomSuffix = options.randomSuffix ?? createDefaultSuffix;

  let rootFolder = await adapter.findDriveFolderByName(ROOT_FOLDER_NAME);
  const rootFolderCreated = !rootFolder;

  if (!rootFolder) {
    rootFolder = await adapter.createDriveFolder(ROOT_FOLDER_NAME);
  }

  let masterSheet = await adapter.findSpreadsheetByName(MASTER_SPREADSHEET_NAME);
  const masterSheetCreated = !masterSheet;

  if (!masterSheet) {
    masterSheet = await adapter.createSpreadsheet(MASTER_SPREADSHEET_NAME, rootFolder.id);
  }

  const sheets = await adapter.ensureSheetStructure(masterSheet.id, SHEET_DEFINITIONS);
  const clients = await adapter.listRecords(masterSheet.id, 'Clientes');
  const existingInternalClient = findInternalClient(clients);
  const internalClientId =
    existingInternalClient?.cliente_id ?? createEntityId('CLI', now, randomSuffix);
  const internalClientCreated = !existingInternalClient;

  if (internalClientCreated) {
    await adapter.appendRecord(masterSheet.id, 'Clientes', {
      cliente_id: internalClientId,
      tipo_cliente: 'interno',
      nombre: INTERNAL_CLIENT_NAME,
      naturaleza: 'persona',
      estado: 'activo',
      email_principal: '',
      celular_principal: '',
      datos_facturacion: '',
      notas: 'Cliente interno para ideas y proyectos sin cliente externo.',
      drive_folder_id: rootFolder.id,
      drive_folder_url: rootFolder.url,
      proxima_accion: '',
      fecha_creacion: timestamp,
      fecha_actualizacion: timestamp
    });
  }

  await adapter.upsertConfiguration(masterSheet.id, [
    createConfigRecord('MASTER_SHEET_ID', masterSheet.id, 'ID del Google Sheet maestro.', timestamp),
    createConfigRecord('MASTER_SHEET_URL', masterSheet.url, 'URL del Google Sheet maestro.', timestamp),
    createConfigRecord('DRIVE_ROOT_FOLDER_ID', rootFolder.id, 'ID de la carpeta raíz Drive.', timestamp),
    createConfigRecord('DRIVE_ROOT_FOLDER_URL', rootFolder.url, 'URL de la carpeta raíz Drive.', timestamp),
    createConfigRecord('CLIENTE_INTERNO_ID', internalClientId, 'ID del cliente interno Germán / Startup Interna.', timestamp),
    createConfigRecord('CLIENTE_INTERNO_NOMBRE', INTERNAL_CLIENT_NAME, 'Nombre del cliente interno.', timestamp),
    createConfigRecord('SETUP_INITIALIZED_AT', timestamp, 'Última inicialización ejecutada.', timestamp),
    ...createTemplateConfigRecords(timestamp)
  ]);

  await adapter.appendRecord(masterSheet.id, 'Log_Actividad', {
    log_id: createEntityId('LOG', now, randomSuffix),
    fecha: timestamp,
    usuario: 'Germán',
    accion: 'setup_initialized',
    entidad_tipo: 'sistema',
    entidad_id: masterSheet.id,
    descripcion: 'Inicialización de Startup OS en Google Workspace.',
    resultado: 'success',
    error: ''
  });

  return {
    initialized: true,
    rootFolderId: rootFolder.id,
    rootFolderUrl: rootFolder.url,
    masterSheetId: masterSheet.id,
    masterSheetUrl: masterSheet.url,
    internalClientId,
    created: {
      rootFolder: rootFolderCreated,
      masterSheet: masterSheetCreated,
      internalClient: internalClientCreated
    },
    sheets
  };
}
