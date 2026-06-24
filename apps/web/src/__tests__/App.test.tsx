import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, vi } from 'vitest';

import { App } from '../app/App';

const disconnectedStatus = {
  configured: true,
  connected: false,
  email: null,
  name: null,
  picture: null,
  allowedGoogleEmail: 'germanvelezh@gmail.com'
};

const emptyDashboard = {
  generatedAt: '2026-06-24T00:00:00.000Z',
  ideasByStatus: {},
  metrics: {
    activeProjects: 0,
    billableInvoices: 0,
    billableInvoiceValue: 0,
    criticalTasks: 0,
    funnelValue: 0,
    openOpportunities: 0,
    overdueInvoices: 0,
    overdueInvoiceValue: 0,
    redProjects: 0,
    tasksThisWeek: 0
  },
  missingNextActions: {
    count: 0,
    items: []
  },
  projectTraffic: {
    amarillo: 0,
    rojo: 0,
    verde: 0
  },
  recentActivity: [],
  topProjects: [],
  priorities: [],
  funnel: [],
  invoiceBuckets: [],
  nextActions: []
};

describe('Startup OS Personal shell', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => ({
        ok: true,
        json: async () => (String(input) === '/api/dashboard' ? emptyDashboard : disconnectedStatus)
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, '', '/');
  });

  it('renders the executive cockpit navigation and setup actions', async () => {
    render(<App />);

    expect(await screen.findByText('Google no conectado')).toBeInTheDocument();
    expect(screen.getByText('Startup OS Personal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Clientes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ideas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Proyectos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tareas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Oportunidades/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Facturas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Investigaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Documentos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Automatizaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Configuracion/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Conectar Google/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Inicializar sistema/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Hoy$/i })).toBeInTheDocument();
    expect(screen.getByText(/Tareas críticas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Funnel abierto/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Agenda de hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Siguientes acciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Actividad reciente/i)).toBeInTheDocument();
  });

  it('shows connected Google status from the auth API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          configured: true,
          connected: true,
          email: 'germanvelezh@gmail.com',
          name: 'German Velez',
          picture: null,
          allowedGoogleEmail: 'germanvelezh@gmail.com'
        })
      }))
    );

    render(<App />);

    expect((await screen.findAllByText('Google conectado')).length).toBeGreaterThan(0);
    expect(screen.getByText('germanvelezh@gmail.com')).toBeInTheDocument();
  });

  it('opens polished quick-create options from the global button', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText('Google no conectado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Crear rapido/i }));

    expect(screen.getByRole('dialog', { name: /Crear rapido/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva idea/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nuevo cliente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nuevo proyecto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva tarea/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva oportunidad/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva factura/i })).toBeInTheDocument();
    expect(screen.getByText(/Captura en segundos/i)).toBeInTheDocument();
    expect(screen.getByText(/Quedará listo para conectarse a Google Workspace/i)).toBeInTheDocument();
  });

  it('initializes Google Workspace from settings', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === '/api/auth/status') {
        return {
          ok: true,
          json: async () => ({
            configured: true,
            connected: true,
            email: 'germanvelezh@gmail.com',
            name: 'German Velez',
            picture: null,
            allowedGoogleEmail: 'germanvelezh@gmail.com'
          })
        };
      }

      if (url === '/api/dashboard') {
        return {
          ok: true,
          json: async () => emptyDashboard
        };
      }

      if (url === '/api/setup/initialize') {
        expect(init).toMatchObject({
          credentials: 'include',
          method: 'POST'
        });

        return {
          ok: true,
          json: async () => ({
            initialized: true,
            rootFolderId: 'folder-1',
            rootFolderUrl: 'https://drive.google.com/drive/folders/folder-1',
            masterSheetId: 'sheet-1',
            masterSheetUrl: 'https://docs.google.com/spreadsheets/d/sheet-1/edit',
            internalClientId: 'CLI-20260623-A1B2',
            created: {
              rootFolder: true,
              masterSheet: true,
              internalClient: true
            },
            sheets: {
              createdSheets: ['Clientes'],
              headersWritten: ['Clientes'],
              renamedDefaultSheet: true
            }
          })
        };
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    window.history.pushState({}, '', '/settings');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Google conectado' })).toBeInTheDocument();
    const initializeButton = screen.getAllByRole('button', {
      name: /Inicializar sistema/i
    })[0];

    expect(initializeButton).toBeDefined();
    await user.click(initializeButton as HTMLElement);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/setup/initialize',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST'
      })
    );
    expect((await screen.findAllByText('Sistema inicializado')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('sheet-1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('folder-1').length).toBeGreaterThan(0);
  });

  it('loads and creates clients from the CRUD API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === '/api/auth/status') {
        return {
          ok: true,
          json: async () => ({
            configured: true,
            connected: true,
            email: 'germanvelezh@gmail.com',
            name: 'German Velez',
            picture: null,
            allowedGoogleEmail: 'germanvelezh@gmail.com'
          })
        };
      }

      if (url === '/api/dashboard') {
        return {
          ok: true,
          json: async () => emptyDashboard
        };
      }

      if (url === '/api/clients') {
        if (init?.method === 'POST') {
          expect(init).toMatchObject({
            credentials: 'include',
            method: 'POST'
          });

          return {
            ok: true,
            json: async () => ({
              entity: 'clients',
              record: {
                cliente_id: 'CLI-2',
                estado: 'prospecto',
                nombre: 'Nova Labs',
                proxima_accion: 'Enviar brief'
              }
            })
          };
        }

        return {
          ok: true,
          json: async () => ({
            entity: 'clients',
            records: [
              {
                cliente_id: 'CLI-1',
                estado: 'activo',
                nombre: 'Acme SAS',
                proxima_accion: 'Enviar propuesta'
              }
            ]
          })
        };
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    window.history.pushState({}, '', '/clients');

    render(<App />);

    expect(await screen.findByText('Acme SAS')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Crear$/i }));
    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'Nova Labs');
    await user.type(screen.getByLabelText('Próxima acción'), 'Enviar brief');
    await user.click(screen.getByRole('button', { name: /Guardar/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/clients',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST'
      })
    );
    expect(await screen.findByText('Nova Labs')).toBeInTheDocument();
  });

  it('loads the executive dashboard from the dashboard API', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === '/api/auth/status') {
        return {
          ok: true,
          json: async () => ({
            configured: true,
            connected: true,
            email: 'germanvelezh@gmail.com',
            name: 'German Velez',
            picture: null,
            allowedGoogleEmail: 'germanvelezh@gmail.com'
          })
        };
      }

      if (url === '/api/dashboard') {
        return {
          ok: true,
          json: async () => ({
            ...emptyDashboard,
            metrics: {
              ...emptyDashboard.metrics,
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
            priorities: [
              {
                due: 'Vencida',
                id: 'TAR-1',
                module: 'Tarea',
                title: 'Llamar al cliente',
                tone: 'danger'
              }
            ],
            topProjects: [
              {
                deadline: '2026-06-29',
                id: 'PRO-2',
                state: 'activo',
                title: 'Proyecto rojo',
                traffic: 'rojo'
              }
            ],
            funnel: [
              {
                count: 1,
                stage: 'Nuevas',
                value: 1000,
                width: 50
              }
            ],
            invoiceBuckets: [
              {
                count: 1,
                label: 'Vencidas',
                percent: 42,
                tone: 'red',
                value: 500
              }
            ],
            missingNextActions: {
              count: 3,
              items: [
                {
                  id: 'CLI-1',
                  module: 'Cliente',
                  title: 'Acme SAS'
                }
              ]
            },
            recentActivity: [
              {
                activity: 'created',
                date: '2026-06-24T08:00:00.000Z',
                detail: 'created Clientes',
                module: 'Clientes'
              }
            ]
          })
        };
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    expect(await screen.findByText('Llamar al cliente')).toBeInTheDocument();
    expect(screen.getByText('Proyecto rojo')).toBeInTheDocument();
    expect(screen.getByText('Objetos sin próxima acción')).toBeInTheDocument();
    expect(screen.getByText('Acme SAS')).toBeInTheDocument();
    expect(screen.getAllByText('$ 3.000').length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/dashboard',
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
