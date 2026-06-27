import type { EntityRepositories } from '../repositories/entityRepositories.js';
import { calculateIdeaPriorityScore } from '../schemas/entities.js';
import type { WorkspaceAdapter, DriveResource } from './googleWorkspaceAdapter.js';

export type WorkspaceAction =
  | 'create_client_folder'
  | 'create_project_structure'
  | 'detect_overdue_invoices'
  | 'detect_overdue_tasks'
  | 'generate_idea_brief'
  | 'generate_invoice'
  | 'generate_project_brief'
  | 'generate_research_doc'
  | 'generate_weekly_report'
  | 'list_missing_next_actions'
  | 'recalculate_idea_scores'
  | 'recalculate_project_traffic';

type WorkspaceActionInput = {
  action: WorkspaceAction;
  entity?: string;
  id?: string;
};

type WorkspaceActionContext = {
  adapter: WorkspaceAdapter;
  now: () => Date;
  repositories: EntityRepositories;
};

const ACTOR = 'Germán';
const DAY_MS = 24 * 60 * 60 * 1000;
const PROJECT_SUBFOLDERS = [
  '01 Brief',
  '02 Investigacion',
  '03 Entregables',
  '04 Facturacion',
  '05 Cierre y Aprendizajes'
];
const OPEN_TASK_STATES = new Set(['backlog', 'pendiente', 'en_progreso', 'bloqueada', 'en_revision']);
const OPEN_OPPORTUNITY_STATES = new Set([
  'nueva',
  'calificada',
  'en_descubrimiento',
  'propuesta_pendiente',
  'propuesta_enviada',
  'negociacion'
]);
const OPEN_INVOICE_STATES = new Set(['por_facturar', 'borrador', 'facturada', 'vencida']);

function asText(value: unknown) {
  return String(value ?? '').trim();
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayStamp(value: unknown) {
  const text = asText(value).slice(0, 10);

  if (!text) {
    return null;
  }

  const stamp = Date.parse(`${text}T00:00:00.000Z`);

  return Number.isFinite(stamp) ? stamp : null;
}

function todayStamp(now: Date) {
  return Date.parse(`${dateKey(now)}T00:00:00.000Z`);
}

function cleanName(value: string) {
  return value.replace(/[\\/:*?"<>|#%{}[\]^~]/g, ' ').replace(/\s+/g, ' ').trim();
}

function optionalNumber(value: unknown) {
  if (asText(value) === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatMoney(value: unknown, currency: unknown) {
  const amount = Number(value ?? 0);
  const code = asText(currency) || 'COP';

  return new Intl.NumberFormat('es-CO', {
    currency: code,
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(Number.isFinite(amount) ? amount : 0);
}

function documentContent(title: string, placeholders: Record<string, string>) {
  const lines = [
    title,
    '',
    `Fecha: ${placeholders['{{fecha}}'] ?? ''}`,
    `Cliente: ${placeholders['{{cliente}}'] ?? ''}`,
    `Estado: ${placeholders['{{estado}}'] ?? ''}`,
    '',
    'Descripcion',
    placeholders['{{descripcion}}'] ?? '',
    '',
    'Proxima accion',
    placeholders['{{proxima_accion}}'] ?? ''
  ];

  return `${lines.join('\n')}\n`;
}

function isOpenTask(task: Record<string, unknown>) {
  return OPEN_TASK_STATES.has(asText(task.estado));
}

function isOverdue(value: unknown, today: number) {
  const due = dayStamp(value);

  return due !== null && due < today;
}

function isDueSoon(value: unknown, today: number) {
  const due = dayStamp(value);

  return due !== null && due >= today && due <= today + 7 * DAY_MS;
}

async function optionalConfig(repositories: EntityRepositories, key: string) {
  try {
    const record = await repositories.configuration.get(key);

    return asText(record.valor);
  } catch {
    return '';
  }
}

async function requiredRootFolderId(repositories: EntityRepositories) {
  const rootFolderId = await optionalConfig(repositories, 'DRIVE_ROOT_FOLDER_ID');

  if (!rootFolderId) {
    throw new Error('No se encontró DRIVE_ROOT_FOLDER_ID. Ejecuta Inicializar sistema.');
  }

  return rootFolderId;
}

async function getClientName(repositories: EntityRepositories, clientId: unknown) {
  const id = asText(clientId);

  if (!id) {
    return 'Startup Interna';
  }

  try {
    const client = await repositories.clients.get(id);

    return asText(client.nombre) || id;
  } catch {
    return id;
  }
}

async function ensureClientFolder(
  repositories: EntityRepositories,
  adapter: WorkspaceAdapter,
  clientId: string
) {
  const client = await repositories.clients.get(clientId);

  if (asText(client.drive_folder_id)) {
    return {
      folder: {
        id: asText(client.drive_folder_id),
        name: `Cliente - ${asText(client.nombre)}`,
        url: asText(client.drive_folder_url)
      },
      record: client
    };
  }

  const folder = await prepareClientFolderFields(repositories, adapter, {
    nombre: client.nombre
  });
  const record = await repositories.clients.update(
    clientId,
    {
      drive_folder_id: folder.drive_folder_id,
      drive_folder_url: folder.drive_folder_url
    },
    { actor: ACTOR }
  );

  return {
    folder: {
      id: folder.drive_folder_id,
      name: `Cliente - ${asText(client.nombre)}`,
      url: folder.drive_folder_url
    },
    record
  };
}

export async function prepareClientFolderFields(
  repositories: EntityRepositories,
  adapter: WorkspaceAdapter,
  payload: Record<string, unknown>
) {
  const rootFolderId = await requiredRootFolderId(repositories);
  const folder = await adapter.ensureFolder({
    name: `Cliente - ${cleanName(asText(payload.nombre) || 'Sin nombre')}`,
    parentId: rootFolderId
  });

  return {
    drive_folder_id: folder.id,
    drive_folder_url: folder.url
  };
}

async function resolveProjectParent(
  repositories: EntityRepositories,
  adapter: WorkspaceAdapter,
  clientId: unknown
) {
  const id = asText(clientId);

  if (!id) {
    return requiredRootFolderId(repositories);
  }

  try {
    const { folder } = await ensureClientFolder(repositories, adapter, id);

    return folder.id;
  } catch {
    return requiredRootFolderId(repositories);
  }
}

export async function prepareProjectFolderFields(
  repositories: EntityRepositories,
  adapter: WorkspaceAdapter,
  payload: Record<string, unknown>
) {
  const parentId = await resolveProjectParent(repositories, adapter, payload.cliente_id);
  const folder = await adapter.ensureFolder({
    name: `Proyecto - ${cleanName(asText(payload.titulo) || 'Sin titulo')}`,
    parentId
  });

  await Promise.all(
    PROJECT_SUBFOLDERS.map((name) =>
      adapter.ensureFolder({
        name,
        parentId: folder.id
      })
    )
  );

  return {
    drive_folder_id: folder.id,
    drive_folder_url: folder.url
  };
}

async function ensureProjectStructure(
  repositories: EntityRepositories,
  adapter: WorkspaceAdapter,
  projectId: string
) {
  const project = await repositories.projects.get(projectId);

  if (asText(project.drive_folder_id)) {
    return {
      folder: {
        id: asText(project.drive_folder_id),
        name: `Proyecto - ${asText(project.titulo)}`,
        url: asText(project.drive_folder_url)
      },
      record: project
    };
  }

  const fields = await prepareProjectFolderFields(repositories, adapter, {
    cliente_id: project.cliente_id,
    titulo: project.titulo
  });
  const record = await repositories.projects.update(projectId, fields, { actor: ACTOR });

  return {
    folder: {
      id: fields.drive_folder_id,
      name: `Proyecto - ${asText(project.titulo)}`,
      url: fields.drive_folder_url
    },
    record
  };
}

async function recordDocument({
  document,
  driveFolderId,
  entityId,
  entityType,
  repositories,
  title,
  type
}: {
  document: DriveResource;
  driveFolderId: string;
  entityId: string;
  entityType: string;
  repositories: EntityRepositories;
  title: string;
  type:
    | 'factura'
    | 'idea_brief'
    | 'investigacion'
    | 'proyecto_brief'
    | 'reporte';
}) {
  return repositories.documents.create(
    {
      drive_folder_id: driveFolderId,
      entidad_id: entityId,
      entidad_tipo: entityType,
      google_doc_id: document.id,
      google_doc_url: document.url,
      tipo: type,
      titulo: title
    },
    { actor: ACTOR }
  );
}

async function generateIdeaBrief({ adapter, now, repositories }: WorkspaceActionContext, id: string) {
  const idea = await repositories.ideas.get(id);
  const date = dateKey(now());
  const clientName = await getClientName(repositories, idea.cliente_id);
  const folderId = asText(idea.drive_folder_id)
    || (await resolveProjectParent(repositories, adapter, idea.cliente_id));
  const title = `Brief de idea - ${asText(idea.titulo)}`;
  const placeholders = {
    '{{cliente}}': clientName,
    '{{descripcion}}': asText(idea.descripcion),
    '{{estado}}': asText(idea.estado),
    '{{fecha}}': date,
    '{{proxima_accion}}': asText(idea.proxima_accion),
    '{{titulo}}': asText(idea.titulo)
  };
  const document = await adapter.createDocument({
    content: documentContent(title, placeholders),
    folderId,
    placeholders,
    templateId: await optionalConfig(repositories, 'TEMPLATE_IDEA_BRIEF_ID'),
    title
  });
  const record = await repositories.ideas.update(
    id,
    {
      doc_id: document.id,
      doc_url: document.url
    },
    { actor: ACTOR }
  );
  const documentRecord = await recordDocument({
    document,
    driveFolderId: folderId,
    entityId: id,
    entityType: 'ideas',
    repositories,
    title,
    type: 'idea_brief'
  });

  return { document, documentRecord, record };
}

async function generateProjectBrief(
  { adapter, now, repositories }: WorkspaceActionContext,
  id: string
) {
  const { folder, record: project } = await ensureProjectStructure(repositories, adapter, id);
  const date = dateKey(now());
  const clientName = await getClientName(repositories, project.cliente_id);
  const title = `Brief de proyecto - ${asText(project.titulo)}`;
  const placeholders = {
    '{{cliente}}': clientName,
    '{{descripcion}}': asText(project.descripcion || project.objetivo),
    '{{estado}}': asText(project.estado),
    '{{fecha}}': date,
    '{{proxima_accion}}': asText(project.proxima_accion),
    '{{titulo}}': asText(project.titulo)
  };
  const document = await adapter.createDocument({
    content: documentContent(title, placeholders),
    folderId: folder.id,
    placeholders,
    templateId: await optionalConfig(repositories, 'TEMPLATE_PROJECT_BRIEF_ID'),
    title
  });
  const record = await repositories.projects.update(
    id,
    {
      doc_brief_id: document.id,
      doc_brief_url: document.url
    },
    { actor: ACTOR }
  );
  const documentRecord = await recordDocument({
    document,
    driveFolderId: folder.id,
    entityId: id,
    entityType: 'projects',
    repositories,
    title,
    type: 'proyecto_brief'
  });

  return { document, documentRecord, record };
}

async function generateInvoice({ adapter, now, repositories }: WorkspaceActionContext, id: string) {
  const invoice = await repositories.invoices.get(id);
  const projectId = asText(invoice.proyecto_id);
  const folderId = projectId
    ? (await ensureProjectStructure(repositories, adapter, projectId)).folder.id
    : await resolveProjectParent(repositories, adapter, invoice.cliente_id);
  const date = dateKey(now());
  const clientName = await getClientName(repositories, invoice.cliente_id);
  const title = `Factura - ${asText(invoice.concepto)}`;
  const placeholders = {
    '{{cliente}}': clientName,
    '{{descripcion}}': `${asText(invoice.concepto)} - ${formatMoney(invoice.valor, invoice.moneda)}`,
    '{{estado}}': asText(invoice.estado),
    '{{fecha}}': date,
    '{{proxima_accion}}': 'Enviar factura y hacer seguimiento de pago',
    '{{titulo}}': asText(invoice.concepto)
  };
  const document = await adapter.createDocument({
    content: documentContent(title, placeholders),
    folderId,
    placeholders,
    templateId: await optionalConfig(repositories, 'TEMPLATE_INVOICE_ID'),
    title
  });
  const record = await repositories.invoices.update(
    id,
    {
      doc_id: document.id,
      doc_url: document.url
    },
    { actor: ACTOR }
  );
  const documentRecord = await recordDocument({
    document,
    driveFolderId: folderId,
    entityId: id,
    entityType: 'invoices',
    repositories,
    title,
    type: 'factura'
  });

  return { document, documentRecord, record };
}

async function generateResearchDoc(
  { adapter, now, repositories }: WorkspaceActionContext,
  id: string
) {
  const research = await repositories.research.get(id);
  const folderId = asText(research.cliente_id)
    ? await resolveProjectParent(repositories, adapter, research.cliente_id)
    : await requiredRootFolderId(repositories);
  const date = dateKey(now());
  const title = `Investigacion - ${asText(research.titulo)}`;
  const placeholders = {
    '{{cliente}}': await getClientName(repositories, research.cliente_id),
    '{{descripcion}}': asText(research.problema || research.hallazgos || research.recomendacion),
    '{{estado}}': asText(research.estado),
    '{{fecha}}': date,
    '{{proxima_accion}}': asText(research.recomendacion),
    '{{titulo}}': asText(research.titulo)
  };
  const document = await adapter.createDocument({
    content: documentContent(title, placeholders),
    folderId,
    placeholders,
    templateId: await optionalConfig(repositories, 'TEMPLATE_RESEARCH_ID'),
    title
  });
  const record = await repositories.research.update(
    id,
    {
      doc_id: document.id,
      doc_url: document.url
    },
    { actor: ACTOR }
  );
  const documentRecord = await recordDocument({
    document,
    driveFolderId: folderId,
    entityId: id,
    entityType: 'research',
    repositories,
    title,
    type: 'investigacion'
  });

  return { document, documentRecord, record };
}

async function generateWeeklyReport({ adapter, now, repositories }: WorkspaceActionContext) {
  const date = dateKey(now());
  const [projects, tasks, opportunities, invoices] = await Promise.all([
    repositories.projects.list(),
    repositories.tasks.list(),
    repositories.opportunities.list(),
    repositories.invoices.list()
  ]);
  const activeProjects = projects.filter((project) => asText(project.estado) === 'activo');
  const openTasks = tasks.filter((task) =>
    ['backlog', 'pendiente', 'en_progreso', 'bloqueada', 'en_revision'].includes(asText(task.estado))
  );
  const openOpportunities = opportunities.filter((opportunity) =>
    [
      'nueva',
      'calificada',
      'en_descubrimiento',
      'propuesta_pendiente',
      'propuesta_enviada',
      'negociacion'
    ].includes(asText(opportunity.estado))
  );
  const pendingInvoices = invoices.filter((invoice) =>
    ['por_facturar', 'borrador', 'facturada', 'vencida'].includes(asText(invoice.estado))
  );
  const title = `Reporte semanal - ${date}`;
  const folderId = await requiredRootFolderId(repositories);
  const placeholders = {
    '{{cliente}}': 'Startup OS Personal',
    '{{descripcion}}': [
      `Proyectos activos: ${activeProjects.length}`,
      `Tareas abiertas: ${openTasks.length}`,
      `Oportunidades abiertas: ${openOpportunities.length}`,
      `Facturas pendientes: ${pendingInvoices.length}`
    ].join('\n'),
    '{{estado}}': 'generado',
    '{{fecha}}': date,
    '{{proxima_accion}}': 'Revisar prioridades y cerrar pendientes críticos',
    '{{titulo}}': title
  };
  const document = await adapter.createDocument({
    content: documentContent(title, placeholders),
    folderId,
    placeholders,
    templateId: await optionalConfig(repositories, 'TEMPLATE_WEEKLY_REPORT_ID'),
    title
  });
  const documentRecord = await recordDocument({
    document,
    driveFolderId: folderId,
    entityId: `weekly-${date}`,
    entityType: 'automations',
    repositories,
    title,
    type: 'reporte'
  });

  return { document, documentRecord };
}

async function recalculateIdeaScores({ repositories }: WorkspaceActionContext) {
  const ideas = await repositories.ideas.list();
  let scoredIdeas = 0;
  let updatedIdeas = 0;
  const items = [];

  for (const idea of ideas) {
    const record = idea as Record<string, unknown>;
    const id = asText(record.idea_id);
    const impacto = optionalNumber(record.impacto);
    const dineroPotencial = optionalNumber(record.dinero_potencial);
    const urgencia = optionalNumber(record.urgencia);
    const esfuerzo = optionalNumber(record.esfuerzo);

    if (
      !id ||
      impacto === null ||
      dineroPotencial === null ||
      urgencia === null ||
      esfuerzo === null
    ) {
      continue;
    }

    const score = calculateIdeaPriorityScore({
      dinero_potencial: dineroPotencial,
      esfuerzo,
      impacto,
      urgencia
    });
    const previousScore = optionalNumber(record.score_prioridad);
    const changed = previousScore !== score;

    scoredIdeas += 1;

    if (changed) {
      await repositories.ideas.update(id, { score_prioridad: score }, { actor: ACTOR });
      updatedIdeas += 1;
    }

    items.push({
      id,
      previousScore,
      score,
      title: asText(record.titulo) || id,
      updated: changed
    });
  }

  return {
    items,
    summary: {
      scoredIdeas,
      totalIdeas: ideas.length,
      updatedIdeas
    }
  };
}

function projectTraffic(
  project: Record<string, unknown>,
  tasks: Array<Record<string, unknown>>,
  today: number
) {
  const hasCriticalOverdueTask = tasks.some(
    (task) => asText(task.prioridad) === 'critica' && isOverdue(task.fecha_vencimiento, today)
  );
  const hasCriticalBlockedTask = tasks.some(
    (task) => asText(task.prioridad) === 'critica' && asText(task.estado) === 'bloqueada'
  );
  const lacksNextAction = !asText(project.proxima_accion);

  if (hasCriticalOverdueTask) {
    return { reason: 'Tarea critica vencida', traffic: 'rojo' as const };
  }

  if (hasCriticalBlockedTask) {
    return { reason: 'Tarea critica bloqueada', traffic: 'rojo' as const };
  }

  if (lacksNextAction) {
    return { reason: 'Proyecto activo sin proxima accion', traffic: 'rojo' as const };
  }

  if (tasks.some((task) => isOverdue(task.fecha_vencimiento, today))) {
    return { reason: 'Tareas vencidas no criticas', traffic: 'amarillo' as const };
  }

  if (isDueSoon(project.fecha_fin_estimada, today)) {
    return { reason: 'Vencimiento proximo', traffic: 'amarillo' as const };
  }

  return { reason: 'Sin bloqueos ni vencimientos relevantes', traffic: 'verde' as const };
}

async function recalculateProjectTraffic({ now, repositories }: WorkspaceActionContext) {
  const [projects, tasks] = await Promise.all([
    repositories.projects.list(),
    repositories.tasks.list()
  ]);
  const today = todayStamp(now());
  const openTasks = tasks
    .map((task) => task as Record<string, unknown>)
    .filter(isOpenTask);
  const items = [];
  const summary = {
    activeProjects: 0,
    amarillo: 0,
    rojo: 0,
    updatedProjects: 0,
    verde: 0
  };

  for (const project of projects) {
    const record = project as Record<string, unknown>;

    if (asText(record.estado) !== 'activo') {
      continue;
    }

    const id = asText(record.proyecto_id);
    const projectTasks = openTasks.filter((task) => asText(task.proyecto_id) === id);
    const traffic = projectTraffic(record, projectTasks, today);
    const previousTraffic = asText(record.semaforo);
    const changed = id && previousTraffic !== traffic.traffic;

    summary.activeProjects += 1;
    summary[traffic.traffic] += 1;

    if (changed) {
      await repositories.projects.update(id, { semaforo: traffic.traffic }, { actor: ACTOR });
      summary.updatedProjects += 1;
    }

    items.push({
      id,
      previousTraffic,
      reason: traffic.reason,
      title: asText(record.titulo) || id,
      traffic: traffic.traffic,
      updated: Boolean(changed)
    });
  }

  return { items, summary };
}

async function detectOverdueTasks({ now, repositories }: WorkspaceActionContext) {
  const today = todayStamp(now());
  const tasks = await repositories.tasks.list();
  const overdueTasks = tasks
    .map((task) => task as Record<string, unknown>)
    .filter((task) => isOpenTask(task) && isOverdue(task.fecha_vencimiento, today))
    .sort((a, b) => (dayStamp(a.fecha_vencimiento) ?? 0) - (dayStamp(b.fecha_vencimiento) ?? 0));
  const items = overdueTasks.map((task) => ({
    dueDate: asText(task.fecha_vencimiento),
    id: asText(task.tarea_id),
    priority: asText(task.prioridad),
    projectId: asText(task.proyecto_id),
    state: asText(task.estado),
    title: asText(task.titulo) || asText(task.tarea_id)
  }));

  return {
    items,
    summary: {
      criticalOverdueTasks: overdueTasks.filter((task) => asText(task.prioridad) === 'critica')
        .length,
      overdueTasks: overdueTasks.length
    }
  };
}

async function detectOverdueInvoices({ now, repositories }: WorkspaceActionContext) {
  const today = todayStamp(now());
  const invoices = await repositories.invoices.list();
  const overdueInvoices = invoices
    .map((invoice) => invoice as Record<string, unknown>)
    .filter(
      (invoice) =>
        OPEN_INVOICE_STATES.has(asText(invoice.estado)) &&
        isOverdue(invoice.fecha_vencimiento, today)
    )
    .sort((a, b) => (dayStamp(a.fecha_vencimiento) ?? 0) - (dayStamp(b.fecha_vencimiento) ?? 0));
  let updatedInvoices = 0;
  const items = [];

  for (const invoice of overdueInvoices) {
    const id = asText(invoice.factura_id);
    const state = asText(invoice.estado);
    const shouldUpdate = id && state !== 'vencida';

    if (shouldUpdate) {
      await repositories.invoices.update(id, { estado: 'vencida' }, { actor: ACTOR });
      updatedInvoices += 1;
    }

    items.push({
      dueDate: asText(invoice.fecha_vencimiento),
      id,
      state: shouldUpdate ? 'vencida' : state,
      title: asText(invoice.concepto) || id,
      updated: Boolean(shouldUpdate),
      value: Number(invoice.valor ?? 0)
    });
  }

  return {
    items,
    summary: {
      overdueInvoiceValue: overdueInvoices.reduce((sum, invoice) => {
        const value = Number(invoice.valor ?? 0);

        return Number.isFinite(value) ? sum + value : sum;
      }, 0),
      overdueInvoices: overdueInvoices.length,
      updatedInvoices
    }
  };
}

async function listMissingNextActions({ repositories }: WorkspaceActionContext) {
  const [clients, ideas, projects, opportunities] = await Promise.all([
    repositories.clients.list(),
    repositories.ideas.list(),
    repositories.projects.list(),
    repositories.opportunities.list()
  ]);
  const items = [
    ...clients
      .map((client) => client as Record<string, unknown>)
      .filter((client) => asText(client.estado) !== 'inactivo' && !asText(client.proxima_accion))
      .map((client) => ({
        entity: 'clients',
        id: asText(client.cliente_id),
        module: 'Cliente',
        state: asText(client.estado),
        title: asText(client.nombre) || asText(client.cliente_id)
      })),
    ...ideas
      .map((idea) => idea as Record<string, unknown>)
      .filter(
        (idea) =>
          !['archivada', 'descartada'].includes(asText(idea.estado)) &&
          !asText(idea.proxima_accion)
      )
      .map((idea) => ({
        entity: 'ideas',
        id: asText(idea.idea_id),
        module: 'Idea',
        state: asText(idea.estado),
        title: asText(idea.titulo) || asText(idea.idea_id)
      })),
    ...projects
      .map((project) => project as Record<string, unknown>)
      .filter(
        (project) =>
          ['activo', 'planeado', 'bloqueado', 'en_revision'].includes(asText(project.estado)) &&
          !asText(project.proxima_accion)
      )
      .map((project) => ({
        entity: 'projects',
        id: asText(project.proyecto_id),
        module: 'Proyecto',
        state: asText(project.estado),
        title: asText(project.titulo) || asText(project.proyecto_id)
      })),
    ...opportunities
      .map((opportunity) => opportunity as Record<string, unknown>)
      .filter(
        (opportunity) =>
          OPEN_OPPORTUNITY_STATES.has(asText(opportunity.estado)) &&
          !asText(opportunity.proxima_accion)
      )
      .map((opportunity) => ({
        entity: 'opportunities',
        id: asText(opportunity.oportunidad_id),
        module: 'Oportunidad',
        state: asText(opportunity.estado),
        title: asText(opportunity.titulo) || asText(opportunity.oportunidad_id)
      }))
  ];

  return {
    items,
    summary: {
      missingNextActions: items.length
    }
  };
}

export async function runWorkspaceAction(input: WorkspaceActionInput, context: WorkspaceActionContext) {
  if (input.action === 'generate_weekly_report') {
    return {
      action: input.action,
      ...(await generateWeeklyReport(context))
    };
  }

  if (input.action === 'recalculate_idea_scores') {
    return {
      action: input.action,
      ...(await recalculateIdeaScores(context))
    };
  }

  if (input.action === 'recalculate_project_traffic') {
    return {
      action: input.action,
      ...(await recalculateProjectTraffic(context))
    };
  }

  if (input.action === 'detect_overdue_tasks') {
    return {
      action: input.action,
      ...(await detectOverdueTasks(context))
    };
  }

  if (input.action === 'detect_overdue_invoices') {
    return {
      action: input.action,
      ...(await detectOverdueInvoices(context))
    };
  }

  if (input.action === 'list_missing_next_actions') {
    return {
      action: input.action,
      ...(await listMissingNextActions(context))
    };
  }

  if (!input.id) {
    throw new Error('Esta acción requiere id.');
  }

  if (input.action === 'create_client_folder') {
    const { folder, record } = await ensureClientFolder(context.repositories, context.adapter, input.id);

    return {
      action: input.action,
      folder,
      record
    };
  }

  if (input.action === 'create_project_structure') {
    const { folder, record } = await ensureProjectStructure(
      context.repositories,
      context.adapter,
      input.id
    );

    return {
      action: input.action,
      folder,
      record
    };
  }

  if (input.action === 'generate_idea_brief') {
    return {
      action: input.action,
      ...(await generateIdeaBrief(context, input.id))
    };
  }

  if (input.action === 'generate_project_brief') {
    return {
      action: input.action,
      ...(await generateProjectBrief(context, input.id))
    };
  }

  if (input.action === 'generate_invoice') {
    return {
      action: input.action,
      ...(await generateInvoice(context, input.id))
    };
  }

  if (input.action === 'generate_research_doc') {
    return {
      action: input.action,
      ...(await generateResearchDoc(context, input.id))
    };
  }

  throw new Error(`Acción no soportada: ${input.action}`);
}
