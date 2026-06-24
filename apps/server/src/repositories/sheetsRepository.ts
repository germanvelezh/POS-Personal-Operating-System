import type { z } from 'zod';

import {
  activityLogSchema,
  calculateIdeaPriorityScore,
  type EntityConfig,
  type EntityKey,
  type EntityRecord,
  type EntitySchemaMap
} from '../schemas/entities.js';
import { getSheetDefinition } from '../setup/sheetDefinitions.js';
import { createEntityId } from '../utils/ids.js';
import { recordToRow, rowToRecord } from './sheetsMapper.js';

export type SheetRow = {
  rowNumber: number;
  values: string[];
};

export type SheetsTableGateway = {
  appendRow: (sheetName: string, values: string[]) => Promise<void>;
  listRows: (sheetName: string) => Promise<SheetRow[]>;
  updateRow: (sheetName: string, rowNumber: number, values: string[]) => Promise<void>;
};

export type RepositoryActionOptions = {
  actor?: string;
};

export type RepositoryListOptions = {
  includeDeleted?: boolean;
};

export type RepositoryRuntimeOptions = {
  idGenerator?: (prefix: string) => string;
  now?: () => Date;
};

type ParsedRow<TKey extends EntityKey> = {
  record: EntityRecord<TKey>;
  rowNumber: number;
};

function nowIso(now: () => Date) {
  return now().toISOString();
}

function getRequiredDefinition(sheetName: string) {
  const definition = getSheetDefinition(sheetName);

  if (!definition) {
    throw new Error(`Missing sheet definition for ${sheetName}.`);
  }

  return definition;
}

function hasValue(value: unknown) {
  return value !== '' && value !== null && value !== undefined;
}

function toNumber(value: unknown) {
  if (!hasValue(value)) {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function withSystemFields<TKey extends EntityKey>(
  config: EntityConfig<TKey>,
  record: Record<string, unknown>,
  timestamp: string,
  idGenerator: (prefix: string) => string,
  mode: 'create' | 'update'
) {
  const next = { ...record };

  if (!hasValue(next[config.idField])) {
    next[config.idField] = idGenerator(config.idPrefix);
  }

  if (mode === 'create') {
    if (!hasValue(next.fecha_creacion)) {
      next.fecha_creacion = timestamp;
    }

    if (!hasValue(next.fecha_captura)) {
      next.fecha_captura = timestamp;
    }

    if (!hasValue(next.fecha)) {
      next.fecha = timestamp;
    }
  }

  if ('fecha_actualizacion' in next || mode === 'create') {
    next.fecha_actualizacion = timestamp;
  }

  if (config.sheetName === 'Ideas') {
    const impacto = toNumber(next.impacto);
    const dineroPotencial = toNumber(next.dinero_potencial);
    const urgencia = toNumber(next.urgencia);
    const esfuerzo = toNumber(next.esfuerzo);

    if (
      impacto !== undefined &&
      dineroPotencial !== undefined &&
      urgencia !== undefined &&
      esfuerzo !== undefined
    ) {
      next.score_prioridad = calculateIdeaPriorityScore({
        dinero_potencial: dineroPotencial,
        esfuerzo,
        impacto,
        urgencia
      });
    }
  }

  return next;
}

export class SheetEntityRepository<TKey extends EntityKey> {
  private readonly definition;
  private readonly idGenerator: (prefix: string) => string;
  private readonly now: () => Date;

  constructor(
    private readonly gateway: SheetsTableGateway,
    private readonly key: TKey,
    private readonly config: EntityConfig<TKey>,
    private readonly schema: EntitySchemaMap[TKey],
    options: RepositoryRuntimeOptions = {}
  ) {
    this.definition = getRequiredDefinition(config.sheetName);
    this.idGenerator = options.idGenerator ?? ((prefix) => createEntityId(prefix));
    this.now = options.now ?? (() => new Date());
  }

  async list(options: RepositoryListOptions = {}) {
    const parsedRows = await this.listParsedRows();
    const records = parsedRows.map((row) => row.record);

    if (options.includeDeleted) {
      return records;
    }

    return records.filter((record) => !this.isDeleted(record));
  }

  async get(id: string) {
    const row = await this.findRow(id);

    if (!row) {
      throw new Error(`${this.config.sheetName} record not found: ${id}`);
    }

    return row.record;
  }

  async create(
    input: Partial<EntityRecord<TKey>>,
    options: RepositoryActionOptions = {}
  ) {
    const timestamp = nowIso(this.now);
    const candidate = withSystemFields(
      this.config,
      input as Record<string, unknown>,
      timestamp,
      this.idGenerator,
      'create'
    );
    const record = this.parse(candidate);

    await this.gateway.appendRow(
      this.config.sheetName,
      recordToRow(this.definition.headers, record as Record<string, unknown>)
    );
    await this.logActivity(
      'created',
      String((record as Record<string, unknown>)[this.config.idField]),
      options.actor
    );

    return record;
  }

  async update(
    id: string,
    patch: Partial<EntityRecord<TKey>>,
    options: RepositoryActionOptions = {}
  ) {
    const row = await this.findRow(id);

    if (!row) {
      throw new Error(`${this.config.sheetName} record not found: ${id}`);
    }

    const timestamp = nowIso(this.now);
    const candidate = withSystemFields(
      this.config,
      { ...(row.record as Record<string, unknown>), ...(patch as Record<string, unknown>) },
      timestamp,
      this.idGenerator,
      'update'
    );
    const record = this.parse(candidate);

    await this.gateway.updateRow(
      this.config.sheetName,
      row.rowNumber,
      recordToRow(this.definition.headers, record as Record<string, unknown>)
    );
    await this.logActivity('updated', id, options.actor);

    return record;
  }

  async delete(id: string, options: RepositoryActionOptions = {}) {
    const row = await this.findRow(id);

    if (!row) {
      throw new Error(`${this.config.sheetName} record not found: ${id}`);
    }

    if (!this.config.deletePatch) {
      throw new Error(`${this.config.sheetName} does not define a logical delete patch.`);
    }

    const timestamp = nowIso(this.now);
    const candidate = withSystemFields(
      this.config,
      {
        ...(row.record as Record<string, unknown>),
        ...this.config.deletePatch
      },
      timestamp,
      this.idGenerator,
      'update'
    );
    const record = this.parse(candidate);

    await this.gateway.updateRow(
      this.config.sheetName,
      row.rowNumber,
      recordToRow(this.definition.headers, record as Record<string, unknown>)
    );
    await this.logActivity('deleted', id, options.actor);

    return record;
  }

  private async findRow(id: string): Promise<ParsedRow<TKey> | null> {
    const rows = await this.listParsedRows();

    return (
      rows.find(
        (row) => String((row.record as Record<string, unknown>)[this.config.idField]) === id
      ) ?? null
    );
  }

  private isDeleted(record: EntityRecord<TKey>) {
    const state = String((record as Record<string, unknown>).estado ?? '');

    return Boolean(this.config.deletedStates?.includes(state));
  }

  private async listParsedRows(): Promise<Array<ParsedRow<TKey>>> {
    const rows = await this.gateway.listRows(this.config.sheetName);

    return rows
      .filter((row) => row.values.some((value) => value.trim() !== ''))
      .map((row) => ({
        record: this.parse(rowToRecord(this.definition.headers, row.values)),
        rowNumber: row.rowNumber
      }));
  }

  private async logActivity(action: string, entityId: string, actor = 'Germán') {
    if (this.config.logActivity === false || this.key === 'activityLog') {
      return;
    }

    const definition = getRequiredDefinition('Log_Actividad');
    const timestamp = nowIso(this.now);
    const activity = activityLogSchema.parse({
      accion: action,
      descripcion: `${action} ${this.config.sheetName}`,
      entidad_id: entityId,
      entidad_tipo: this.config.sheetName,
      error: '',
      fecha: timestamp,
      log_id: this.idGenerator('LOG'),
      resultado: 'success',
      usuario: actor
    });

    await this.gateway.appendRow(
      'Log_Actividad',
      recordToRow(definition.headers, activity)
    );
  }

  private parse(record: Record<string, unknown>) {
    return (this.schema as z.ZodType<EntityRecord<TKey>>).parse(record);
  }
}
