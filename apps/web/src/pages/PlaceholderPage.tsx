import { ArrowUpRight, Plus, Rows3 } from 'lucide-react';

import type { NavItem } from '../app/navigation';
import { Badge } from '../components/ui/Badge';

type PlaceholderPageProps = {
  route: NavItem;
};

const moduleRows = [
  {
    title: 'Objeto principal',
    owner: 'Germán',
    status: 'Pendiente',
    next: 'Conectar Google Sheets'
  },
  {
    title: 'Automatización inicial',
    owner: 'Sistema',
    status: 'Planeado',
    next: 'Definir headers'
  },
  {
    title: 'Documento relacionado',
    owner: 'Drive',
    status: 'Sin generar',
    next: 'Asignar plantilla'
  }
];

export function PlaceholderPage({ route }: PlaceholderPageProps) {
  const Icon = route.icon;

  return (
    <section className="module-page">
      <div className="module-hero">
        <div className="module-title-block">
          <span className="module-icon">
            <Icon aria-hidden="true" size={20} />
          </span>
          <div>
            <h1>{route.label}</h1>
            <p>{route.description}</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge tone="info">Fase 3</Badge>
          <button className="button button-secondary" type="button">
            <Rows3 aria-hidden="true" size={15} />
            Ver tabla
          </button>
          <button className="button button-primary" type="button">
            <Plus aria-hidden="true" size={15} />
            Crear
          </button>
        </div>
      </div>

      <nav className="segment-tabs" aria-label={`Subvistas de ${route.label}`}>
        {route.sections.map((section, index) => (
          <button
            className={index === 0 ? 'segment-tab segment-tab-active' : 'segment-tab'}
            key={section}
            type="button"
          >
            {section}
          </button>
        ))}
      </nav>

      <div className="module-grid">
        <article className="panel module-main-panel">
          <div className="panel-header">
            <div>
              <h2>Vista operacional</h2>
              <p>La estructura ya está lista para recibir datos desde Google Sheets.</p>
            </div>
            <button className="link-button" type="button">
              Abrir configuración
              <ArrowUpRight aria-hidden="true" size={14} />
            </button>
          </div>

          <div className="data-table module-table">
            <div className="data-row data-head">
              <span>Nombre</span>
              <span>Owner</span>
              <span>Estado</span>
              <span>Próxima acción</span>
            </div>
            {moduleRows.map((row) => (
              <div className="data-row" key={`${route.label}-${row.title}`}>
                <strong>{row.title}</strong>
                <span>{row.owner}</span>
                <Badge tone={row.status === 'Pendiente' ? 'warning' : 'neutral'}>
                  {row.status}
                </Badge>
                <span>{row.next}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="panel module-side-panel">
          <div className="panel-header">
            <div>
              <h2>Próximo desbloqueo</h2>
              <p>Lo que esta pantalla necesita para volverse productiva.</p>
            </div>
          </div>
          <ol className="ordered-steps">
            <li>Crear headers de la hoja `{route.label}`.</li>
            <li>Exponer endpoints CRUD en `/api/*`.</li>
            <li>Reemplazar datos semilla por consultas reales.</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
