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

describe('Startup OS Personal shell', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => disconnectedStatus
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

    expect(await screen.findByText('Google conectado')).toBeInTheDocument();
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
});
