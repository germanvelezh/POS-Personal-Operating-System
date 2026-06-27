import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FilePlus2,
  Loader2,
  ReceiptText,
  SearchCheck,
  SignalHigh,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../components/ui/Badge';
import {
  runWorkspaceAction,
  type WorkspaceAction,
  type WorkspaceActionItem,
  type WorkspaceActionResponse
} from '../services/workspace';

type SummaryMetric = {
  key: string;
  label: string;
};

type AutomationDefinition = {
  action: WorkspaceAction;
  description: string;
  icon: LucideIcon;
  resultTitle: string;
  summary: SummaryMetric[];
  title: string;
};

const weeklyReportAutomation: AutomationDefinition = {
  action: 'generate_weekly_report',
  description: 'Crea el resumen ejecutivo semanal en Google Docs.',
  icon: FilePlus2,
  resultTitle: 'Reporte semanal generado',
  summary: [],
  title: 'Generar reporte semanal'
};

const automations: AutomationDefinition[] = [
  weeklyReportAutomation,
  {
    action: 'recalculate_idea_scores',
    description: 'Aplica la formula de prioridad a las ideas con datos completos.',
    icon: Sparkles,
    resultTitle: 'Scores de ideas recalculados',
    summary: [
      { key: 'scoredIdeas', label: 'evaluadas' },
      { key: 'updatedIdeas', label: 'actualizadas' }
    ],
    title: 'Recalcular scores de ideas'
  },
  {
    action: 'recalculate_project_traffic',
    description: 'Actualiza semaforos con vencidos, bloqueos y proximas acciones.',
    icon: SignalHigh,
    resultTitle: 'Semaforos de proyectos recalculados',
    summary: [
      { key: 'activeProjects', label: 'activos' },
      { key: 'updatedProjects', label: 'actualizados' },
      { key: 'rojo', label: 'rojos' },
      { key: 'amarillo', label: 'amarillos' },
      { key: 'verde', label: 'verdes' }
    ],
    title: 'Recalcular semaforos de proyectos'
  },
  {
    action: 'detect_overdue_tasks',
    description: 'Lista tareas abiertas cuya fecha ya vencio.',
    icon: Clock3,
    resultTitle: 'Tareas vencidas detectadas',
    summary: [
      { key: 'overdueTasks', label: 'vencidas' },
      { key: 'criticalOverdueTasks', label: 'criticas' }
    ],
    title: 'Detectar tareas vencidas'
  },
  {
    action: 'detect_overdue_invoices',
    description: 'Marca como vencidas las facturas abiertas con fecha pasada.',
    icon: ReceiptText,
    resultTitle: 'Facturas vencidas detectadas',
    summary: [
      { key: 'overdueInvoices', label: 'vencidas' },
      { key: 'updatedInvoices', label: 'actualizadas' }
    ],
    title: 'Detectar facturas vencidas'
  },
  {
    action: 'list_missing_next_actions',
    description: 'Encuentra clientes, ideas, proyectos y oportunidades sin siguiente accion.',
    icon: SearchCheck,
    resultTitle: 'Objetos sin proxima accion listados',
    summary: [{ key: 'missingNextActions', label: 'sin proxima accion' }],
    title: 'Listar objetos sin proxima accion'
  }
];

function summaryText(response: WorkspaceActionResponse, definition: AutomationDefinition) {
  const entries = definition.summary
    .map((metric) => {
      const value = response.summary?.[metric.key];

      if (value === null || value === undefined || value === '') {
        return null;
      }

      return `${value} ${metric.label}`;
    })
    .filter(Boolean);

  if (entries.length > 0) {
    return entries.join(' / ');
  }

  return response.document?.name ?? 'Accion completada';
}

function itemMeta(item: WorkspaceActionItem) {
  return [
    item.module,
    item.state,
    item.priority,
    item.traffic,
    item.dueDate,
    item.reason
  ]
    .filter(Boolean)
    .join(' / ');
}

function resultDefinition(result: WorkspaceActionResponse | null) {
  return automations.find((automation) => automation.action === result?.action) ?? weeklyReportAutomation;
}

export function AutomationsPage() {
  const [runningAction, setRunningAction] = useState<WorkspaceAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<WorkspaceActionResponse | null>(null);
  const loading = runningAction !== null;
  const latestDefinition = resultDefinition(latestResult);

  async function runAutomation(definition: AutomationDefinition) {
    setRunningAction(definition.action);
    setError(null);

    try {
      const response = await runWorkspaceAction({
        action: definition.action
      });

      setLatestResult(response);
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'No se pudo ejecutar la accion.'
      );
    } finally {
      setRunningAction(null);
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
            <p>Operaciones manuales para mantener limpio el sistema.</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge tone="success">Fase 6</Badge>
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
              <h2>Acciones manuales</h2>
              <p>Corre recalculos, detecciones y documentos desde Google Sheets.</p>
            </div>
          </div>

          <div className="automation-list automation-list-rich">
            {automations.map((definition) => {
              const Icon = definition.icon;
              const isRunning = runningAction === definition.action;

              return (
                <button
                  className="button button-secondary automation-card-button"
                  disabled={loading}
                  key={definition.action}
                  onClick={() => void runAutomation(definition)}
                  type="button"
                >
                  {isRunning ? (
                    <Loader2 aria-hidden="true" className="spin-icon" size={16} />
                  ) : (
                    <Icon aria-hidden="true" size={16} />
                  )}
                  <span className="automation-button-copy">
                    <strong>{definition.title}</strong>
                    <small>{definition.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="panel module-side-panel">
          <div className="panel-header">
            <div>
              <h2>Resultado</h2>
              <p>Ultima ejecucion de la sesion.</p>
            </div>
          </div>

          {latestResult ? (
            <div className="automation-result-stack">
              <div className="automation-result" role="status">
                <CheckCircle2 aria-hidden="true" size={18} />
                <div>
                  <strong>{latestDefinition.resultTitle}</strong>
                  <span>{summaryText(latestResult, latestDefinition)}</span>
                </div>
                {latestResult.document ? (
                  <a
                    className="button button-secondary"
                    href={latestResult.document.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Abrir reporte
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ) : null}
              </div>

              {latestResult.summary && latestDefinition.summary.length > 0 ? (
                <div className="automation-summary-grid">
                  {latestDefinition.summary.map((metric) => (
                    <div className="automation-summary-metric" key={metric.key}>
                      <strong>{latestResult.summary?.[metric.key] ?? 0}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {latestResult.items?.length ? (
                <div className="automation-item-list">
                  {latestResult.items.slice(0, 6).map((item) => (
                    <div className="automation-item-row" key={`${item.id}-${item.title}`}>
                      <div>
                        <strong>{item.title ?? item.id}</strong>
                        <span>{itemMeta(item) || item.id}</span>
                      </div>
                      {item.updated ? <Badge tone="success">Actualizado</Badge> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="entity-empty">
              <span>Sin ejecuciones en esta sesion</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
