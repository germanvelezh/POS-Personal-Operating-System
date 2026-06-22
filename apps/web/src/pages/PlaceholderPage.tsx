import type { NavItem } from '../app/navigation';
import { Badge } from '../components/ui/Badge';

type PlaceholderPageProps = {
  route: NavItem;
};

export function PlaceholderPage({ route }: PlaceholderPageProps) {
  return (
    <section className="module-page">
      <div className="page-heading">
        <div>
          <h1>{route.label}</h1>
          <p>{route.description}</p>
        </div>
        <Badge tone="neutral">Fase 0 shell</Badge>
      </div>

      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>Subvistas planeadas</h2>
            <p>Esta pantalla quedará conectada al CRUD principal en Fase 3.</p>
          </div>
        </div>
        <div className="subview-grid">
          {route.sections.map((section) => (
            <span key={section}>{section}</span>
          ))}
        </div>
      </article>
    </section>
  );
}
