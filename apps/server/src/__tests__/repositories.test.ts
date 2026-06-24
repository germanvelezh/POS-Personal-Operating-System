import { describe, expect, it } from 'vitest';

import {
  calculateIdeaPriorityScore,
  entityConfigs,
  entitySchemas
} from '../schemas/entities.js';
import {
  createEntityRepositories,
  type SheetsTableGateway
} from '../repositories/entityRepositories.js';
import { createEntityId } from '../utils/ids.js';

class MemorySheetsGateway implements SheetsTableGateway {
  rows = new Map<string, string[][]>();
  updates: Array<{ rowNumber: number; sheetName: string; values: string[] }> = [];

  async listRows(sheetName: string) {
    return (this.rows.get(sheetName) ?? []).map((values, index) => ({
      rowNumber: index + 2,
      values
    }));
  }

  async appendRow(sheetName: string, values: string[]) {
    this.rows.set(sheetName, [...(this.rows.get(sheetName) ?? []), values]);
  }

  async updateRow(sheetName: string, rowNumber: number, values: string[]) {
    const rows = [...(this.rows.get(sheetName) ?? [])];

    rows[rowNumber - 2] = values;
    this.rows.set(sheetName, rows);
    this.updates.push({ rowNumber, sheetName, values });
  }
}

describe('entity configs and schemas', () => {
  it('registers all canonical Google Sheets as entity repositories', () => {
    expect(Object.keys(entityConfigs)).toEqual([
      'clients',
      'contacts',
      'ideas',
      'needs',
      'research',
      'validations',
      'opportunities',
      'proposals',
      'contracts',
      'projects',
      'milestones',
      'tasks',
      'invoices',
      'payments',
      'results',
      'learnings',
      'documents',
      'relations',
      'configuration',
      'activityLog'
    ]);

    expect(entityConfigs.clients).toMatchObject({
      idField: 'cliente_id',
      idPrefix: 'CLI',
      sheetName: 'Clientes'
    });
    expect(entityConfigs.tasks).toMatchObject({
      idField: 'tarea_id',
      idPrefix: 'TAR',
      sheetName: 'Tareas'
    });
    expect(entityConfigs.configuration).toMatchObject({
      idField: 'clave',
      idPrefix: 'CFG',
      sheetName: 'Configuracion'
    });
  });

  it('validates critical business rules with Zod schemas', () => {
    expect(() =>
      entitySchemas.clients.parse({
        cliente_id: 'CLI-20260624-AAAA',
        tipo_cliente: 'externo',
        nombre: 'Acme SAS',
        naturaleza: 'empresa',
        estado: 'prospecto',
        fecha_creacion: '2026-06-24T00:00:00.000Z',
        fecha_actualizacion: '2026-06-24T00:00:00.000Z'
      })
    ).not.toThrow();

    expect(() =>
      entitySchemas.tasks.parse({
        tarea_id: 'TAR-20260624-AAAA',
        titulo: 'Sin proyecto',
        tipo: 'tarea',
        estado: 'pendiente',
        prioridad: 'alta',
        responsable: 'Germán',
        fecha_creacion: '2026-06-24T00:00:00.000Z',
        fecha_actualizacion: '2026-06-24T00:00:00.000Z'
      })
    ).toThrow();

    expect(() =>
      entitySchemas.invoices.parse({
        factura_id: 'FAC-20260624-AAAA',
        concepto: 'Implementación',
        modalidad: 'proyecto_cerrado',
        valor: '1200000',
        moneda: 'COP',
        estado: 'por_facturar',
        fecha_creacion: '2026-06-24T00:00:00.000Z',
        fecha_actualizacion: '2026-06-24T00:00:00.000Z'
      })
    ).toThrow();

    expect(() =>
      entitySchemas.configuration.parse({
        clave: 'TEMPLATE_IDEA_BRIEF_ID',
        descripcion: 'Plantilla pendiente de configurar.',
        fecha_actualizacion: '2026-06-24T00:00:00.000Z',
        valor: ''
      })
    ).not.toThrow();
  });

  it('calculates idea priority score from the MVP formula', () => {
    expect(
      calculateIdeaPriorityScore({
        dinero_potencial: 5,
        esfuerzo: 2,
        impacto: 4,
        urgencia: 3
      })
    ).toBe(4.15);
  });
});

describe('entity repositories over Sheets rows', () => {
  it('creates records with IDs, timestamps, row mapping and activity logs', async () => {
    const gateway = new MemorySheetsGateway();
    const repositories = createEntityRepositories(gateway, {
      idGenerator: () => 'CLI-20260624-ABCD',
      now: () => new Date('2026-06-24T10:30:00.000Z')
    });

    const client = await repositories.clients.create(
      {
        estado: 'prospecto',
        naturaleza: 'empresa',
        nombre: 'Acme SAS',
        tipo_cliente: 'externo'
      },
      { actor: 'Germán' }
    );

    expect(client).toMatchObject({
      cliente_id: 'CLI-20260624-ABCD',
      fecha_actualizacion: '2026-06-24T10:30:00.000Z',
      fecha_creacion: '2026-06-24T10:30:00.000Z',
      nombre: 'Acme SAS'
    });
    expect(gateway.rows.get('Clientes')?.[0]).toEqual([
      'CLI-20260624-ABCD',
      'externo',
      'Acme SAS',
      'empresa',
      'prospecto',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '2026-06-24T10:30:00.000Z',
      '2026-06-24T10:30:00.000Z'
    ]);
    expect(gateway.rows.get('Log_Actividad')?.[0]).toEqual(
      expect.arrayContaining(['created', 'Clientes', 'CLI-20260624-ABCD', 'success'])
    );
  });

  it('lists, gets, updates and logically deletes existing records by ID', async () => {
    const gateway = new MemorySheetsGateway();
    gateway.rows.set('Clientes', [
      [
        'CLI-20260624-ABCD',
        'externo',
        'Acme SAS',
        'empresa',
        'activo',
        '',
        '',
        '',
        '',
        '',
        '',
        'Llamar el viernes',
        '2026-06-24T10:30:00.000Z',
        '2026-06-24T10:30:00.000Z'
      ]
    ]);
    const repositories = createEntityRepositories(gateway, {
      idGenerator: () => 'LOG-20260624-0001',
      now: () => new Date('2026-06-24T12:00:00.000Z')
    });

    await expect(repositories.clients.get('CLI-20260624-ABCD')).resolves.toMatchObject({
      nombre: 'Acme SAS'
    });
    await expect(repositories.clients.list()).resolves.toHaveLength(1);

    const updated = await repositories.clients.update('CLI-20260624-ABCD', {
      proxima_accion: 'Enviar propuesta'
    });

    expect(updated).toMatchObject({
      fecha_actualizacion: '2026-06-24T12:00:00.000Z',
      proxima_accion: 'Enviar propuesta'
    });
    expect(gateway.updates[0]).toMatchObject({
      rowNumber: 2,
      sheetName: 'Clientes'
    });

    const deleted = await repositories.clients.delete('CLI-20260624-ABCD');

    expect(deleted.estado).toBe('inactivo');
    await expect(repositories.clients.list()).resolves.toHaveLength(0);
    await expect(repositories.clients.list({ includeDeleted: true })).resolves.toHaveLength(1);
  });

  it('computes idea score before persisting ideas', async () => {
    const gateway = new MemorySheetsGateway();
    const repositories = createEntityRepositories(gateway, {
      idGenerator: () => 'IDE-20260624-ABCD',
      now: () => new Date('2026-06-24T10:30:00.000Z')
    });

    const idea = await repositories.ideas.create({
      cliente_id: 'CLI-20260624-INTR',
      descripcion: 'Automatizar el reporte semanal',
      dinero_potencial: 5,
      esfuerzo: 2,
      estado: 'capturada',
      impacto: 4,
      origen: 'idea_suelta',
      tipo: 'automatizacion',
      titulo: 'Reporte semanal automático',
      urgencia: 3
    });

    expect(idea.score_prioridad).toBe(4.15);
    expect(gateway.rows.get('Ideas')?.[0]?.[15]).toBe('4.15');
  });
});

describe('entity ID generation', () => {
  it('creates readable daily IDs with deterministic suffixes', () => {
    expect(
      createEntityId('CLI', {
        now: () => new Date('2026-06-24T10:30:00.000Z'),
        randomSuffix: () => 'a1b2'
      })
    ).toBe('CLI-20260624-A1B2');
  });

  it('uses cryptographic random suffixes by default', () => {
    expect(createEntityId('IDE')).toMatch(/^IDE-\d{8}-[A-Z0-9]{4}$/);
  });
});
