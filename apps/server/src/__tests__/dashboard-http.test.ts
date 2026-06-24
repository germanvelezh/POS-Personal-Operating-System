import { describe, expect, it, vi } from 'vitest';

import type { GoogleAuthConfig } from '../auth/config.js';
import { createSessionCookie, type AuthSession } from '../auth/session.js';
import {
  buildDashboardResponse,
  type DashboardRepositoriesFactory
} from '../dashboard/http.js';

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

function fakeRepository<TRecord>(records: TRecord[]) {
  return {
    list: vi.fn(async () => records)
  };
}

function createDashboardRepositories() {
  return {
    activityLog: fakeRepository([
      {
        accion: 'created',
        descripcion: 'created Clientes',
        entidad_tipo: 'Clientes',
        fecha: '2026-06-24T08:00:00.000Z',
        log_id: 'LOG-1'
      }
    ]),
    clients: fakeRepository([
      {
        cliente_id: 'CLI-1',
        estado: 'activo',
        nombre: 'Acme SAS',
        proxima_accion: ''
      }
    ]),
    ideas: fakeRepository([
      {
        estado: 'capturada',
        idea_id: 'IDE-1',
        proxima_accion: '',
        score_prioridad: 4.7,
        titulo: 'Automatizar reportes'
      },
      {
        estado: 'aprobada',
        idea_id: 'IDE-2',
        proxima_accion: 'Convertir en proyecto',
        score_prioridad: 4.2,
        titulo: 'Servicio de diagnóstico'
      }
    ]),
    invoices: fakeRepository([
      {
        concepto: 'Factura vencida Acme',
        estado: 'vencida',
        factura_id: 'FAC-1',
        fecha_vencimiento: '2026-06-20',
        moneda: 'COP',
        valor: 500
      },
      {
        concepto: 'Implementación Nova',
        estado: 'por_facturar',
        factura_id: 'FAC-2',
        fecha_vencimiento: '2026-07-02',
        moneda: 'COP',
        valor: 700
      }
    ]),
    opportunities: fakeRepository([
      {
        estado: 'nueva',
        moneda: 'COP',
        oportunidad_id: 'OPP-1',
        proxima_accion: 'Agendar discovery',
        titulo: 'Acme retainer',
        valor_estimado: 1000
      },
      {
        estado: 'negociacion',
        moneda: 'COP',
        oportunidad_id: 'OPP-2',
        proxima_accion: '',
        titulo: 'Nova analytics',
        valor_estimado: 2000
      },
      {
        estado: 'ganada',
        moneda: 'COP',
        oportunidad_id: 'OPP-3',
        titulo: 'Cerrada',
        valor_estimado: 9000
      }
    ]),
    projects: fakeRepository([
      {
        estado: 'activo',
        fecha_fin_estimada: '2026-07-01',
        proxima_accion: 'Revisar alcance',
        proyecto_id: 'PRO-1',
        semaforo: 'verde',
        titulo: 'Proyecto verde'
      },
      {
        estado: 'activo',
        fecha_fin_estimada: '2026-06-29',
        proxima_accion: '',
        proyecto_id: 'PRO-2',
        semaforo: 'rojo',
        titulo: 'Proyecto rojo'
      }
    ]),
    tasks: fakeRepository([
      {
        estado: 'pendiente',
        fecha_vencimiento: '2026-06-23',
        prioridad: 'critica',
        proyecto_id: 'PRO-1',
        tarea_id: 'TAR-1',
        titulo: 'Llamar al cliente'
      },
      {
        estado: 'en_progreso',
        fecha_vencimiento: '2026-06-26',
        prioridad: 'media',
        proyecto_id: 'PRO-1',
        tarea_id: 'TAR-2',
        titulo: 'Preparar demo'
      },
      {
        estado: 'terminada',
        fecha_vencimiento: '2026-06-20',
        prioridad: 'critica',
        proyecto_id: 'PRO-1',
        tarea_id: 'TAR-3',
        titulo: 'Ya cerrada'
      }
    ])
  };
}

describe('dashboard HTTP handler', () => {
  it('rejects dashboard requests when Google is not connected', async () => {
    const response = await buildDashboardResponse({
      cookieHeader: undefined,
      source
    });

    expect(response).toMatchObject({
      body: { error: 'google_not_connected' },
      status: 401
    });
  });

  it('aggregates executive metrics from entity repositories', async () => {
    const repositories = createDashboardRepositories();
    const factory: DashboardRepositoriesFactory = vi.fn(async () => repositories as never);

    const response = await buildDashboardResponse({
      cookieHeader,
      now: () => new Date('2026-06-24T12:00:00.000Z'),
      repositoriesFactory: factory,
      source
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      metrics: {
        activeProjects: 2,
        billableInvoices: 1,
        billableInvoiceValue: 700,
        criticalTasks: 1,
        funnelValue: 3000,
        openOpportunities: 2,
        overdueInvoices: 1,
        overdueInvoiceValue: 500,
        redProjects: 1,
        tasksThisWeek: 1
      },
      projectTraffic: {
        rojo: 1,
        verde: 1
      }
    });
    expect(response.body).toHaveProperty('ideasByStatus.capturada', 1);
    expect(response.body).toHaveProperty('ideasByStatus.aprobada', 1);
    expect(response.body).toHaveProperty('priorities.0.title', 'Llamar al cliente');
    expect(response.body).toHaveProperty('missingNextActions.count', 4);
    expect(response.body).toHaveProperty('funnel.0.stage', 'Nuevas');
    expect(response.body).toHaveProperty('recentActivity.0.module', 'Clientes');
  });
});
