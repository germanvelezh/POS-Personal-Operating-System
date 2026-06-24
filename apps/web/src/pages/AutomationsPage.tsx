import {
  AlertTriangle,
  Bot,
  ExternalLink,
  FilePlus2,
  Loader2,
  RotateCw
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../components/ui/Badge';
import {
  runWorkspaceAction,
  type WorkspaceDocument
} from '../services/workspace';

const pendingActions = [
  'Recalcular scores de ideas',
  'Recalcular semáforos de proyectos',
  'Detectar tareas vencidas',
  'Detectar facturas vencidas',
  'Listar objetos sin próxima acción'
];

export function AutomationsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WorkspaceDocument | null>(null);

  async function generateWeeklyReport() {
    setLoading(true);
    setError(null);
    setWeeklyReport(null);

    try {
      const response = await runWorkspaceAction({
        action: 'generate_weekly_report'
      });

      setWeeklyReport(response.document ?? null);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'No se pudo generar el reporte.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="module-page">
      <div className="module-hero">
        <div className="module-title-block">
          <span className="module-icon">
            <Bot aria-hidden="true" size={20} />
          </span>
          <div>
            <h1>Automatizaciones</h1>
            <p>Acciones manuales para recalcular y generar reportes.</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge tone="success">Fase 5</Badge>
        </div>
      </div>

      {error ? (
        <div className="settings-alert" role="alert">
          <AlertTriangle aria-hidden="true" size={16} />
          {error}
        </div>
      ) : null}

      <div className="module-grid">
        <article className="panel module-main-panel">
          <div className="panel-header">
            <div>
              <h2>Reporte semanal</h2>
              <p>Resumen ejecutivo generado en Google Docs.</p>
            </div>
            <button
              className="button button-primary"
              disabled={loading}
              onClick={() => void generateWeeklyReport()}
              type="button"
            >
              {loading ? (
                <Loader2 aria-hidden="true" className="spin-icon" size={15} />
              ) : (
                <FilePlus2 aria-hidden="true" size={15} />
              )}
              {loading ? 'Generando' : 'Generar reporte semanal'}
            </button>
          </div>

          {weeklyReport ? (
            <div className="automation-result" role="status">
              <div>
                <strong>Reporte semanal generado</strong>
                <span>{weeklyReport.name}</span>
              </div>
              <a
                className="button button-secondary"
                href={weeklyReport.url}
                rel="noreferrer"
                target="_blank"
              >
                Abrir reporte
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </div>
          ) : (
            <div className="entity-empty">
              <span>Sin reporte generado en esta sesión</span>
            </div>
          )}
        </article>

        <aside className="panel module-side-panel">
          <div className="panel-header">
            <div>
              <h2>Próximas acciones</h2>
              <p>Controles manuales listos para Fase 6.</p>
            </div>
          </div>
          <div className="automation-list">
            {pendingActions.map((action) => (
              <button className="button button-secondary" disabled key={action} type="button">
                <RotateCw aria-hidden="true" size={14} />
                {action}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
