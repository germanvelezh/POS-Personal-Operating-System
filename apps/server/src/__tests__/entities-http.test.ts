import { describe, expect, it, vi } from 'vitest';

import type { GoogleAuthConfig } from '../auth/config.js';
import { createSessionCookie, type AuthSession } from '../auth/session.js';
import {
  buildEntityCollectionResponse,
  buildEntityItemResponse,
  type EntityRepositoriesFactory
} from '../entities/http.js';

const source = {
  ALLOWED_GOOGLE_EMAIL: 'germanvelezh@gmail.com',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'https://app.example.com/auth/google/callback',
  PUBLIC_APP_URL: 'https://app.example.com',
  SESSION_SECRET: 'x'.repeat(32)
};

const session: AuthSession = {
  accessToken: 'access-token',
  connectedAt: '2026-06-24T00:00:00.000Z',
  email: 'germanvelezh@gmail.com',
  expiryDate: 1782260000000,
  name: 'German Velez',
  refreshToken: 'refresh-token'
};

const cookieHeader = createSessionCookie(
  session,
  {
    allowedGoogleEmail: 'germanvelezh@gmail.com',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    cookies: {
      sameSite: 'Lax',
      secure: true
    },
    publicAppUrl: 'https://app.example.com',
    redirectUri: 'https://app.example.com/auth/google/callback',
    scopes: [],
    sessionSecret: 'x'.repeat(32)
  } satisfies GoogleAuthConfig
);

function createFakeRepositories() {
  const clients = {
    create: vi.fn(async (body) => ({
      cliente_id: 'CLI-20260624-ABCD',
      estado: 'prospecto',
      fecha_actualizacion: '2026-06-24T00:00:00.000Z',
      fecha_creacion: '2026-06-24T00:00:00.000Z',
      naturaleza: 'empresa',
      nombre: body.nombre,
      tipo_cliente: 'externo'
    })),
    delete: vi.fn(async (id) => ({ cliente_id: id, estado: 'inactivo', nombre: 'Acme SAS' })),
    get: vi.fn(async (id) => ({ cliente_id: id, estado: 'activo', nombre: 'Acme SAS' })),
    list: vi.fn(async () => [
      { cliente_id: 'CLI-1', estado: 'activo', nombre: 'Acme SAS' },
      { cliente_id: 'CLI-2', estado: 'prospecto', nombre: 'Nova Labs' }
    ]),
    update: vi.fn(async (id, patch) => ({
      cliente_id: id,
      estado: 'activo',
      nombre: patch.nombre
    }))
  };
  const configuration = {
    get: vi.fn(async () => ({ clave: 'CLIENTE_INTERNO_ID', valor: 'CLI-INTERNAL' }))
  };
  const ideas = {
    create: vi.fn(async (body) => ({
      cliente_id: body.cliente_id,
      descripcion: body.descripcion,
      estado: body.estado,
      idea_id: 'IDE-20260624-ABCD',
      titulo: body.titulo
    })),
    delete: vi.fn(),
    get: vi.fn(),
    list: vi.fn(async () => []),
    update: vi.fn()
  };

  return {
    activityLog: {},
    clients,
    configuration,
    contacts: {},
    contracts: {},
    documents: {},
    ideas,
    invoices: {},
    learnings: {},
    milestones: {},
    needs: {},
    opportunities: {},
    payments: {},
    projects: {},
    proposals: {},
    relations: {},
    research: {},
    results: {},
    tasks: {},
    validations: {}
  };
}

describe('entity HTTP handlers', () => {
  it('rejects CRUD requests when Google is not connected', async () => {
    const response = await buildEntityCollectionResponse({
      cookieHeader: undefined,
      entity: 'clients',
      method: 'GET',
      source
    });

    expect(response).toMatchObject({
      body: { error: 'google_not_connected' },
      status: 401
    });
  });

  it('lists records with search and status filters', async () => {
    const repositories = createFakeRepositories();
    const factory: EntityRepositoriesFactory = vi.fn(async () => repositories as never);

    const response = await buildEntityCollectionResponse({
      cookieHeader,
      entity: 'clients',
      method: 'GET',
      query: { search: 'acme', status: 'activo' },
      repositoriesFactory: factory,
      source
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      entity: 'clients',
      records: [{ cliente_id: 'CLI-1', estado: 'activo', nombre: 'Acme SAS' }]
    });
  });

  it('creates clients with defaults and activity options', async () => {
    const repositories = createFakeRepositories();
    const factory: EntityRepositoriesFactory = vi.fn(async () => repositories as never);

    const response = await buildEntityCollectionResponse({
      body: { nombre: 'Acme SAS' },
      cookieHeader,
      entity: 'clients',
      method: 'POST',
      repositoriesFactory: factory,
      source
    });

    expect(response.status).toBe(201);
    expect(repositories.clients.create).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'prospecto',
        naturaleza: 'empresa',
        nombre: 'Acme SAS',
        tipo_cliente: 'externo'
      }),
      { actor: 'Germán' }
    );
  });

  it('uses the internal client for ideas without an external client', async () => {
    const repositories = createFakeRepositories();
    const factory: EntityRepositoriesFactory = vi.fn(async () => repositories as never);

    const response = await buildEntityCollectionResponse({
      body: {
        descripcion: 'Automatizar reportes',
        titulo: 'Reporte semanal automático'
      },
      cookieHeader,
      entity: 'ideas',
      method: 'POST',
      repositoriesFactory: factory,
      source
    });

    expect(response.status).toBe(201);
    expect(repositories.ideas.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cliente_id: 'CLI-INTERNAL',
        estado: 'capturada',
        origen: 'idea_suelta',
        tipo: 'otro'
      }),
      { actor: 'Germán' }
    );
  });

  it('gets, updates and deletes item records', async () => {
    const repositories = createFakeRepositories();
    const factory: EntityRepositoriesFactory = vi.fn(async () => repositories as never);

    await expect(
      buildEntityItemResponse({
        cookieHeader,
        entity: 'clients',
        id: 'CLI-1',
        method: 'GET',
        repositoriesFactory: factory,
        source
      })
    ).resolves.toMatchObject({
      body: { record: { cliente_id: 'CLI-1', nombre: 'Acme SAS' } },
      status: 200
    });

    await buildEntityItemResponse({
      body: { nombre: 'Acme Updated' },
      cookieHeader,
      entity: 'clients',
      id: 'CLI-1',
      method: 'PUT',
      repositoriesFactory: factory,
      source
    });
    await buildEntityItemResponse({
      cookieHeader,
      entity: 'clients',
      id: 'CLI-1',
      method: 'DELETE',
      repositoriesFactory: factory,
      source
    });

    expect(repositories.clients.update).toHaveBeenCalledWith(
      'CLI-1',
      { nombre: 'Acme Updated' },
      { actor: 'Germán' }
    );
    expect(repositories.clients.delete).toHaveBeenCalledWith('CLI-1', { actor: 'Germán' });
  });
});
