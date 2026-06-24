import { ZodError } from 'zod';

import { getGoogleAuthConfig, type GoogleAuthConfig } from '../auth/config.js';
import { getSessionFromCookieHeader, type AuthSession } from '../auth/session.js';
import type { EntityRepositories } from '../repositories/entityRepositories.js';
import { createGoogleEntityRepositories } from '../entities/googleContext.js';

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;
type DashboardTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';
type Traffic = 'amarillo' | 'rojo' | 'verde';
type DashboardRecord = Record<string, unknown>;

export type DashboardJsonResponse = {
  body: unknown;
  status: number;
};

export type DashboardRepositoriesFactory = (
  session: AuthSession,
  config: GoogleAuthConfig,
  source: EnvSource
) => Promise<EntityRepositories>;

type DashboardRequestContext = {
  cookieHeader: string | undefined;
  now?: () => Date;
  repositoriesFactory?: DashboardRepositoriesFactory;
  source?: EnvSource;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const openTaskStates = new Set(['backlog', 'pendiente', 'en_progreso', 'bloqueada', 'en_revision']);
const openOpportunityStates = new Set([
  'nueva',
  'calificada',
  'en_descubrimiento',
  'propuesta_pendiente',
  'propuesta_enviada',
  'negociacion'
]);
const closedProjectStates = new Set(['cancelado', 'cerrado']);
const closedInvoiceStates = new Set(['cancelada', 'pagada']);

function jsonError(status: number, error: string, message: string): DashboardJsonResponse {
  return {
    body: { error, message },
    status
  };
}

function asRecordArray(records: unknown[]) {
  return records as DashboardRecord[];
}

function asText(value: unknown) {
  return String(value ?? '').trim();
}

function asNumber(value: unknown) {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function dayKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Bogota',
    year: 'numeric'
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${byType.year}-${byType.month}-${byType.day}`;
}

function dayValue(value: unknown) {
  const text = asText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);

  if (!match) {
    return null;
  }

  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function humanize(value: unknown) {
  const text = asText(value);

  if (!text) {
    return 'Sin estado';
  }

  return text.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function isOpenTask(task: DashboardRecord) {
  return openTaskStates.has(asText(task.estado));
}

function isOpenOpportunity(opportunity: DashboardRecord) {
  return openOpportunityStates.has(asText(opportunity.estado));
}

function isOpenProject(project: DashboardRecord) {
  return !closedProjectStates.has(asText(project.estado));
}

function isInvoiceOverdue(invoice: DashboardRecord, todayMs: number) {
  if (asText(invoice.estado) === 'vencida') {
    return true;
  }

  const dueMs = dayValue(invoice.fecha_vencimiento);

  return (
    dueMs !== null &&
    dueMs < todayMs &&
    !closedInvoiceStates.has(asText(invoice.estado))
  );
}

function trafficTone(traffic: unknown): DashboardTone {
  if (traffic === 'rojo') {
    return 'danger';
  }

  if (traffic === 'amarillo') {
    return 'warning';
  }

  if (traffic === 'verde') {
    return 'success';
  }

  return 'neutral';
}

function trafficRank(traffic: unknown) {
  if (traffic === 'rojo') {
    return 0;
  }

  if (traffic === 'amarillo') {
    return 1;
  }

  if (traffic === 'verde') {
    return 2;
  }

  return 3;
}

function compareDays(left: unknown, right: unknown) {
  const leftDay = dayValue(left);
  const rightDay = dayValue(right);

  if (leftDay === null && rightDay === null) {
    return 0;
  }

  if (leftDay === null) {
    return 1;
  }

  if (rightDay === null) {
    return -1;
  }

  return leftDay - rightDay;
}

function moduleItem(module: string, id: string, title: string) {
  return {
    id,
    module,
    title
  };
}

async function resolveRepositories({
  cookieHeader,
  repositoriesFactory = createGoogleEntityRepositories,
  source = process.env
}: Pick<
  DashboardRequestContext,
  'cookieHeader' | 'repositoriesFactory' | 'source'
>): Promise<
  | { error: DashboardJsonResponse }
  | { repositories: EntityRepositories; session: AuthSession }
> {
  let config: GoogleAuthConfig;

  try {
    config = getGoogleAuthConfig(source);
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    return {
      error: jsonError(
        503,
        'google_not_configured',
        'Configura Google OAuth antes de usar el dashboard.'
      )
    };
  }

  const session = getSessionFromCookieHeader(cookieHeader, config);

  if (!session || session.email.toLowerCase() !== config.allowedGoogleEmail) {
    return {
      error: jsonError(401, 'google_not_connected', 'Conecta Google antes de usar el dashboard.')
    };
  }

  return {
    repositories: await repositoriesFactory(session, config, source),
    session
  };
}

function countByStatus(records: DashboardRecord[]) {
  return records.reduce<Record<string, number>>((counts, record) => {
    const status = asText(record.estado) || 'sin_estado';
    counts[status] = (counts[status] ?? 0) + 1;

    return counts;
  }, {});
}

function buildFunnel(opportunities: DashboardRecord[]) {
  const stageDefinitions = [
    { label: 'Nuevas', states: ['nueva'] },
    { label: 'Calificadas', states: ['calificada'] },
    { label: 'Descubrimiento', states: ['en_descubrimiento'] },
    { label: 'Propuesta', states: ['propuesta_pendiente', 'propuesta_enviada'] },
    { label: 'Negociación', states: ['negociacion'] }
  ];
  const rows = stageDefinitions.map((stage) => {
    const records = opportunities.filter((opportunity) =>
      stage.states.includes(asText(opportunity.estado))
    );
    const value = records.reduce((sum, record) => sum + asNumber(record.valor_estimado), 0);

    return {
      count: records.length,
      stage: stage.label,
      value,
      width: 0
    };
  });
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return rows.map((row) => ({
    ...row,
    width: Math.max(12, Math.round((row.value / maxValue) * 100))
  }));
}

function buildInvoiceBuckets(invoices: DashboardRecord[], todayMs: number) {
  const overdue = invoices.filter((invoice) => isInvoiceOverdue(invoice, todayMs));
  const billable = invoices.filter((invoice) => asText(invoice.estado) === 'por_facturar');
  const paid = invoices.filter((invoice) =>
    ['pagada', 'pagada_parcialmente'].includes(asText(invoice.estado))
  );
  const buckets = [
    { label: 'Vencidas', records: overdue, tone: 'red' },
    { label: 'Por facturar', records: billable, tone: 'amber' },
    { label: 'Pagadas', records: paid, tone: 'green' }
  ];
  const totalValue = buckets.reduce(
    (sum, bucket) =>
      sum + bucket.records.reduce((bucketSum, invoice) => bucketSum + asNumber(invoice.valor), 0),
    0
  );

  return buckets.map((bucket) => {
    const value = bucket.records.reduce((sum, invoice) => sum + asNumber(invoice.valor), 0);

    return {
      count: bucket.records.length,
      label: bucket.label,
      percent: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      tone: bucket.tone,
      value
    };
  });
}

function buildPriorities({
  invoices,
  projects,
  tasks,
  todayMs
}: {
  invoices: DashboardRecord[];
  projects: DashboardRecord[];
  tasks: DashboardRecord[];
  todayMs: number;
}) {
  const overdueCriticalTasks = tasks
    .filter((task) => {
      const dueMs = dayValue(task.fecha_vencimiento);

      return (
        isOpenTask(task) &&
        asText(task.prioridad) === 'critica' &&
        (asText(task.estado) === 'bloqueada' || (dueMs !== null && dueMs < todayMs))
      );
    })
    .map((task) => ({
      due: 'Vencida',
      id: asText(task.tarea_id),
      module: 'Tarea',
      title: asText(task.titulo),
      tone: 'danger' as DashboardTone
    }));
  const overdueInvoices = invoices
    .filter((invoice) => isInvoiceOverdue(invoice, todayMs))
    .map((invoice) => ({
      due: 'Vencida',
      id: asText(invoice.factura_id),
      module: 'Factura',
      title: asText(invoice.concepto),
      tone: 'danger' as DashboardTone
    }));
  const redProjects = projects
    .filter((project) => isOpenProject(project) && asText(project.semaforo) === 'rojo')
    .map((project) => ({
      due: asText(project.fecha_fin_estimada) || 'Sin fecha',
      id: asText(project.proyecto_id),
      module: 'Proyecto',
      title: asText(project.titulo),
      tone: 'warning' as DashboardTone
    }));

  return [...overdueCriticalTasks, ...overdueInvoices, ...redProjects]
    .filter((priority) => priority.title)
    .slice(0, 6);
}

function buildMissingNextActions({
  clients,
  ideas,
  opportunities,
  projects
}: {
  clients: DashboardRecord[];
  ideas: DashboardRecord[];
  opportunities: DashboardRecord[];
  projects: DashboardRecord[];
}) {
  const items = [
    ...clients
      .filter((client) => asText(client.estado) !== 'inactivo' && !asText(client.proxima_accion))
      .map((client) => moduleItem('Cliente', asText(client.cliente_id), asText(client.nombre))),
    ...ideas
      .filter((idea) => !['archivada', 'descartada'].includes(asText(idea.estado)))
      .filter((idea) => !asText(idea.proxima_accion))
      .map((idea) => moduleItem('Idea', asText(idea.idea_id), asText(idea.titulo))),
    ...projects
      .filter((project) => isOpenProject(project) && !asText(project.proxima_accion))
      .map((project) =>
        moduleItem('Proyecto', asText(project.proyecto_id), asText(project.titulo))
      ),
    ...opportunities
      .filter((opportunity) => isOpenOpportunity(opportunity) && !asText(opportunity.proxima_accion))
      .map((opportunity) =>
        moduleItem(
          'Oportunidad',
          asText(opportunity.oportunidad_id),
          asText(opportunity.titulo)
        )
      )
  ].filter((item) => item.id && item.title);

  return {
    count: items.length,
    items: items.slice(0, 5)
  };
}

function buildNextActions({
  opportunities,
  projects,
  tasks
}: {
  opportunities: DashboardRecord[];
  projects: DashboardRecord[];
  tasks: DashboardRecord[];
}) {
  const taskActions = tasks
    .filter((task) => isOpenTask(task))
    .sort((left, right) => compareDays(left.fecha_vencimiento, right.fecha_vencimiento))
    .slice(0, 3)
    .map((task) => ({
      done: false,
      id: asText(task.tarea_id),
      module: 'Tarea',
      title: asText(task.titulo)
    }));
  const projectActions = projects
    .filter((project) => isOpenProject(project) && asText(project.proxima_accion))
    .slice(0, 2)
    .map((project) => ({
      done: false,
      id: asText(project.proyecto_id),
      module: 'Proyecto',
      title: asText(project.proxima_accion)
    }));
  const opportunityActions = opportunities
    .filter((opportunity) => isOpenOpportunity(opportunity) && asText(opportunity.proxima_accion))
    .slice(0, 2)
    .map((opportunity) => ({
      done: false,
      id: asText(opportunity.oportunidad_id),
      module: 'Oportunidad',
      title: asText(opportunity.proxima_accion)
    }));

  return [...taskActions, ...projectActions, ...opportunityActions]
    .filter((action) => action.title)
    .slice(0, 6);
}

function buildRecentActivity(activityLog: DashboardRecord[]) {
  return [...activityLog]
    .sort((a, b) => asText(b.fecha).localeCompare(asText(a.fecha)))
    .slice(0, 6)
    .map((activity) => ({
      activity: humanize(activity.accion),
      date: asText(activity.fecha),
      detail: asText(activity.descripcion),
      id: asText(activity.log_id),
      module: asText(activity.entidad_tipo)
    }));
}

function buildDashboardPayload(
  repositories: EntityRepositories,
  now: () => Date
) {
  return Promise.all([
    repositories.clients.list(),
    repositories.ideas.list(),
    repositories.projects.list(),
    repositories.tasks.list(),
    repositories.opportunities.list(),
    repositories.invoices.list(),
    repositories.activityLog.list({ includeDeleted: true })
  ]).then(([clients, ideas, projects, tasks, opportunities, invoices, activityLog]) => {
    const todayMs = dayValue(dayKey(now())) ?? Date.now();
    const clientRecords = asRecordArray(clients);
    const ideaRecords = asRecordArray(ideas);
    const projectRecords = asRecordArray(projects);
    const taskRecords = asRecordArray(tasks);
    const opportunityRecords = asRecordArray(opportunities).filter(isOpenOpportunity);
    const invoiceRecords = asRecordArray(invoices);
    const activityRecords = asRecordArray(activityLog);
    const activeProjects = projectRecords.filter((project) => asText(project.estado) === 'activo');
    const projectTraffic = activeProjects.reduce<Record<Traffic, number>>(
      (counts, project) => {
        const traffic = asText(project.semaforo) as Traffic;

        if (traffic === 'verde' || traffic === 'amarillo' || traffic === 'rojo') {
          counts[traffic] += 1;
        }

        return counts;
      },
      { amarillo: 0, rojo: 0, verde: 0 }
    );
    const overdueTasks = taskRecords.filter((task) => {
      const dueMs = dayValue(task.fecha_vencimiento);

      return isOpenTask(task) && dueMs !== null && dueMs < todayMs;
    });
    const criticalTasks = overdueTasks.filter((task) => asText(task.prioridad) === 'critica');
    const tasksThisWeek = taskRecords.filter((task) => {
      const dueMs = dayValue(task.fecha_vencimiento);

      return (
        isOpenTask(task) &&
        dueMs !== null &&
        dueMs >= todayMs &&
        dueMs <= todayMs + 6 * DAY_MS
      );
    });
    const overdueInvoices = invoiceRecords.filter((invoice) => isInvoiceOverdue(invoice, todayMs));
    const billableInvoices = invoiceRecords.filter(
      (invoice) => asText(invoice.estado) === 'por_facturar'
    );
    const funnelValue = opportunityRecords.reduce(
      (sum, opportunity) => sum + asNumber(opportunity.valor_estimado),
      0
    );

    return {
      generatedAt: now().toISOString(),
      ideasByStatus: countByStatus(ideaRecords),
      invoiceBuckets: buildInvoiceBuckets(invoiceRecords, todayMs),
      metrics: {
        activeProjects: activeProjects.length,
        billableInvoices: billableInvoices.length,
        billableInvoiceValue: billableInvoices.reduce(
          (sum, invoice) => sum + asNumber(invoice.valor),
          0
        ),
        criticalTasks: criticalTasks.length,
        funnelValue,
        openOpportunities: opportunityRecords.length,
        overdueInvoices: overdueInvoices.length,
        overdueInvoiceValue: overdueInvoices.reduce(
          (sum, invoice) => sum + asNumber(invoice.valor),
          0
        ),
        redProjects: projectTraffic.rojo,
        tasksThisWeek: tasksThisWeek.length
      },
      missingNextActions: buildMissingNextActions({
        clients: clientRecords,
        ideas: ideaRecords,
        opportunities: opportunityRecords,
        projects: projectRecords
      }),
      nextActions: buildNextActions({
        opportunities: opportunityRecords,
        projects: projectRecords,
        tasks: taskRecords
      }),
      priorities: buildPriorities({
        invoices: invoiceRecords,
        projects: projectRecords,
        tasks: taskRecords,
        todayMs
      }),
      projectTraffic,
      recentActivity: buildRecentActivity(activityRecords),
      topProjects: activeProjects
        .sort((left, right) => {
          const rankDelta = trafficRank(left.semaforo) - trafficRank(right.semaforo);

          return rankDelta === 0
            ? compareDays(left.fecha_fin_estimada, right.fecha_fin_estimada)
            : rankDelta;
        })
        .slice(0, 5)
        .map((project) => ({
          deadline: asText(project.fecha_fin_estimada),
          id: asText(project.proyecto_id),
          state: asText(project.estado),
          title: asText(project.titulo),
          traffic: asText(project.semaforo),
          tone: trafficTone(project.semaforo)
        })),
      funnel: buildFunnel(opportunityRecords)
    };
  });
}

export async function buildDashboardResponse({
  cookieHeader,
  now = () => new Date(),
  repositoriesFactory,
  source = process.env
}: DashboardRequestContext): Promise<DashboardJsonResponse> {
  const resolved = await resolveRepositories({
    cookieHeader,
    repositoriesFactory,
    source
  });

  if ('error' in resolved) {
    return resolved.error;
  }

  try {
    return {
      body: await buildDashboardPayload(resolved.repositories, now),
      status: 200
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo generar el dashboard.';

    return jsonError(500, 'dashboard_failed', message);
  }
}
