import { ZodError, z } from 'zod';

import { getGoogleAuthConfig, type GoogleAuthConfig } from '../auth/config.js';
import { getSessionFromCookieHeader, type AuthSession } from '../auth/session.js';
import { createGoogleEntityRepositories } from '../entities/googleContext.js';
import type { EntityRepositories } from '../repositories/entityRepositories.js';
import { runWorkspaceAction } from './actions.js';
import {
  createGoogleWorkspaceAdapter,
  type WorkspaceAdapter
} from './googleWorkspaceAdapter.js';

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;
type QueryValue = string | string[] | undefined;

export type WorkspaceJsonResponse = {
  body: unknown;
  status: number;
};

export type WorkspaceRepositoriesFactory = (
  session: AuthSession,
  config: GoogleAuthConfig,
  source: EnvSource
) => Promise<EntityRepositories>;

export type WorkspaceAdapterFactory = (
  session: AuthSession,
  config: GoogleAuthConfig,
  source: EnvSource
) => Promise<WorkspaceAdapter>;

type WorkspaceRequestContext = {
  adapterFactory?: WorkspaceAdapterFactory;
  body?: unknown;
  cookieHeader: string | undefined;
  method: string | undefined;
  now?: () => Date;
  query?: Record<string, QueryValue>;
  repositoriesFactory?: WorkspaceRepositoriesFactory;
  source?: EnvSource;
};

const workspaceActionSchema = z.object({
  action: z.enum([
    'create_client_folder',
    'create_project_structure',
    'detect_overdue_invoices',
    'detect_overdue_tasks',
    'generate_idea_brief',
    'generate_invoice',
    'generate_project_brief',
    'generate_research_doc',
    'generate_weekly_report',
    'list_missing_next_actions',
    'recalculate_idea_scores',
    'recalculate_project_traffic'
  ]),
  entity: z.string().optional(),
  id: z.string().optional()
});

function singleQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function jsonError(status: number, error: string, message: string): WorkspaceJsonResponse {
  return {
    body: { error, message },
    status
  };
}

async function resolveWorkspace({
  adapterFactory = async (session, config) => createGoogleWorkspaceAdapter(session, config),
  cookieHeader,
  repositoriesFactory = createGoogleEntityRepositories,
  source = process.env
}: Pick<
  WorkspaceRequestContext,
  'adapterFactory' | 'cookieHeader' | 'repositoriesFactory' | 'source'
>): Promise<
  | { error: WorkspaceJsonResponse }
  | {
      adapter: WorkspaceAdapter;
      repositories: EntityRepositories;
      session: AuthSession;
    }
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
        'Configura Google OAuth antes de usar Drive y Docs.'
      )
    };
  }

  const session = getSessionFromCookieHeader(cookieHeader, config);

  if (!session || session.email.toLowerCase() !== config.allowedGoogleEmail) {
    return {
      error: jsonError(401, 'google_not_connected', 'Conecta Google antes de usar Drive y Docs.')
    };
  }

  return {
    adapter: await adapterFactory(session, config, source),
    repositories: await repositoriesFactory(session, config, source),
    session
  };
}

function handleWorkspaceError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      body: {
        details: error.issues,
        error: 'validation_failed',
        message: 'La acción de workspace no cumple el schema requerido.'
      },
      status: 400
    };
  }

  const message = error instanceof Error ? error.message : 'No se pudo procesar la acción.';

  if (message.includes('not found')) {
    return jsonError(404, 'record_not_found', message);
  }

  return jsonError(500, 'workspace_operation_failed', message);
}

export async function buildWorkspaceResponse({
  adapterFactory,
  body,
  cookieHeader,
  method = 'GET',
  now = () => new Date(),
  query,
  repositoriesFactory,
  source = process.env
}: WorkspaceRequestContext): Promise<WorkspaceJsonResponse> {
  if (method !== 'GET' && method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'Método no permitido.');
  }

  const resolved = await resolveWorkspace({
    adapterFactory,
    cookieHeader,
    repositoriesFactory,
    source
  });

  if ('error' in resolved) {
    return resolved.error;
  }

  try {
    if (method === 'GET') {
      const view = singleQueryValue(query?.view);

      if (view !== 'documents') {
        return jsonError(400, 'unsupported_view', 'Vista de workspace no soportada.');
      }

      return {
        body: {
          documents: await resolved.repositories.documents.list({
            includeDeleted: true
          })
        },
        status: 200
      };
    }

    const actionInput = workspaceActionSchema.parse(body);

    return {
      body: await runWorkspaceAction(actionInput, {
        adapter: resolved.adapter,
        now,
        repositories: resolved.repositories
      }),
      status: 200
    };
  } catch (error) {
    return handleWorkspaceError(error);
  }
}
