import { Badge } from '../components/ui/Badge';

const settingsSections = [
  'Estado de conexión Google',
  'Inicializar sistema',
  'Google Sheet maestro',
  'Carpeta raíz Drive',
  'IDs de plantillas Docs',
  'Catálogos y estados',
  'Diagnóstico técnico'
];

export function SettingsPage() {
  return (
    <section className="module-page">
      <div className="page-heading">
        <div>
          <h1>Configuración</h1>
          <p>Conexión Google, setup del sistema y referencias técnicas locales.</p>
        </div>
        <Badge tone="warning">Google pendiente</Badge>
      </div>

      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>Setup local</h2>
            <p>Fase 1 conectará OAuth, Sheets, Drive y Docs.</p>
          </div>
        </div>
        <div className="settings-list">
          {settingsSections.map((section) => (
            <div className="settings-row" key={section}>
              <span>{section}</span>
              <Badge tone="neutral">Pendiente</Badge>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
