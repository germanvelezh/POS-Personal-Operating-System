import { describe, expect, it, vi } from 'vitest';

import type { GoogleAuthConfig } from '../auth/config.js';
import { createSessionCookie, type AuthSession } from '../auth/session.js';
import {
  buildWorkspaceResponse,
  type WorkspaceAdapterFactory,
  type WorkspaceRepositoriesFactory
} from '../workspace/http.js';

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

function createWorkspaceAdapter() {
  return {
    createDocument: vi.fn(async () => ({
      id: 'doc-1',
      name: 'Brief - Proyecto A',
      url: 'https://docs.google.com/document/d/doc-1/edit'
    })),
    ensureFolder: vi.fn(async () => ({
      id: 'folder-1',
      name: 'Cliente - Acme SAS',
      url: 'https://drive.google.com/drive/folders/folder-1'
    }))
  };
}

function createRepositories() {
  return {
    activityLog: {
      list: vi.fn(async () => [])
    },
    clients: {
      get: vi.fn(async (id) => ({
        cliente_id: id,
        drive_folder_id: '',
        drive_folder_url: '',
        estado: 'activo',
        nombre: 'Acme SAS'
      })),
      update: vi.fn(async (id, patch) => ({
        cliente_id: id,
        estado: 'activo',
        nombre: 'Acme SAS',
        ...patch
      }))
    },
    configuration: {
      get: vi.fn(async (key) => ({
        clave: key,
        valor:
          key === 'DRIVE_ROOT_FOLDER_ID'
            ? 'root-folder'
            : key === 'TEMPLATE_PROJECT_BRIEF_ID'
              ? 'template-project'
              : ''
      }))
    },
    documents: {
      create: vi.fn(async (body) => ({
        documento_id: 'DOC-1',
        fecha_creacion: '2026-06-24T00:00:00.000Z',
        ...body
      })),
      list: vi.fn(async () => [
        {
          documento_id: 'DOC-1',
          google_doc_url: 'https://docs.google.com/document/d/doc-1/edit',
          titulo: 'Brief - Proyecto A',
          tipo: 'proyecto_brief'
        }
      ])
    },
    ideas: {
      get: vi.fn(async (id) => ({
        cliente_id: 'CLI-1',
        descripcion: 'Automatizar el reporte semanal',
        estado: 'capturada',
        idea_id: id,
        proxima_accion: 'Validar con cliente',
        titulo: 'Reporte semanal'
      })),
      update: vi.fn(async (id, patch) => ({ idea_id: id, ...patch }))
    },
    invoices: {
      get: vi.fn(async (id) => ({
        cliente_id: 'CLI-1',
        concepto: 'Implementación Junio',
        estado: 'por_facturar',
        factura_id: id,
        moneda: 'COP',
        valor: 1200000
      })),
      list: vi.fn(async () => []),
      update: vi.fn(async (id, patch) => ({ factura_id: id, ...patch }))
    },
    opportunities: {
      list: vi.fn(async () => [])
    },
    projects: {
      get: vi.fn(async (id) => ({
        cliente_id: 'CLI-1',
        descripcion: 'Sistema ejecutivo',
        doc_brief_id: '',
        doc_brief_url: '',
        drive_folder_id: 'project-folder',
        drive_folder_url: 'https://drive.google.com/drive/folders/project-folder',
        estado: 'activo',
        proxima_accion: 'Definir entregables',
        proyecto_id: id,
        semaforo: 'amarillo',
        titulo: 'Proyecto A'
      })),
      list: vi.fn(async () => []),
      update: vi.fn(async (id, patch) => ({ proyecto_id: id, ...patch }))
    },
    research: {
      get: vi.fn(async (id) => ({
        estado: 'en_curso',
        hallazgos: 'Mercado con tracción',
        investigacion_id: id,
        origen_id: 'IDE-1',
        problema: 'Validar demanda',
        recomendacion: 'Probar oferta',
        tipo_origen: 'idea',
        titulo: 'Investigación de mercado'
      })),
      update: vi.fn(async (id, patch) => ({ investigacion_id: id, ...patch }))
    },
    tasks: {
      list: vi.fn(async () => [])
    }
  };
}

describe('workspace HTTP handler', () => {
  it('rejects workspace actions when Google is not connected', async () => {
    const response = await buildWorkspaceResponse({
      body: { action: 'create_client_folder', entity: 'clients', id: 'CLI-1' },
      cookieHeader: undefined,
      method: 'POST',
      source
    });

    expect(response).toMatchObject({
      body: { error: 'google_not_connected' },
      status: 401
    });
  });

  it('creates a Drive folder for an existing client and updates the record', async () => {
    const repositories = createRepositories();
    const adapter = createWorkspaceAdapter();
    const repositoriesFactory: WorkspaceRepositoriesFactory = vi.fn(
      async () => repositories as never
    );
    const adapterFactory: WorkspaceAdapterFactory = vi.fn(async () => adapter);

    const response = await buildWorkspaceResponse({
      body: { action: 'create_client_folder', entity: 'clients', id: 'CLI-1' },
      cookieHeader,
      method: 'POST',
      repositoriesFactory,
      adapterFactory,
      source
    });

    expect(response.status).toBe(200);
    expect(adapter.ensureFolder).toHaveBeenCalledWith({
      name: 'Cliente - Acme SAS',
      parentId: 'root-folder'
    });
    expect(repositories.clients.update).toHaveBeenCalledWith(
      'CLI-1',
      {
        drive_folder_id: 'folder-1',
        drive_folder_url: 'https://drive.google.com/drive/folders/folder-1'
      },
      { actor: 'Germán' }
    );
    expect(response.body).toHaveProperty('folder.id', 'folder-1');
  });

  it('generates a project brief from the configured Docs template', async () => {
    const repositories = createRepositories();
    const adapter = createWorkspaceAdapter();
    const repositoriesFactory: WorkspaceRepositoriesFactory = vi.fn(
      async () => repositories as never
    );
    const adapterFactory: WorkspaceAdapterFactory = vi.fn(async () => adapter);

    const response = await buildWorkspaceResponse({
      body: { action: 'generate_project_brief', entity: 'projects', id: 'PRO-1' },
      cookieHeader,
      method: 'POST',
      repositoriesFactory,
      adapterFactory,
      now: () => new Date('2026-06-24T12:00:00.000Z'),
      source
    });

    expect(response.status).toBe(200);
    expect(adapter.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        folderId: 'project-folder',
        templateId: 'template-project',
        title: 'Brief de proyecto - Proyecto A'
      })
    );
    expect(adapter.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholders: expect.objectContaining({
          '{{cliente}}': 'Acme SAS',
          '{{estado}}': 'activo',
          '{{fecha}}': '2026-06-24',
          '{{proxima_accion}}': 'Definir entregables',
          '{{titulo}}': 'Proyecto A'
        })
      })
    );
    expect(repositories.projects.update).toHaveBeenCalledWith(
      'PRO-1',
      {
        doc_brief_id: 'doc-1',
        doc_brief_url: 'https://docs.google.com/document/d/doc-1/edit'
      },
      { actor: 'Germán' }
    );
    expect(repositories.documents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entidad_id: 'PRO-1',
        entidad_tipo: 'projects',
        google_doc_id: 'doc-1',
        google_doc_url: 'https://docs.google.com/document/d/doc-1/edit',
        tipo: 'proyecto_brief'
      }),
      { actor: 'Germán' }
    );
  });

  it('lists generated documents through the workspace endpoint', async () => {
    const repositories = createRepositories();
    const repositoriesFactory: WorkspaceRepositoriesFactory = vi.fn(
      async () => repositories as never
    );

    const response = await buildWorkspaceResponse({
      cookieHeader,
      method: 'GET',
      query: { view: 'documents' },
      repositoriesFactory,
      source
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      documents: [
        {
          documento_id: 'DOC-1',
          google_doc_url: 'https://docs.google.com/document/d/doc-1/edit',
          titulo: 'Brief - Proyecto A',
          tipo: 'proyecto_brief'
        }
      ]
    });
  });
});
