import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Loader2,
  ReceiptText,
  Target,
  TrendingUp,
  TriangleAlert
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge, type BadgeTone } from '../components/ui/Badge';
import { MetricCard } from '../components/ui/MetricCard';
import {
  emptyDashboard,
  fetchDashboard,
  type DashboardPayload
} from '../services/dashboard';

type MetricTone = 'amber' | 'blue' | 'green' | 'neutral' | 'red';

function formatMoney(value: number) {
  return `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(value: string) {
  if (!value) {
    return 'Sin fecha';
  }

  return value.slice(0, 10);
}

function generatedLabel(value: string) {
  if (!value || value === emptyDashboard.generatedAt) {
    return 'Datos de Google Sheets';
  }

  return `Actualizado ${formatDate(value)}`;
}

function humanize(value: string) {
  return value.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function trafficClass(traffic: string) {
  if (traffic === 'rojo') {
    return 'red';
  }

  if (traffic === 'amarillo') {
    return 'amber';
  }

  if (traffic === 'verde') {
    return 'green';
  }

  return 'blue';
}

function metricTone(value: number, dangerWhenPositive = false): MetricTone {
  if (dangerWhenPositive && value > 0) {
    return 'red';
  }

  if (value > 0) {
    return 'green';
  }

  return 'blue';
}

function EmptyRows({ label }: { label: string }) {
  return (
    <div className="dashboard-empty">
      <span>{label}</span>
    </div>
  );
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const payload = await fetchDashboard();

        if (!cancelled) {
          setDashboard(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar.');
          setDashboard(emptyDashboard);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(
    () => [
      {
        detail: `${dashboard.metrics.tasksThisWeek} esta semana`,
        icon: TriangleAlert,
        label: 'Tareas críticas',
        tone: metricTone(dashboard.metrics.criticalTasks, true),
        trend: dashboard.metrics.criticalTasks > 0 ? ('down' as const) : ('flat' as const),
        value: String(dashboard.metrics.criticalTasks)
      },
      {
        detail: `${dashboard.metrics.redProjects} en rojo`,
        icon: FolderKanban,
        label: 'Proyectos activos',
        tone: metricTone(dashboard.metrics.activeProjects),
        trend: 'flat' as const,
        value: String(dashboard.metrics.activeProjects)
      },
      {
        detail: `${dashboard.metrics.openOpportunities} oportunidades abiertas`,
        icon: Target,
        label: 'Funnel abierto',
        tone: 'green' as MetricTone,
        trend: dashboard.metrics.funnelValue > 0 ? ('up' as const) : ('flat' as const),
        value: formatMoney(dashboard.metrics.funnelValue)
      },
      {
        detail: `${dashboard.metrics.overdueInvoices} requieren acción`,
        icon: ReceiptText,
        label: 'Facturas vencidas',
        tone: metricTone(dashboard.metrics.overdueInvoices, true),
        trend: dashboard.metrics.overdueInvoices > 0 ? ('down' as const) : ('flat' as const),
        value: formatMoney(dashboard.metrics.overdueInvoiceValue)
      },
      {
        detail: `${dashboard.metrics.billableInvoices} por emitir`,
        icon: TrendingUp,
        label: 'Por facturar',
        tone: 'amber' as MetricTone,
        trend: dashboard.metrics.billableInvoiceValue > 0 ? ('up' as const) : ('flat' as const),
        value: formatMoney(dashboard.metrics.billableInvoiceValue)
      }
    ],
    [dashboard]
  );
  const invoiceTotal = dashboard.invoiceBuckets.reduce((sum, bucket) => sum + bucket.value, 0);

  return (
    <section className="dashboard-page">
      <div className="hero-row">
        <div>
          <h1>Hoy</h1>
          <p>{generatedLabel(dashboard.generatedAt)}</p>
        </div>
        <div className="hero-actions">
          {loading ? (
            <Badge dot tone="info">Cargando Google Sheets</Badge>
          ) : (
            <>
              <Badge dot tone={dashboard.metrics.criticalTasks > 0 ? 'danger' : 'success'}>
                {dashboard.metrics.criticalTasks} críticas
              </Badge>
              <Badge dot tone={dashboard.metrics.overdueInvoices > 0 ? 'warning' : 'success'}>
                {dashboard.metrics.overdueInvoices} facturas vencidas
              </Badge>
              <Badge dot tone={dashboard.missingNextActions.count > 0 ? 'info' : 'success'}>
                {dashboard.missingNextActions.count} sin próxima acción
              </Badge>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="settings-alert" role="alert">
          <AlertTriangle aria-hidden="true" size={16} />
          {error}
        </div>
      ) : null}

      <div className="metric-grid executive-metrics">
        {metrics.map((metric) => (
          <MetricCard
            detail={metric.detail}
            icon={metric.icon}
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            trend={metric.trend}
            value={metric.value}
          />
        ))}
      </div>

      <div className="cockpit-grid">
        <article className="panel cockpit-priorities">
          <div className="panel-header">
            <div>
              <h2>Prioridades</h2>
              <p>Siguiente ventana operativa.</p>
            </div>
            {loading ? <Loader2 aria-hidden="true" className="spin-icon" size={16} /> : null}
          </div>
          <div className="priority-table">
            {dashboard.priorities.length > 0 ? (
              dashboard.priorities.map((priority) => (
                <div className="priority-row" key={`${priority.module}-${priority.id}`}>
                  <span className={`priority-dot priority-${priority.tone}`} />
                  <strong>{priority.title}</strong>
                  <Badge tone={priority.tone}>{priority.module}</Badge>
                  <time>{priority.due}</time>
                </div>
              ))
            ) : (
              <EmptyRows label="Sin prioridades críticas" />
            )}
          </div>
        </article>

        <article className="panel cockpit-projects">
          <div className="panel-header">
            <div>
              <h2>Proyectos activos</h2>
              <p>Semáforo y vencimientos visibles.</p>
            </div>
            <Badge tone={dashboard.projectTraffic.rojo > 0 ? 'danger' : 'success'}>
              {dashboard.projectTraffic.rojo} rojo
            </Badge>
          </div>
          <div className="data-table project-table">
            <div className="data-row data-head">
              <span>Proyecto</span>
              <span>Estado</span>
              <span>Semáforo</span>
              <span>Fecha</span>
            </div>
            {dashboard.topProjects.length > 0 ? (
              dashboard.topProjects.map((project) => (
                <div className="data-row" key={project.id}>
                  <strong>{project.title}</strong>
                  <span>{humanize(project.state)}</span>
                  <span className="status-inline">
                    <i className={`traffic-dot traffic-${trafficClass(project.traffic)}`} />
                    {humanize(project.traffic)}
                  </span>
                  <time>{formatDate(project.deadline)}</time>
                </div>
              ))
            ) : (
              <EmptyRows label="Sin proyectos activos" />
            )}
          </div>
        </article>

        <aside className="side-rail">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Agenda de hoy</h2>
                <p>Tareas con vencimiento cercano.</p>
              </div>
              <CalendarDays aria-hidden="true" size={18} />
            </div>
            <div className="agenda-list">
              {dashboard.nextActions.length > 0 ? (
                dashboard.nextActions.slice(0, 6).map((item) => (
                  <div className="agenda-item" key={`${item.module}-${item.id}`}>
                    <time>{item.module}</time>
                    <span className="agenda-dot agenda-task" />
                    <strong>{item.title}</strong>
                    <small>{item.done ? 'Hecha' : 'Abierta'}</small>
                  </div>
                ))
              ) : (
                <EmptyRows label="Sin acciones próximas" />
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Siguientes acciones</h2>
                <p>Objetos sin próxima acción</p>
              </div>
              <Badge tone={dashboard.missingNextActions.count > 0 ? 'warning' : 'success'}>
                {dashboard.missingNextActions.count}
              </Badge>
            </div>
            <div className="next-action-list">
              {dashboard.missingNextActions.items.length > 0 ? (
                dashboard.missingNextActions.items.map((item) => (
                  <label className="next-action" key={`${item.module}-${item.id}`}>
                    <input readOnly type="checkbox" />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.module}</small>
                    </span>
                  </label>
                ))
              ) : (
                <EmptyRows label="Todo tiene próximo paso" />
              )}
            </div>
          </article>
        </aside>

        <article className="panel cockpit-funnel">
          <div className="panel-header">
            <div>
              <h2>Funnel abierto</h2>
              <p>Valor comercial por etapa.</p>
            </div>
            <Badge tone="success">{dashboard.metrics.openOpportunities} abiertas</Badge>
          </div>
          <div className="funnel-list">
            {dashboard.funnel.length > 0 ? (
              dashboard.funnel.map((stage) => (
                <div className="funnel-row" key={stage.stage}>
                  <span className="funnel-bar" style={{ width: `${stage.width}%` }} />
                  <strong>{stage.stage}</strong>
                  <span>{stage.count}</span>
                  <b>{formatMoney(stage.value)}</b>
                </div>
              ))
            ) : (
              <EmptyRows label="Sin oportunidades abiertas" />
            )}
          </div>
          <div className="panel-total">
            <span>Total pipeline</span>
            <strong>{formatMoney(dashboard.metrics.funnelValue)}</strong>
          </div>
        </article>

        <article className="panel cockpit-invoices">
          <div className="panel-header">
            <div>
              <h2>Facturas</h2>
              <p>Cobranza y vencimientos.</p>
            </div>
            <Badge tone={dashboard.metrics.overdueInvoices > 0 ? 'danger' : 'success'}>
              {dashboard.metrics.overdueInvoices} vencidas
            </Badge>
          </div>
          <div className="invoice-widget">
            <div className="invoice-ring" aria-label={`Total facturas ${formatMoney(invoiceTotal)}`}>
              <CircleDollarSign aria-hidden="true" size={22} />
              <strong>{formatMoney(invoiceTotal)}</strong>
              <span>Total</span>
            </div>
            <div className="invoice-list">
              {dashboard.invoiceBuckets.length > 0 ? (
                dashboard.invoiceBuckets.map((invoice) => (
                  <div className="invoice-row" key={invoice.label}>
                    <span className={`traffic-dot traffic-${invoice.tone}`} />
                    <strong>{invoice.label}</strong>
                    <span>{formatMoney(invoice.value)}</span>
                    <small>{invoice.percent}%</small>
                  </div>
                ))
              ) : (
                <EmptyRows label="Sin facturas" />
              )}
            </div>
          </div>
        </article>

        <article className="panel cockpit-activity">
          <div className="panel-header">
            <div>
              <h2>Actividad reciente</h2>
              <p>Últimos movimientos en Log_Actividad.</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={18} />
          </div>
          <div className="data-table activity-table">
            <div className="data-row data-head">
              <span>Actividad</span>
              <span>Módulo</span>
              <span>Detalle</span>
              <span>Fecha</span>
            </div>
            {dashboard.recentActivity.length > 0 ? (
              dashboard.recentActivity.map((item) => (
                <div className="data-row" key={item.id || `${item.activity}-${item.date}`}>
                  <strong className="activity-name">
                    <FileText aria-hidden="true" size={15} />
                    {item.activity}
                  </strong>
                  <span>{item.module}</span>
                  <span>{item.detail}</span>
                  <time>{formatDate(item.date)}</time>
                </div>
              ))
            ) : (
              <EmptyRows label="Sin movimientos todavía" />
            )}
          </div>
        </article>

        <article className="panel cockpit-shortcuts">
          <div className="panel-header">
            <div>
              <h2>Crear rápido</h2>
              <p>Entrada directa a los objetos clave.</p>
            </div>
            <ClipboardCheck aria-hidden="true" size={18} />
          </div>
          <div className="shortcut-grid">
            <button type="button">Tarea</button>
            <button type="button">Proyecto</button>
            <button type="button">Oportunidad</button>
            <button type="button">Factura</button>
            <button type="button">Cliente</button>
            <button type="button">Idea</button>
          </div>
        </article>
      </div>
    </section>
  );
}
