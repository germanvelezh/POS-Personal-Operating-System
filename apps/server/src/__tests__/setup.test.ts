import {
  MASTER_SPREADSHEET_NAME,
  ROOT_FOLDER_NAME,
  SHEET_DEFINITIONS,
  type SheetDefinition
} from '../setup/sheetDefinitions.js';
import {
  initializeStartupOs,
  type StartupOsSetupAdapter
} from '../setup/initialize.js';

function createFakeAdapter(overrides: Partial<StartupOsSetupAdapter> = {}) {
  const records = new Map<string, Record<string, string>[]>();
  const calls = {
    appendRecord: [] as Array<{ sheetName: string; record: Record<string, string> }>,
    ensureSheetStructure: [] as typeof SHEET_DEFINITIONS[],
    upsertConfiguration: [] as Record<string, string>[][]
  };

  const adapter: StartupOsSetupAdapter = {
    findDriveFolderByName: vi.fn(async () => null),
    createDriveFolder: vi.fn(async () => ({
      id: 'folder-1',
      name: ROOT_FOLDER_NAME,
      url: 'https://drive.google.com/drive/folders/folder-1'
    })),
    findSpreadsheetByName: vi.fn(async () => null),
    createSpreadsheet: vi.fn(async () => ({
      id: 'sheet-1',
      name: MASTER_SPREADSHEET_NAME,
      url: 'https://docs.google.com/spreadsheets/d/sheet-1/edit'
    })),
    ensureSheetStructure: vi.fn(async (_spreadsheetId, definitions: SheetDefinition[]) => {
      calls.ensureSheetStructure.push(definitions);
      return {
        createdSheets: definitions.map((definition) => definition.name),
        headersWritten: definitions.map((definition) => definition.name),
        renamedDefaultSheet: true
      };
    }),
    listRecords: vi.fn(async (_spreadsheetId, sheetName) => records.get(sheetName) ?? []),
    appendRecord: vi.fn(async (_spreadsheetId, sheetName, record) => {
      calls.appendRecord.push({ sheetName, record });
      records.set(sheetName, [...(records.get(sheetName) ?? []), record]);
    }),
    upsertConfiguration: vi.fn(async (_spreadsheetId, configRecords) => {
      calls.upsertConfiguration.push(configRecords);
    }),
    ...overrides
  };

  return { adapter, calls, records };
}

describe('Startup OS setup model', () => {
  it('defines the 20 canonical Google Sheets with required MVP headers', () => {
    expect(SHEET_DEFINITIONS.map((definition) => definition.name)).toEqual([
      'Clientes',
      'Contactos',
      'Ideas',
      'Necesidades',
      'Investigaciones',
      'Validaciones',
      'Oportunidades',
      'Propuestas',
      'Contratos',
      'Proyectos',
      'Hitos',
      'Tareas',
      'Facturas',
      'Pagos',
      'Resultados',
      'Aprendizajes',
      'Documentos',
      'Relaciones',
      'Configuracion',
      'Log_Actividad'
    ]);
    expect(SHEET_DEFINITIONS.find((definition) => definition.name === 'Clientes')?.headers)
      .toEqual([
        'cliente_id',
        'tipo_cliente',
        'nombre',
        'naturaleza',
        'estado',
        'email_principal',
        'celular_principal',
        'datos_facturacion',
        'notas',
        'drive_folder_id',
        'drive_folder_url',
        'proxima_accion',
        'fecha_creacion',
        'fecha_actualizacion'
      ]);
    expect(SHEET_DEFINITIONS.find((definition) => definition.name === 'Configuracion')?.headers)
      .toEqual(['clave', 'valor', 'descripcion', 'fecha_actualizacion']);
    expect(SHEET_DEFINITIONS.find((definition) => definition.name === 'Log_Actividad')?.headers)
      .toEqual([
        'log_id',
        'fecha',
        'usuario',
        'accion',
        'entidad_tipo',
        'entidad_id',
        'descripcion',
        'resultado',
        'error'
      ]);
  });
});

describe('initializeStartupOs', () => {
  it('creates the root Drive folder, master Sheet, canonical sheets, internal client and config', async () => {
    const { adapter, calls } = createFakeAdapter();

    const result = await initializeStartupOs(adapter, {
      now: () => new Date('2026-06-23T14:00:00.000Z'),
      randomSuffix: () => 'A1B2'
    });

    expect(adapter.createDriveFolder).toHaveBeenCalledWith(ROOT_FOLDER_NAME);
    expect(adapter.createSpreadsheet).toHaveBeenCalledWith(MASTER_SPREADSHEET_NAME, 'folder-1');
    expect(calls.ensureSheetStructure[0]).toEqual(SHEET_DEFINITIONS);
    expect(calls.appendRecord).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sheetName: 'Clientes',
          record: expect.objectContaining({
            cliente_id: 'CLI-20260623-A1B2',
            tipo_cliente: 'interno',
            nombre: 'Germán / Startup Interna',
            naturaleza: 'persona',
            estado: 'activo'
          })
        }),
        expect.objectContaining({
          sheetName: 'Log_Actividad',
          record: expect.objectContaining({
            accion: 'setup_initialized',
            entidad_tipo: 'sistema',
            resultado: 'success'
          })
        })
      ])
    );
    expect(calls.upsertConfiguration[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ clave: 'MASTER_SHEET_ID', valor: 'sheet-1' }),
        expect.objectContaining({ clave: 'DRIVE_ROOT_FOLDER_ID', valor: 'folder-1' }),
        expect.objectContaining({ clave: 'CLIENTE_INTERNO_ID', valor: 'CLI-20260623-A1B2' })
      ])
    );
    expect(result).toMatchObject({
      initialized: true,
      rootFolderId: 'folder-1',
      masterSheetId: 'sheet-1',
      internalClientId: 'CLI-20260623-A1B2',
      created: {
        rootFolder: true,
        masterSheet: true,
        internalClient: true
      }
    });
  });

  it('reuses existing Drive, Sheet and internal client records', async () => {
    const { adapter, calls, records } = createFakeAdapter({
      findDriveFolderByName: vi.fn(async () => ({
        id: 'folder-existing',
        name: ROOT_FOLDER_NAME,
        url: 'https://drive.google.com/drive/folders/folder-existing'
      })),
      findSpreadsheetByName: vi.fn(async () => ({
        id: 'sheet-existing',
        name: MASTER_SPREADSHEET_NAME,
        url: 'https://docs.google.com/spreadsheets/d/sheet-existing/edit'
      }))
    });
    records.set('Clientes', [
      {
        cliente_id: 'CLI-20260601-Z9Y8',
        tipo_cliente: 'interno',
        nombre: 'Germán / Startup Interna'
      }
    ]);

    const result = await initializeStartupOs(adapter, {
      now: () => new Date('2026-06-23T14:00:00.000Z'),
      randomSuffix: () => 'A1B2'
    });

    expect(adapter.createDriveFolder).not.toHaveBeenCalled();
    expect(adapter.createSpreadsheet).not.toHaveBeenCalled();
    expect(calls.appendRecord.some((call) => call.sheetName === 'Clientes')).toBe(false);
    expect(result).toMatchObject({
      rootFolderId: 'folder-existing',
      masterSheetId: 'sheet-existing',
      internalClientId: 'CLI-20260601-Z9Y8',
      created: {
        rootFolder: false,
        masterSheet: false,
        internalClient: false
      }
    });
  });
});
