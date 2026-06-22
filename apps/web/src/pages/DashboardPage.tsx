import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  FolderKanban,
  ReceiptText,
  Target,
  TrendingUp,
  TriangleAlert
} from 'lucide-react';

import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/ui/MetricCard';

const metrics = [
  {
    label: 'Tareas críticas',
    value: '7',
    detail: '2 más que ayer',
    icon: TriangleAlert,
    tone: 'red' as const,
    trend: 'down' as const
  },
  {
    label: 'Proyectos activos',
    value: '5',
    detail: 'Sin cambios hoy',
    icon: FolderKanban,
    tone: 'blue' as const,
    trend: 'flat' as const
  },
  {
    label: 'Funnel abierto',
    value: '$128.4K',
    detail: '12% vs semana pasada',
    icon: Target,
    tone: 'green' as const,
    trend: 'up' as const
  },
  {
    label: 'Facturas vencidas',
    value: '$9.250',
    detail: '3 requieren acción',
    icon: ReceiptText,
    tone: 'red' as const,
    trend: 'down' as const
  },
  {
    label: 'Ingresos mes',
    value: '$18.600',
    detail: '8% vs mes pasado',
    icon: TrendingUp,
    tone: 'green' as const,
    trend: 'up' as const
  }
];

const priorities = [
  {
    title: 'Enviar propuesta a NovaTech',
    module: 'Cliente',
    due: 'Hoy',
    tone: 'danger' as const
  },
  {
    title: 'Pago de factura VENC-2025-012',
    module: 'Factura',
    due: 'Hoy',
    tone: 'danger' as const
  },
  {
    title: 'Revisión de contrato EcoBuild',
    module: 'Proyecto',
    due: 'Mañana',
    tone: 'warning' as const
  },
  {
    title: 'Seguimiento oportunidad FinData',
    module: 'Oportunidad',
    due: 'Mañana',
    tone: 'warning' as const
  },
  {
    title: 'Aprobación de wireframes',
    module: 'Proyecto',
    due: '24 may',
    tone: 'neutral' as const
  },
  {
    title: 'Investigación: IA para PMEs',
    module: 'Investigación',
    due: '24 may',
    tone: 'info' as const
  }
];

const projects = [
  {
    project: 'Plataforma NovaTech',
    state: 'En curso',
    progress: 72,
    deadline: '30 may',
    tone: 'green'
  },
  {
    project: 'App Móvil EcoBuild',
    state: 'En curso',
    progress: 45,
    deadline: '12 jun',
    tone: 'green'
  },
  {
    project: 'Landing FinData',
    state: 'En revisión',
    progress: 60,
    deadline: '28 may',
    tone: 'amber'
  },
  {
    project: 'Automatización Ventas',
    state: 'En curso',
    progress: 80,
    deadline: '05 jun',
    tone: 'green'
  },
  {
    project: 'Rebranding Startup OS',
    state: 'Bloqueado',
    progress: 20,
    deadline: '15 jun',
    tone: 'red'
  }
];

const agenda = [
  { time: '09:00', title: 'Standup del equipo', length: '30 min', type: 'meet' },
  { time: '10:30', title: 'Revisión propuesta NovaTech', length: '60 min', type: 'doc' },
  { time: '12:00', title: 'Almuerzo', length: '', type: 'idle' },
  { time: '14:00', title: 'Llamada con FinData', length: '45 min', type: 'meet' },
  { time: '15:00', title: 'Revisión de wireframes', length: '60 min', type: 'doc' },
  { time: '16:30', title: 'Cierre de pendientes', length: '30 min', type: 'task' }
];

const funnel = [
  { stage: 'Nuevos', count: 18, value: '$45.000', width: 100 },
  { stage: 'Calificados', count: 12, value: '$32.000', width: 82 },
  { stage: 'Propuesta', count: 7, value: '$21.400', width: 64 },
  { stage: 'Negociación', count: 4, value: '$18.000', width: 47 },
  { stage: 'Cierre', count: 2, value: '$12.000', width: 30 }
];

const invoices = [
  { label: 'Vencidas', value: '$9.250', percent: '33%', tone: 'red' },
  { label: 'Por vencer', value: '$8.400', percent: '30%', tone: 'amber' },
  { label: 'Pagadas', value: '$10.200', percent: '37%', tone: 'green' }
];

const nextActions = [
  { title: 'Preparar demo para EcoBuild', tag: 'Proyecto', done: false },
  { title: 'Actualizar modelo financiero', tag: 'Finanzas', done: false },
  { title: 'Publicar caso de éxito NovaTech', tag: 'Marketing', done: false },
  { title: 'Enviar reporte semanal', tag: 'Operación', done: true },
  { title: 'Backup de documentos críticos', tag: 'Operación', done: true }
];

const recentActivity = [
  {
    icon: FileText,
    activity: 'Documento actualizado',
    module: 'Proyectos',
    detail: 'Plan_NovaTech.xlsx',
    date: 'Hoy, 08:45'
  },
  {
    icon: FileText,
    activity: 'Documento creado',
    module: 'Documentos',
    detail: 'Propuesta_NovaTech.docx',
    date: 'Ayer, 17:30'
  },
  {
    icon: Target,
    activity: 'Fila agregada',
    module: 'Oportunidades',
    detail: 'FinData - Licencias',
    date: 'Ayer, 14:22'
  },
  {
    icon: CheckCircle2,
    activity: 'Tarea completada',
    module: 'Tareas',
    detail: 'Investigación: Competencia',
    date: 'Ayer, 11:05'
  }
];

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="hero-row">
        <div>
          <h1>Hoy</h1>
          <p>Lunes, 22 de junio de 2026</p>
        </div>
        <div className="hero-actions">
          <Badge dot tone="danger">7 críticas</Badge>
          <Badge dot tone="warning">3 facturas vencidas</Badge>
          <Badge dot tone="info">Google pendiente</Badge>
        </div>
      </div>

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
            <button className="link-button" type="button">Ver todas</button>
          </div>
          <div className="priority-table">
            {priorities.map((priority) => (
              <div className="priority-row" key={priority.title}>
                <span className={`priority-dot priority-${priority.tone}`} />
                <strong>{priority.title}</strong>
                <Badge tone={priority.tone}>{priority.module}</Badge>
                <time>{priority.due}</time>
              </div>
            ))}
          </div>
        </article>

        <article className="panel cockpit-projects">
          <div className="panel-header">
            <div>
              <h2>Proyectos activos</h2>
              <p>Semáforo y avance de entregables.</p>
            </div>
            <button className="link-button" type="button">Ver todos</button>
          </div>
          <div className="data-table project-table">
            <div className="data-row data-head">
              <span>Proyecto</span>
              <span>Estado</span>
              <span>Progreso</span>
              <span>Deadline</span>
            </div>
            {projects.map((project) => (
              <div className="data-row" key={project.project}>
                <strong>{project.project}</strong>
                <span className="status-inline">
                  <i className={`traffic-dot traffic-${project.tone}`} />
                  {project.state}
                </span>
                <span className="progress-cell">
                  <i>
                    <b style={{ width: `${project.progress}%` }} />
                  </i>
                  {project.progress}%
                </span>
                <time>{project.deadline}</time>
              </div>
            ))}
          </div>
        </article>

        <aside className="side-rail">
          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Agenda de hoy</h2>
                <p>Bloques que compiten por atención.</p>
              </div>
              <CalendarDays aria-hidden="true" size={18} />
            </div>
            <div className="agenda-list">
              {agenda.map((item) => (
                <div className="agenda-item" key={`${item.time}-${item.title}`}>
                  <time>{item.time}</time>
                  <span className={`agenda-dot agenda-${item.type}`} />
                  <strong>{item.title}</strong>
                  <small>{item.length}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <h2>Siguientes acciones</h2>
                <p>Objetos con próximo paso claro.</p>
              </div>
              <button className="link-button" type="button">Ver todas</button>
            </div>
            <div className="next-action-list">
              {nextActions.map((action) => (
                <label className="next-action" key={action.title}>
                  <input defaultChecked={action.done} type="checkbox" />
                  <span>
                    <strong>{action.title}</strong>
                    <small>{action.tag}</small>
                  </span>
                </label>
              ))}
            </div>
          </article>
        </aside>

        <article className="panel cockpit-funnel">
          <div className="panel-header">
            <div>
              <h2>Funnel abierto</h2>
              <p>Valor comercial por etapa.</p>
            </div>
            <button className="link-button" type="button">Ver pipeline</button>
          </div>
          <div className="funnel-list">
            {funnel.map((stage) => (
              <div className="funnel-row" key={stage.stage}>
                <span className="funnel-bar" style={{ width: `${stage.width}%` }} />
                <strong>{stage.stage}</strong>
                <span>{stage.count}</span>
                <b>{stage.value}</b>
              </div>
            ))}
          </div>
          <div className="panel-total">
            <span>Total pipeline</span>
            <strong>$128.400</strong>
          </div>
        </article>

        <article className="panel cockpit-invoices">
          <div className="panel-header">
            <div>
              <h2>Facturas</h2>
              <p>Cobranza y vencimientos.</p>
            </div>
            <button className="link-button" type="button">Ver facturas</button>
          </div>
          <div className="invoice-widget">
            <div className="invoice-ring" aria-label="Total facturas $27.850">
              <CircleDollarSign aria-hidden="true" size={22} />
              <strong>$27.850</strong>
              <span>Total</span>
            </div>
            <div className="invoice-list">
              {invoices.map((invoice) => (
                <div className="invoice-row" key={invoice.label}>
                  <span className={`traffic-dot traffic-${invoice.tone}`} />
                  <strong>{invoice.label}</strong>
                  <span>{invoice.value}</span>
                  <small>{invoice.percent}</small>
                </div>
              ))}
            </div>
          </div>
          <button className="danger-link" type="button">3 vencidas</button>
        </article>

        <article className="panel cockpit-activity">
          <div className="panel-header">
            <div>
              <h2>Actividad reciente</h2>
              <p>Registro operativo listo para Log_Actividad.</p>
            </div>
            <button className="link-button" type="button">Ver todo</button>
          </div>
          <div className="data-table activity-table">
            <div className="data-row data-head">
              <span>Actividad</span>
              <span>Módulo</span>
              <span>Detalle</span>
              <span>Fecha</span>
            </div>
            {recentActivity.map((item) => {
              const Icon = item.icon;

              return (
                <div className="data-row" key={`${item.activity}-${item.detail}`}>
                  <strong className="activity-name">
                    <Icon aria-hidden="true" size={15} />
                    {item.activity}
                  </strong>
                  <span>{item.module}</span>
                  <span>{item.detail}</span>
                  <time>{item.date}</time>
                </div>
              );
            })}
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
            <button type="button">Documento</button>
            <button type="button">Investigación</button>
          </div>
        </article>
      </div>
    </section>
  );
}
