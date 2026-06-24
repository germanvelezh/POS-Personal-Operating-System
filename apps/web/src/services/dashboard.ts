import type { BadgeTone } from '../components/ui/Badge';

export type DashboardTone = BadgeTone;

export type DashboardPriority = {
  due: string;
  id: string;
  module: string;
  title: string;
  tone: DashboardTone;
};

export type DashboardProject = {
  deadline: string;
  id: string;
  state: string;
  title: string;
  tone: DashboardTone;
  traffic: string;
};

export type DashboardFunnelStage = {
  count: number;
  stage: string;
  value: number;
  width: number;
};

export type DashboardInvoiceBucket = {
  count: number;
  label: string;
  percent: number;
  tone: 'amber' | 'green' | 'red';
  value: number;
};

export type DashboardAction = {
  done: boolean;
  id: string;
  module: string;
  title: string;
};

export type DashboardActivity = {
  activity: string;
  date: string;
  detail: string;
  id: string;
  module: string;
};

export type DashboardPayload = {
  generatedAt: string;
  ideasByStatus: Record<string, number>;
  invoiceBuckets: DashboardInvoiceBucket[];
  metrics: {
    activeProjects: number;
    billableInvoices: number;
    billableInvoiceValue: number;
    criticalTasks: number;
    funnelValue: number;
    openOpportunities: number;
    overdueInvoices: number;
    overdueInvoiceValue: number;
    redProjects: number;
    tasksThisWeek: number;
  };
  missingNextActions: {
    count: number;
    items: Array<{
      id: string;
      module: string;
      title: string;
    }>;
  };
  nextActions: DashboardAction[];
  priorities: DashboardPriority[];
  projectTraffic: {
    amarillo: number;
    rojo: number;
    verde: number;
  };
  recentActivity: DashboardActivity[];
  topProjects: DashboardProject[];
  funnel: DashboardFunnelStage[];
};

export const emptyDashboard: DashboardPayload = {
  generatedAt: new Date(0).toISOString(),
  ideasByStatus: {},
  invoiceBuckets: [],
  metrics: {
    activeProjects: 0,
    billableInvoices: 0,
    billableInvoiceValue: 0,
    criticalTasks: 0,
    funnelValue: 0,
    openOpportunities: 0,
    overdueInvoices: 0,
    overdueInvoiceValue: 0,
    redProjects: 0,
    tasksThisWeek: 0
  },
  missingNextActions: {
    count: 0,
    items: []
  },
  nextActions: [],
  priorities: [],
  projectTraffic: {
    amarillo: 0,
    rojo: 0,
    verde: 0
  },
  recentActivity: [],
  topProjects: [],
  funnel: []
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : 'No se pudo cargar el dashboard.';

    throw new Error(message);
  }

  return payload as T;
}

function normalizeDashboardPayload(payload: Partial<DashboardPayload> | null): DashboardPayload {
  const source = payload ?? {};

  return {
    ...emptyDashboard,
    ...source,
    metrics: {
      ...emptyDashboard.metrics,
      ...source.metrics
    },
    projectTraffic: {
      ...emptyDashboard.projectTraffic,
      ...source.projectTraffic
    },
    missingNextActions: {
      ...emptyDashboard.missingNextActions,
      ...source.missingNextActions,
      items: source.missingNextActions?.items ?? emptyDashboard.missingNextActions.items
    },
    ideasByStatus: source.ideasByStatus ?? emptyDashboard.ideasByStatus,
    invoiceBuckets: source.invoiceBuckets ?? emptyDashboard.invoiceBuckets,
    nextActions: source.nextActions ?? emptyDashboard.nextActions,
    priorities: source.priorities ?? emptyDashboard.priorities,
    recentActivity: source.recentActivity ?? emptyDashboard.recentActivity,
    topProjects: source.topProjects ?? emptyDashboard.topProjects,
    funnel: source.funnel ?? emptyDashboard.funnel
  };
}

export async function fetchDashboard() {
  const response = await fetch('/api/dashboard', {
    credentials: 'include'
  });

  const payload = await parseJsonResponse<Partial<DashboardPayload> | null>(response);

  return normalizeDashboardPayload(payload);
}
