import type { EntityKey, EntityRecord } from './entities';

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

export type WorkspaceDocument = {
  id: string;
  name: string;
  url: string;
};

export type WorkspaceActionItem = {
  dueDate?: string;
  entity?: string;
  id?: string;
  module?: string;
  priority?: string;
  reason?: string;
  score?: number;
  state?: string;
  title?: string;
  traffic?: string;
  updated?: boolean;
  value?: number;
};

export type WorkspaceActionResponse = {
  action: WorkspaceAction;
  document?: WorkspaceDocument;
  folder?: WorkspaceDocument;
  items?: WorkspaceActionItem[];
  record?: EntityRecord;
  summary?: Record<string, boolean | number | string | null | undefined>;
};

export type WorkspaceDocumentRecord = {
  documento_id: string;
  entidad_id?: string;
  entidad_tipo?: string;
  fecha_creacion?: string;
  google_doc_id?: string;
  google_doc_url: string;
  tipo: string;
  titulo: string;
};

type WorkspaceDocumentsResponse = {
  documents: WorkspaceDocumentRecord[];
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : 'No se pudo ejecutar la acción.';

    throw new Error(message);
  }

  return payload as T;
}

export async function runWorkspaceAction({
  action,
  entity,
  id
}: {
  action: WorkspaceAction;
  entity?: EntityKey;
  id?: string;
}) {
  const response = await fetch('/api/workspace', {
    body: JSON.stringify({ action, entity, id }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });

  return parseJsonResponse<WorkspaceActionResponse>(response);
}

export async function fetchWorkspaceDocuments() {
  const response = await fetch('/api/workspace?view=documents', {
    credentials: 'include'
  });
  const payload = await parseJsonResponse<WorkspaceDocumentsResponse>(response);

  return payload.documents;
}
