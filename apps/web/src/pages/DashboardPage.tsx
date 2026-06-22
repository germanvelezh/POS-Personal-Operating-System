import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/ui/MetricCard';

const metrics = [
  {
    label: 'Tareas vencidas',
    value: '0',
    detail: 'Esperando datos de Sheets',
    tone: 'red' as const
  },
  {
    label: 'Proyectos activos',
    value: '0',
    detail: 'Se activan en Fase 3',
    tone: 'green' as const
  },
  {
    label: 'Funnel abierto',
    value: '$0',
    detail: 'Valor estimado pendiente',
    tone: 'blue' as const
  },
  {
    label: 'Facturas vencidas',
    value: '0',
    detail: 'Sin Google Sheets inicializado',
    tone: 'amber' as const
  }
];

const emptyPriorities = [
  'Inicializar Google OAuth y Sheet maestro',
  'Crear cliente interno Germán / Startup Interna',
  'Definir plantillas Docs para briefs, facturas y reportes'
];

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Centro ejecutivo para prioridades, proyectos, oportunidades, facturación
            y acciones rápidas.
          </p>
        </div>
        <Badge tone="warning">Fase 0</Badge>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard
            detail={metric.detail}
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <h2>Top prioridades</h2>
              <p>Arranque operativo antes de conectar datos reales.</p>
            </div>
            <Badge tone="neutral">Manual</Badge>
          </div>
          <ol className="priority-list">
            {emptyPriorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ol>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Proyectos por semáforo</h2>
          </div>
          <div className="traffic-stack">
            <span><i className="traffic-dot traffic-green" /> Verde: 0</span>
            <span><i className="traffic-dot traffic-amber" /> Amarillo: 0</span>
            <span><i className="traffic-dot traffic-red" /> Rojo: 0</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Ideas por estado</h2>
          </div>
          <div className="state-list">
            <span>Capturadas <strong>0</strong></span>
            <span>En revisión <strong>0</strong></span>
            <span>En investigación <strong>0</strong></span>
          </div>
        </article>

        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <h2>Alertas ejecutivas</h2>
              <p>Tareas vencidas, facturas vencidas y objetos sin próxima acción.</p>
            </div>
          </div>
          <div className="empty-state">
            <strong>Sin datos todavía</strong>
            <span>La Fase 1 inicializará Google Workspace y la Fase 4 leerá datos reales.</span>
          </div>
        </article>
      </div>
    </section>
  );
}
