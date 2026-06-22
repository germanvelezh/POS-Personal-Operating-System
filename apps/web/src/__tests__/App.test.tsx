import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from '../app/App';

describe('Startup OS Personal shell', () => {
  it('renders the executive cockpit navigation and setup actions', () => {
    render(<App />);

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
    expect(screen.getAllByRole('button', { name: /Conectar Google/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Inicializar sistema/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Hoy$/i })).toBeInTheDocument();
    expect(screen.getByText(/Tareas críticas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Funnel abierto/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Agenda de hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Siguientes acciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Actividad reciente/i)).toBeInTheDocument();
  });

  it('opens polished quick-create options from the global button', async () => {
    const user = userEvent.setup();
    render(<App />);

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
