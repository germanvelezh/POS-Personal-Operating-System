import {
  CheckCircle2,
  CloudOff,
  FileKey2,
  FolderRoot,
  Play,
  Settings2,
  Sheet,
  TriangleAlert
} from 'lucide-react';

import { Badge } from '../components/ui/Badge';

const setupSections = [
  {
    label: 'Estado de conexión Google',
    detail: 'OAuth web server flow pendiente para producción en Vercel.',
    icon: CloudOff,
    tone: 'warning' as const
  },
  {
    label: 'Google Sheet maestro',
    detail: 'Repositorio canónico de clientes, ideas, proyectos y facturas.',
    icon: Sheet,
    tone: 'neutral' as const
  },
  {
    label: 'Carpeta raíz Drive',
    detail: 'Estructura /Startup OS con carpetas por cliente y proyecto.',
    icon: FolderRoot,
    tone: 'neutral' as const
  },
  {
    label: 'IDs de plantillas Docs',
    detail: 'Briefs, investigaciones, facturas y reportes semanales.',
    icon: FileKey2,
    tone: 'neutral' as const
  }
];

const diagnostics = [
  ['Frontend', 'Listo para Vercel'],
  ['API health', 'Disponible'],
  ['OAuth callback', 'Pendiente de credenciales'],
  ['Persistencia', 'Google Sheets']
];

export function SettingsPage() {
  return (
    <section className="module-page settings-page">
      <div className="module-hero">
        <div className="module-title-block">
          <span className="module-icon">
            <Settings2 aria-hidden="true" size={20} />
          </span>
          <div>
            <h1>Configuración</h1>
            <p>Conexión Google, setup del sistema y diagnóstico técnico para Vercel.</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge dot tone="warning">Google pendiente</Badge>
          <button className="button button-secondary" type="button">
            <CloudOff aria-hidden="true" size={15} />
            Conectar Google
          </button>
          <button className="button button-primary" type="button">
            <Play aria-hidden="true" size={14} />
            Inicializar sistema
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <article className="panel settings-connection">
          <div className="connection-hero">
            <span className="connection-icon">
              <TriangleAlert aria-hidden="true" size={22} />
            </span>
            <div>
              <h2>Google no conectado</h2>
              <p>
                Cuando OAuth esté configurado, esta sección validará Sheets, Drive,
                Docs y el email autorizado de Germán.
              </p>
            </div>
          </div>
          <div className="settings-actions">
            <button className="button button-primary" type="button">
              Conectar Google
            </button>
            <button className="button button-secondary" type="button">
              Ver variables Vercel
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Inicialización</h2>
              <p>Secuencia que creará hojas, headers, cliente interno y carpetas.</p>
            </div>
            <Badge tone="warning">Pendiente</Badge>
          </div>
          <div className="setup-list">
            {setupSections.map((section) => {
              const Icon = section.icon;

              return (
                <div className="setup-row" key={section.label}>
                  <span className="setup-icon">
                    <Icon aria-hidden="true" size={17} />
                  </span>
                  <div>
                    <strong>{section.label}</strong>
                    <small>{section.detail}</small>
                  </div>
                  <Badge tone={section.tone}>Pendiente</Badge>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Diagnóstico técnico</h2>
              <p>Lectura rápida del estado del MVP.</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={18} />
          </div>
          <div className="settings-list">
            {diagnostics.map(([label, value]) => (
              <div className="settings-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
